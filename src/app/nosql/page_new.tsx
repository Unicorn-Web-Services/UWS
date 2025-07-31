"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Database,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Play,
  Server,
  FileText,
  Plus,
  Search,
  Trash2,
  Layers,
  Edit,
  Save,
  X,
  Terminal,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/lib/toast-context";
import DashboardLayout from "@/components/dashboard-layout";
import { apiService } from "@/lib/api";

interface NoSQLService {
  service_id: string;
  container_id: string;
  node_id: string;
  ip_address: string;
  port: number;
  status: string;
  is_healthy: boolean;
  created_at: string;
  service_url: string;
}

interface NoSQLEntity {
  _id: string;
  [key: string]: any;
}

export default function NoSQLPage() {
  const { toast } = useToast();
  const [nosqlServices, setNoSQLServices] = useState<NoSQLService[]>([]);
  const [currentService, setCurrentService] = useState<NoSQLService | null>(
    null
  );
  const [collections, setCollections] = useState<string[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string>("");
  const [documents, setDocuments] = useState<NoSQLEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [launchingService, setLaunchingService] = useState(false);
  const [creatingCollection, setCreatingCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [savingEntity, setSavingEntity] = useState(false);
  const [entityData, setEntityData] = useState("");
  const [queryField, setQueryField] = useState("");
  const [queryValue, setQueryValue] = useState("");
  const [queryResult, setQueryResult] = useState<NoSQLEntity[]>([]);
  const [editingEntity, setEditingEntity] = useState<NoSQLEntity | null>(null);
  const [editEntityData, setEditEntityData] = useState("");

  useEffect(() => {
    fetchNoSQLServices();
  }, []);

  const fetchNoSQLServices = async () => {
    try {
      setLoading(true);
      const response = await apiService.getNoSQLServices();
      setNoSQLServices(response.nosql_services);

      // If we have services, use the first healthy one
      const healthyService = response.nosql_services.find(
        (service) => service.is_healthy
      );
      if (healthyService) {
        setCurrentService(healthyService);
        await fetchCollections(healthyService.service_id);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch NoSQL services",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCollections = async (serviceId: string) => {
    try {
      const response = await apiService.getNoSQLCollections(serviceId);
      setCollections(response.collections.collections);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch collections",
        variant: "destructive",
      });
    }
  };

  const fetchDocuments = async (collectionName: string) => {
    if (!currentService) return;

    try {
      const response = await apiService.scanNoSQLCollection(
        currentService.service_id,
        collectionName
      );
      setDocuments(response.documents);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch documents",
        variant: "destructive",
      });
    }
  };

  const launchNoSQLService = async () => {
    try {
      setLaunchingService(true);
      const service = await apiService.launchNoSQLService();

      toast({
        title: "Success",
        description: "NoSQL service launched successfully",
        variant: "success",
      });

      // Refresh the services list
      await fetchNoSQLServices();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to launch NoSQL service",
        variant: "destructive",
      });
    } finally {
      setLaunchingService(false);
    }
  };

  const createCollection = async () => {
    if (!currentService || !newCollectionName.trim()) return;

    try {
      setCreatingCollection(true);
      await apiService.createNoSQLCollection(
        currentService.service_id,
        newCollectionName.trim()
      );

      toast({
        title: "Success",
        description: `Collection '${newCollectionName}' created successfully`,
        variant: "success",
      });

      setNewCollectionName("");
      await fetchCollections(currentService.service_id);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create collection",
        variant: "destructive",
      });
    } finally {
      setCreatingCollection(false);
    }
  };

  const saveEntity = async () => {
    if (!currentService || !selectedCollection || !entityData.trim()) return;

    try {
      setSavingEntity(true);
      const parsedData = JSON.parse(entityData);
      await apiService.saveNoSQLEntity(
        currentService.service_id,
        selectedCollection,
        parsedData
      );

      toast({
        title: "Success",
        description: "Entity saved successfully",
        variant: "success",
      });

      setEntityData("");
      await fetchDocuments(selectedCollection);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof SyntaxError
            ? "Invalid JSON format"
            : "Failed to save entity",
        variant: "destructive",
      });
    } finally {
      setSavingEntity(false);
    }
  };

  const queryCollection = async () => {
    if (
      !currentService ||
      !selectedCollection ||
      !queryField.trim() ||
      !queryValue.trim()
    )
      return;

    try {
      const response = await apiService.queryNoSQLCollection(
        currentService.service_id,
        selectedCollection,
        queryField.trim(),
        queryValue.trim()
      );
      setQueryResult(response.query_result);

      toast({
        title: "Success",
        description: `Found ${response.query_result.length} documents`,
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to query collection",
        variant: "destructive",
      });
    }
  };

  const updateEntity = async () => {
    if (
      !currentService ||
      !selectedCollection ||
      !editingEntity ||
      !editEntityData.trim()
    )
      return;

    try {
      const parsedData = JSON.parse(editEntityData);
      await apiService.updateNoSQLEntity(
        currentService.service_id,
        selectedCollection,
        editingEntity._id,
        parsedData
      );

      toast({
        title: "Success",
        description: "Entity updated successfully",
        variant: "success",
      });

      setEditingEntity(null);
      setEditEntityData("");
      await fetchDocuments(selectedCollection);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof SyntaxError
            ? "Invalid JSON format"
            : "Failed to update entity",
        variant: "destructive",
      });
    }
  };

  const deleteEntity = async (entityId: string) => {
    if (!currentService || !selectedCollection) return;

    try {
      await apiService.deleteNoSQLEntity(
        currentService.service_id,
        selectedCollection,
        entityId
      );

      toast({
        title: "Success",
        description: "Entity deleted successfully",
        variant: "success",
      });

      await fetchDocuments(selectedCollection);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete entity",
        variant: "destructive",
      });
    }
  };

  const checkServiceHealth = async (serviceId: string) => {
    try {
      const health = await apiService.checkNoSQLServiceHealth(serviceId);
      toast({
        title: health.is_healthy ? "Service Healthy" : "Service Unhealthy",
        description: `Last check: ${new Date(
          health.last_check
        ).toLocaleString()}`,
        variant: health.is_healthy ? "success" : "destructive",
      });
      await fetchNoSQLServices();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check service health",
        variant: "destructive",
      });
    }
  };

  const startEditEntity = (entity: NoSQLEntity) => {
    setEditingEntity(entity);
    // Create a copy without the _id for editing
    const { _id, ...entityWithoutId } = entity;
    setEditEntityData(JSON.stringify(entityWithoutId, null, 2));
  };

  const insertSampleEntity = (sample: string) => {
    setEntityData(sample);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">UWS NoSQL</h1>
          <p className="text-muted-foreground">
            MongoDB NoSQL database service with document storage and querying
          </p>
        </div>

        {/* NoSQL Service Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Layers className="h-5 w-5" />
                <CardTitle>NoSQL Service Status</CardTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchNoSQLServices}
                disabled={loading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
            <CardDescription>
              Manage your NoSQL database service instances
            </CardDescription>
          </CardHeader>
          <CardContent>
            {nosqlServices.length === 0 ? (
              <div className="text-center py-8">
                <Layers className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  No NoSQL services running
                </p>
                <Button
                  onClick={launchNoSQLService}
                  disabled={launchingService}
                  className="w-auto"
                >
                  {launchingService ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Launching...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Launch NoSQL Service
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {nosqlServices.map((service) => (
                  <motion.div
                    key={service.service_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          service.is_healthy ? "bg-green-500" : "bg-red-500"
                        }`}
                      />
                      <div>
                        <p className="font-medium">{service.service_id}</p>
                        <p className="text-sm text-muted-foreground">
                          {service.service_url}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={service.is_healthy ? "default" : "destructive"}
                      >
                        {service.is_healthy ? "Healthy" : "Unhealthy"}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => checkServiceHealth(service.service_id)}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      {service.is_healthy && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCurrentService(service);
                            fetchCollections(service.service_id);
                          }}
                        >
                          <Server className="h-4 w-4 mr-2" />
                          Connect
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* NoSQL Operations */}
        {currentService && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>NoSQL Operations</span>
              </CardTitle>
              <CardDescription>
                Manage your document database operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">NoSQL Service Connected</h4>
                  <p className="text-sm text-muted-foreground">
                    Service URL: {currentService.service_url}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Service ID: {currentService.service_id}
                  </p>
                </div>

                <Tabs defaultValue="browse" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="browse">Browse</TabsTrigger>
                    <TabsTrigger value="create">Create</TabsTrigger>
                    <TabsTrigger value="query">Query</TabsTrigger>
                    <TabsTrigger value="manage">Manage</TabsTrigger>
                  </TabsList>

                  <TabsContent value="browse" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Layers className="h-5 w-5" />
                          <span>Collections & Documents</span>
                        </CardTitle>
                        <CardDescription>
                          Browse and explore your collections and documents
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Collections ({collections.length})</Label>
                            <div className="border rounded-lg p-2 max-h-64 overflow-auto">
                              {collections.length === 0 ? (
                                <p className="text-muted-foreground text-sm">
                                  No collections found
                                </p>
                              ) : (
                                <div className="space-y-1">
                                  {collections.map((collection) => (
                                    <Button
                                      key={collection}
                                      variant={
                                        selectedCollection === collection
                                          ? "default"
                                          : "ghost"
                                      }
                                      size="sm"
                                      className="w-full justify-start"
                                      onClick={() => {
                                        setSelectedCollection(collection);
                                        fetchDocuments(collection);
                                      }}
                                    >
                                      <Database className="h-4 w-4 mr-2" />
                                      {collection}
                                    </Button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          <div>
                            <Label>
                              Documents{" "}
                              {selectedCollection && `(${selectedCollection})`}
                            </Label>
                            <div className="border rounded-lg p-2 max-h-64 overflow-auto">
                              {documents.length === 0 ? (
                                <p className="text-muted-foreground text-sm">
                                  {selectedCollection
                                    ? "No documents found"
                                    : "Select a collection to view documents"}
                                </p>
                              ) : (
                                <div className="space-y-2">
                                  {documents.map((doc) => (
                                    <div
                                      key={doc._id}
                                      className="border rounded p-2 text-sm"
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="font-medium">
                                          ID: {doc._id}
                                        </div>
                                        <div className="flex space-x-1">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => startEditEntity(doc)}
                                          >
                                            <Edit className="h-3 w-3" />
                                          </Button>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                              deleteEntity(doc._id)
                                            }
                                          >
                                            <Trash2 className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      </div>
                                      <div className="mt-1 text-muted-foreground">
                                        <pre className="text-xs overflow-hidden">
                                          {JSON.stringify(
                                            doc,
                                            null,
                                            2
                                          ).substring(0, 100)}
                                          {JSON.stringify(doc).length > 100 &&
                                            "..."}
                                        </pre>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="create" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Plus className="h-5 w-5" />
                          <span>Create Collection</span>
                        </CardTitle>
                        <CardDescription>
                          Create a new document collection
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Collection name..."
                            value={newCollectionName}
                            onChange={(e) =>
                              setNewCollectionName(e.target.value)
                            }
                          />
                          <Button
                            onClick={createCollection}
                            disabled={
                              !newCollectionName.trim() || creatingCollection
                            }
                          >
                            {creatingCollection ? (
                              <>
                                <Clock className="h-4 w-4 mr-2 animate-spin" />
                                Creating...
                              </>
                            ) : (
                              <>
                                <Plus className="h-4 w-4 mr-2" />
                                Create
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <FileText className="h-5 w-5" />
                          <span>Add Document</span>
                        </CardTitle>
                        <CardDescription>
                          Insert documents into collections
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="collection-select">Collection</Label>
                          <select
                            id="collection-select"
                            className="w-full border rounded-md px-3 py-2"
                            value={selectedCollection}
                            onChange={(e) =>
                              setSelectedCollection(e.target.value)
                            }
                          >
                            <option value="">Select a collection...</option>
                            {collections.map((collection) => (
                              <option key={collection} value={collection}>
                                {collection}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              insertSampleEntity(
                                '{\n  "name": "John Doe",\n  "email": "john@example.com",\n  "age": 30\n}'
                              )
                            }
                          >
                            User Sample
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              insertSampleEntity(
                                '{\n  "title": "Sample Product",\n  "price": 29.99,\n  "category": "electronics"\n}'
                              )
                            }
                          >
                            Product Sample
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              insertSampleEntity(
                                '{\n  "message": "Hello World",\n  "timestamp": "' +
                                  new Date().toISOString() +
                                  '",\n  "author": "user1"\n}'
                              )
                            }
                          >
                            Message Sample
                          </Button>
                        </div>

                        <div>
                          <Label htmlFor="entity-data">
                            Document Data (JSON)
                          </Label>
                          <Textarea
                            id="entity-data"
                            placeholder="Enter JSON data for the document..."
                            value={entityData}
                            onChange={(e) => setEntityData(e.target.value)}
                            className="min-h-[120px] font-mono"
                          />
                        </div>

                        <Button
                          onClick={saveEntity}
                          disabled={
                            !selectedCollection ||
                            !entityData.trim() ||
                            savingEntity
                          }
                          className="w-full"
                        >
                          {savingEntity ? (
                            <>
                              <Clock className="h-4 w-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Save Document
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="query" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Search className="h-5 w-5" />
                          <span>Query Collection</span>
                        </CardTitle>
                        <CardDescription>
                          Search documents by field values
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="query-collection">Collection</Label>
                          <select
                            id="query-collection"
                            className="w-full border rounded-md px-3 py-2"
                            value={selectedCollection}
                            onChange={(e) =>
                              setSelectedCollection(e.target.value)
                            }
                          >
                            <option value="">Select a collection...</option>
                            {collections.map((collection) => (
                              <option key={collection} value={collection}>
                                {collection}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="query-field">Field Name</Label>
                            <Input
                              id="query-field"
                              placeholder="e.g., name, email, category"
                              value={queryField}
                              onChange={(e) => setQueryField(e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="query-value">Field Value</Label>
                            <Input
                              id="query-value"
                              placeholder="Value to search for"
                              value={queryValue}
                              onChange={(e) => setQueryValue(e.target.value)}
                            />
                          </div>
                        </div>

                        <Button
                          onClick={queryCollection}
                          disabled={
                            !selectedCollection ||
                            !queryField.trim() ||
                            !queryValue.trim()
                          }
                          className="w-full"
                        >
                          <Search className="h-4 w-4 mr-2" />
                          Query Collection
                        </Button>

                        {queryResult.length > 0 && (
                          <div className="border rounded-lg p-4">
                            <h4 className="font-medium mb-2">
                              Query Results ({queryResult.length} documents)
                            </h4>
                            <div className="space-y-2 max-h-64 overflow-auto">
                              {queryResult.map((doc) => (
                                <div
                                  key={doc._id}
                                  className="border rounded p-2 text-sm"
                                >
                                  <div className="font-medium">
                                    ID: {doc._id}
                                  </div>
                                  <pre className="text-xs text-muted-foreground mt-1">
                                    {JSON.stringify(doc, null, 2)}
                                  </pre>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="manage" className="space-y-4">
                    {editingEntity && (
                      <Card>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center space-x-2">
                              <Edit className="h-5 w-5" />
                              <span>Edit Document</span>
                            </CardTitle>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingEntity(null);
                                setEditEntityData("");
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <CardDescription>
                            Editing document ID: {editingEntity._id}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label htmlFor="edit-entity-data">
                              Document Data (JSON)
                            </Label>
                            <Textarea
                              id="edit-entity-data"
                              value={editEntityData}
                              onChange={(e) =>
                                setEditEntityData(e.target.value)
                              }
                              className="min-h-[120px] font-mono"
                            />
                          </div>

                          <div className="flex gap-2">
                            <Button
                              onClick={updateEntity}
                              disabled={!editEntityData.trim()}
                            >
                              <Save className="h-4 w-4 mr-2" />
                              Update Document
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => {
                                deleteEntity(editingEntity._id);
                                setEditingEntity(null);
                                setEditEntityData("");
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Document
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Terminal className="h-5 w-5" />
                          <span>Collection Management</span>
                        </CardTitle>
                        <CardDescription>
                          Manage your NoSQL collections and perform bulk
                          operations
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-1">
                            NoSQL Service Ready
                          </h4>
                          <p className="text-sm text-blue-700">
                            Your MongoDB NoSQL service is running and ready for
                            document operations. Collections:{" "}
                            {collections.length}, Active Service:{" "}
                            {currentService.service_url}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
