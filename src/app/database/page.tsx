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
  Edit,
  Trash2,
  Settings,
  BarChart3,
  Terminal,
  Table,
  Search,
  Cpu,
  HardDrive,
  MemoryStick,
  X,
  Copy,
  ExternalLink,
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { useToast } from "@/lib/toast-context";
import DashboardLayout from "@/components/dashboard-layout";
import { apiService } from "@/lib/api";

interface DBService {
  service_id: string;
  container_id: string;
  node_id: string;
  ip_address: string;
  port: number;
  status: string;
  is_healthy: boolean;
  created_at: string;
  service_url: string;
  max_cpu_percent: number;
  max_ram_mb: number;
  max_disk_gb: number;
  database_name: string;
  instance_name?: string;
}

interface QueryResult {
  success: boolean;
  result: any[];
  timestamp: string;
}

interface TableSchema {
  name: string;
  type: string;
  not_null: boolean;
  default_value: any;
  primary_key: boolean;
}

export default function DatabasePage() {
  const { toast } = useToast();
  const [dbServices, setDBServices] = useState<DBService[]>([]);
  const [currentService, setCurrentService] = useState<DBService | null>(null);
  const [loading, setLoading] = useState(true);
  const [launchingService, setLaunchingService] = useState(false);

  // SQL Query state
  const [sqlQuery, setSqlQuery] = useState("");
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [executingQuery, setExecutingQuery] = useState(false);
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [tableSchema, setTableSchema] = useState<TableSchema[]>([]);

  // Service Launch Configuration
  const [launchConfig, setLaunchConfig] = useState({
    instance_name: "",
    max_cpu_percent: 90,
    max_ram_mb: 2048,
    max_disk_gb: 10,
    database_name: "main",
  });
  const [showLaunchDialog, setShowLaunchDialog] = useState(false);

  // Resource configuration
  const [resourceConfig, setResourceConfig] = useState({
    max_cpu_percent: 90,
    max_ram_mb: 2048,
    max_disk_gb: 10,
    instance_name: "",
  });
  const [updatingConfig, setUpdatingConfig] = useState(false);

  // Deletion state
  const [deletingService, setDeletingService] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Statistics
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    fetchDBServices();
  }, []);

  useEffect(() => {
    if (currentService) {
      fetchTables();
      fetchStats();
      // Set resource config from current service
      setResourceConfig({
        max_cpu_percent: currentService.max_cpu_percent,
        max_ram_mb: currentService.max_ram_mb,
        max_disk_gb: currentService.max_disk_gb,
        instance_name: currentService.instance_name || "",
      });
    }
  }, [currentService]);

  const fetchDBServices = async () => {
    try {
      setLoading(true);
      const response = await apiService.getDBServices();
      setDBServices(response.db_services);

      // If we have services, use the first healthy one
      const healthyService = response.db_services.find(
        (service) => service.is_healthy
      );
      if (healthyService) {
        setCurrentService(healthyService);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch database services",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const launchDBService = async () => {
    try {
      setLaunchingService(true);
      const service = await apiService.launchDBService(launchConfig);

      toast({
        title: "Success",
        description: "Database service launched successfully",
        variant: "success",
      });

      // Reset launch config
      setLaunchConfig({
        instance_name: "",
        max_cpu_percent: 90,
        max_ram_mb: 2048,
        max_disk_gb: 10,
        database_name: "main",
      });

      // Close dialog and refresh the services list
      setShowLaunchDialog(false);
      await fetchDBServices();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to launch database service",
        variant: "destructive",
      });
    } finally {
      setLaunchingService(false);
    }
  };

  const checkServiceHealth = async (serviceId: string) => {
    try {
      await apiService.checkDBServiceHealth(serviceId);
      toast({
        title: "Success",
        description: "Health check completed",
        variant: "success",
      });
      await fetchDBServices();
    } catch (error) {
      toast({
        title: "Error",
        description: "Health check failed",
        variant: "destructive",
      });
    }
  };

  const executeQuery = async () => {
    if (!currentService || !sqlQuery.trim()) return;

    try {
      setExecutingQuery(true);
      const result = await apiService.executeDBQuery(
        currentService.service_id,
        sqlQuery.trim()
      );
      setQueryResult(result.query_result);

      toast({
        title: "Success",
        description: "Query executed successfully",
        variant: "success",
      });

      // Refresh tables list if it was a DDL statement
      if (
        sqlQuery.trim().toUpperCase().includes("CREATE TABLE") ||
        sqlQuery.trim().toUpperCase().includes("DROP TABLE")
      ) {
        fetchTables();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to execute query",
        variant: "destructive",
      });
    } finally {
      setExecutingQuery(false);
    }
  };

  const fetchTables = async () => {
    if (!currentService) return;

    try {
      const result = await apiService.getDBTables(currentService.service_id);
      setTables(result.tables.tables);
    } catch (error) {
      console.error("Failed to fetch tables:", error);
    }
  };

  const fetchTableSchema = async (tableName: string) => {
    if (!currentService) return;

    try {
      const result = await apiService.getDBTableSchema(
        currentService.service_id,
        tableName
      );
      setTableSchema(result.schema.columns);
      setSelectedTable(tableName);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch table schema",
        variant: "destructive",
      });
    }
  };

  const updateServiceConfig = async () => {
    if (!currentService) return;

    try {
      setUpdatingConfig(true);
      await apiService.updateDBServiceConfig(
        currentService.service_id,
        resourceConfig
      );

      toast({
        title: "Success",
        description: "Configuration updated successfully",
        variant: "success",
      });

      await fetchDBServices();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update configuration",
        variant: "destructive",
      });
    } finally {
      setUpdatingConfig(false);
    }
  };

  const deleteService = async () => {
    if (!currentService) return;

    try {
      setDeletingService(true);
      await apiService.removeDBService(currentService.service_id);

      toast({
        title: "Success",
        description: `Database instance "${
          currentService.instance_name || currentService.service_id
        }" deleted successfully`,
        variant: "success",
      });

      // Refresh the services list and clear current service
      await fetchDBServices();
      setCurrentService(null);
      setShowDeleteConfirm(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete database instance",
        variant: "destructive",
      });
    } finally {
      setDeletingService(false);
    }
  };

  const fetchStats = async () => {
    if (!currentService) return;

    try {
      setLoadingStats(true);
      const result = await apiService.getDBServiceStats(
        currentService.service_id
      );
      setStats(result);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  const insertSampleQuery = (query: string) => {
    setSqlQuery(query);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  // Debug: Show current state
  console.log("Current service:", currentService);
  console.log("DB Services count:", dbServices.length);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">UWS Database</h1>
          <p className="text-muted-foreground">
            SQL database service with advanced querying and resource management
          </p>
        </div>

        {/* Database Service Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <CardTitle>
                  Database Service Instances ({dbServices.length})
                </CardTitle>
              </div>
              <div className="flex space-x-2">
                <Dialog
                  open={showLaunchDialog}
                  onOpenChange={setShowLaunchDialog}
                >
                  <DialogTrigger asChild>
                    <Button variant="default" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      New Instance
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Launch New Database Instance</DialogTitle>
                      <DialogDescription>
                        Create a new database service instance with custom
                        configuration and resource limits.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="dialog_instance_name">
                            Instance Name *
                          </Label>
                          <Input
                            id="dialog_instance_name"
                            placeholder="e.g., production-db, dev-database"
                            value={launchConfig.instance_name}
                            onChange={(e) =>
                              setLaunchConfig({
                                ...launchConfig,
                                instance_name: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="dialog_database_name">
                            Database Name
                          </Label>
                          <Input
                            id="dialog_database_name"
                            value={launchConfig.database_name}
                            onChange={(e) =>
                              setLaunchConfig({
                                ...launchConfig,
                                database_name: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium mb-3">
                          Resource Limits
                        </h3>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="dialog_cpu_limit">
                              <Cpu className="h-4 w-4 inline mr-2" />
                              CPU Limit (%)
                            </Label>
                            <Input
                              id="dialog_cpu_limit"
                              type="number"
                              min="1"
                              max="100"
                              value={launchConfig.max_cpu_percent}
                              onChange={(e) =>
                                setLaunchConfig({
                                  ...launchConfig,
                                  max_cpu_percent: Number(e.target.value),
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="dialog_ram_limit">
                              <MemoryStick className="h-4 w-4 inline mr-2" />
                              RAM Limit (MB)
                            </Label>
                            <Input
                              id="dialog_ram_limit"
                              type="number"
                              min="512"
                              value={launchConfig.max_ram_mb}
                              onChange={(e) =>
                                setLaunchConfig({
                                  ...launchConfig,
                                  max_ram_mb: Number(e.target.value),
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="dialog_disk_limit">
                              <HardDrive className="h-4 w-4 inline mr-2" />
                              Disk Limit (GB)
                            </Label>
                            <Input
                              id="dialog_disk_limit"
                              type="number"
                              min="1"
                              value={launchConfig.max_disk_gb}
                              onChange={(e) =>
                                setLaunchConfig({
                                  ...launchConfig,
                                  max_disk_gb: Number(e.target.value),
                                })
                              }
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setShowLaunchDialog(false)}
                          disabled={launchingService}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={launchDBService}
                          disabled={
                            launchingService ||
                            !launchConfig.instance_name.trim()
                          }
                        >
                          {launchingService ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Launching...
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Launch Instance
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchDBServices}
                  disabled={loading}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
            <CardDescription>
              Manage and monitor your database service instances
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dbServices.length === 0 ? (
              <div className="text-center py-12">
                <Database className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  No Database Instances
                </h3>
                <p className="text-muted-foreground mb-6">
                  Create your first database instance to get started with SQL
                  operations
                </p>
                <Button onClick={() => setShowLaunchDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Instance
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {dbServices.map((service) => (
                  <motion.div
                    key={service.service_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 border rounded-lg transition-colors ${
                      currentService?.service_id === service.service_id
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            service.is_healthy ? "bg-green-500" : "bg-red-500"
                          }`}
                        />
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">
                              {service.instance_name ||
                                `Database Instance ${service.service_id.slice(
                                  -8
                                )}`}
                            </span>
                            {currentService?.service_id ===
                              service.service_id && (
                              <Badge variant="default" className="text-xs">
                                Active
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center space-x-1">
                            <Server className="h-3 w-3" />
                            <span>
                              {service.ip_address}:{service.port}
                            </span>
                            <span>•</span>
                            <span className="capitalize">{service.status}</span>
                            <span>•</span>
                            <span>DB: {service.database_name}</span>
                          </div>
                          <div className="flex space-x-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              <Cpu className="h-3 w-3 mr-1" />
                              {service.max_cpu_percent}%
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              <MemoryStick className="h-3 w-3 mr-1" />
                              {service.max_ram_mb}MB
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              <HardDrive className="h-3 w-3 mr-1" />
                              {service.max_disk_gb}GB
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(service.service_url);
                            toast({
                              title: "Copied",
                              description: "Service URL copied to clipboard",
                              variant: "success",
                            });
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => checkServiceHealth(service.service_id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Health
                        </Button>
                        {service.is_healthy && (
                          <Button
                            variant={
                              currentService?.service_id === service.service_id
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() => setCurrentService(service)}
                          >
                            {currentService?.service_id ===
                            service.service_id ? (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Active
                              </>
                            ) : (
                              <>
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Use Instance
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Database Operations */}
        {currentService ? (
          <div className="space-y-4">
            {/* Quick Actions Bar */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <h3 className="text-lg font-semibold">
                      Selected:{" "}
                      {currentService.instance_name ||
                        currentService.service_id}
                    </h3>
                    <Badge
                      variant={
                        currentService.is_healthy ? "default" : "destructive"
                      }
                    >
                      {currentService.is_healthy ? "Healthy" : "Unhealthy"}
                    </Badge>
                  </div>
                  <div className="flex space-x-2">
                    <Dialog
                      open={showDeleteConfirm}
                      onOpenChange={setShowDeleteConfirm}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="lg"
                          className="bg-red-600 hover:bg-red-700 text-white font-semibold"
                        >
                          <Trash2 className="h-5 w-5 mr-2" />
                          Delete Instance
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Database Instance</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete the database
                            instance "
                            {currentService?.instance_name ||
                              currentService?.service_id}
                            "? This action cannot be undone and will permanently
                            remove all data and configurations.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex justify-end space-x-2 pt-4">
                          <Button
                            variant="outline"
                            onClick={() => setShowDeleteConfirm(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={deleteService}
                            disabled={deletingService}
                          >
                            {deletingService ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Deleting...
                              </>
                            ) : (
                              <>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Instance
                              </>
                            )}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="query" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="query">SQL Query</TabsTrigger>
                <TabsTrigger value="tables">Tables</TabsTrigger>
                <TabsTrigger value="config">Configuration</TabsTrigger>
                <TabsTrigger value="stats">Statistics</TabsTrigger>
              </TabsList>

              <TabsContent value="query" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Terminal className="h-5 w-5" />
                      <span>SQL Query Console</span>
                    </CardTitle>
                    <CardDescription>
                      Execute SQL queries against your database
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-4 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          insertSampleQuery(
                            "SELECT name FROM sqlite_master WHERE type='table';"
                          )
                        }
                      >
                        List Tables
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          insertSampleQuery(
                            "CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, email TEXT);"
                          )
                        }
                      >
                        Create Table
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          insertSampleQuery(
                            "INSERT INTO users (name, email) VALUES ('John Doe', 'john@example.com');"
                          )
                        }
                      >
                        Insert Data
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          insertSampleQuery("SELECT * FROM users LIMIT 10;")
                        }
                      >
                        Select Data
                      </Button>
                    </div>

                    <div>
                      <Label htmlFor="sql-query">SQL Query</Label>
                      <Textarea
                        id="sql-query"
                        placeholder="Enter your SQL query here..."
                        value={sqlQuery}
                        onChange={(e) => setSqlQuery(e.target.value)}
                        className="min-h-[120px] font-mono"
                      />
                    </div>

                    <Button
                      onClick={executeQuery}
                      disabled={!sqlQuery.trim() || executingQuery}
                      className="w-full"
                    >
                      {executingQuery ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Executing...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Execute Query
                        </>
                      )}
                    </Button>

                    {queryResult && (
                      <div className="mt-4">
                        <Label>Query Result</Label>
                        <div className="border rounded-lg p-4 bg-muted max-h-64 overflow-auto">
                          <pre className="text-sm">
                            {JSON.stringify(queryResult.result, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tables" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Table className="h-5 w-5" />
                      <span>Database Tables</span>
                    </CardTitle>
                    <CardDescription>
                      Browse and explore your database tables
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Tables ({tables.length})</Label>
                        <div className="border rounded-lg p-2 max-h-64 overflow-auto">
                          {tables.length === 0 ? (
                            <p className="text-muted-foreground text-sm">
                              No tables found
                            </p>
                          ) : (
                            <div className="space-y-1">
                              {tables.map((table) => (
                                <Button
                                  key={table}
                                  variant={
                                    selectedTable === table
                                      ? "default"
                                      : "ghost"
                                  }
                                  size="sm"
                                  className="w-full justify-start"
                                  onClick={() => fetchTableSchema(table)}
                                >
                                  <Table className="h-4 w-4 mr-2" />
                                  {table}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label>
                          Schema {selectedTable && `(${selectedTable})`}
                        </Label>
                        <div className="border rounded-lg p-2 max-h-64 overflow-auto">
                          {tableSchema.length === 0 ? (
                            <p className="text-muted-foreground text-sm">
                              Select a table to view schema
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {tableSchema.map((column, index) => (
                                <div
                                  key={index}
                                  className="border rounded p-2 text-sm"
                                >
                                  <div className="font-medium">
                                    {column.name}
                                  </div>
                                  <div className="text-muted-foreground">
                                    {column.type}
                                  </div>
                                  <div className="flex space-x-2 mt-1">
                                    {column.primary_key && (
                                      <Badge
                                        variant="default"
                                        className="text-xs"
                                      >
                                        PK
                                      </Badge>
                                    )}
                                    {column.not_null && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        NOT NULL
                                      </Badge>
                                    )}
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

              <TabsContent value="config" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Settings className="h-5 w-5" />
                      <span>Instance Configuration</span>
                    </CardTitle>
                    <CardDescription>
                      Modify resource limits and instance settings for:{" "}
                      {currentService.instance_name ||
                        `Database Instance ${currentService.service_id.slice(
                          -8
                        )}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">
                          Instance Details
                        </h3>

                        <div>
                          <Label htmlFor="config_instance_name">
                            Instance Name
                          </Label>
                          <Input
                            id="config_instance_name"
                            placeholder="Give your instance a name"
                            value={resourceConfig.instance_name}
                            onChange={(e) =>
                              setResourceConfig({
                                ...resourceConfig,
                                instance_name: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Service ID</Label>
                            <div className="flex items-center space-x-2 pt-2">
                              <span className="text-sm font-mono">
                                {currentService.service_id}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  navigator.clipboard.writeText(
                                    currentService.service_id
                                  );
                                  toast({
                                    title: "Copied",
                                    description:
                                      "Service ID copied to clipboard",
                                    variant: "success",
                                  });
                                }}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <div>
                            <Label>Status</Label>
                            <div className="flex items-center space-x-2 pt-2">
                              <div
                                className={`w-3 h-3 rounded-full ${
                                  currentService.is_healthy
                                    ? "bg-green-500"
                                    : "bg-red-500"
                                }`}
                              />
                              <span className="text-sm capitalize">
                                {currentService.status}
                              </span>
                              {currentService.is_healthy && (
                                <Badge variant="outline" className="text-xs">
                                  Healthy
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Database</Label>
                            <p className="text-sm text-muted-foreground pt-2">
                              {currentService.database_name}
                            </p>
                          </div>
                          <div>
                            <Label>Endpoint</Label>
                            <div className="flex items-center space-x-2 pt-2">
                              <span className="text-sm font-mono">
                                {currentService.ip_address}:
                                {currentService.port}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  navigator.clipboard.writeText(
                                    currentService.service_url
                                  );
                                  toast({
                                    title: "Copied",
                                    description:
                                      "Service URL copied to clipboard",
                                    variant: "success",
                                  });
                                }}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Resource Limits</h3>

                        <div>
                          <Label htmlFor="config_cpu">
                            <Cpu className="h-4 w-4 inline mr-2" />
                            CPU Limit (%)
                          </Label>
                          <Input
                            id="config_cpu"
                            type="number"
                            min="1"
                            max="100"
                            value={resourceConfig.max_cpu_percent}
                            onChange={(e) =>
                              setResourceConfig({
                                ...resourceConfig,
                                max_cpu_percent: Number(e.target.value),
                              })
                            }
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Current: {currentService.max_cpu_percent}%
                          </p>
                        </div>

                        <div>
                          <Label htmlFor="config_ram">
                            <MemoryStick className="h-4 w-4 inline mr-2" />
                            RAM Limit (MB)
                          </Label>
                          <Input
                            id="config_ram"
                            type="number"
                            min="512"
                            value={resourceConfig.max_ram_mb}
                            onChange={(e) =>
                              setResourceConfig({
                                ...resourceConfig,
                                max_ram_mb: Number(e.target.value),
                              })
                            }
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Current: {currentService.max_ram_mb} MB
                          </p>
                        </div>

                        <div>
                          <Label htmlFor="config_disk">
                            <HardDrive className="h-4 w-4 inline mr-2" />
                            Disk Limit (GB)
                          </Label>
                          <Input
                            id="config_disk"
                            type="number"
                            min="1"
                            value={resourceConfig.max_disk_gb}
                            onChange={(e) =>
                              setResourceConfig({
                                ...resourceConfig,
                                max_disk_gb: Number(e.target.value),
                              })
                            }
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Current: {currentService.max_disk_gb} GB
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between pt-4 border-t">
                      <div>
                        <Dialog
                          open={showDeleteConfirm}
                          onOpenChange={setShowDeleteConfirm}
                        >
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>
                                Delete Database Instance
                              </DialogTitle>
                              <DialogDescription>
                                Are you sure you want to delete the database
                                instance "
                                {currentService?.instance_name ||
                                  currentService?.service_id}
                                "? This action cannot be undone and will
                                permanently remove all data and configurations.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="flex justify-end space-x-2 pt-4">
                              <Button
                                variant="outline"
                                onClick={() => setShowDeleteConfirm(false)}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={deleteService}
                                disabled={deletingService}
                              >
                                {deletingService ? (
                                  <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Deleting...
                                  </>
                                ) : (
                                  <>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Instance
                                  </>
                                )}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            // Reset to current service values
                            setResourceConfig({
                              max_cpu_percent: currentService.max_cpu_percent,
                              max_ram_mb: currentService.max_ram_mb,
                              max_disk_gb: currentService.max_disk_gb,
                              instance_name: currentService.instance_name || "",
                            });
                          }}
                        >
                          Reset
                        </Button>
                        <Button
                          onClick={updateServiceConfig}
                          disabled={updatingConfig}
                        >
                          {updatingConfig ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            <>
                              <Settings className="h-4 w-4 mr-2" />
                              Update Configuration
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="stats" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <BarChart3 className="h-5 w-5" />
                        <CardTitle>Database Statistics</CardTitle>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchStats}
                        disabled={loadingStats}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                      </Button>
                    </div>
                    <CardDescription>
                      Database usage and performance metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {stats ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h3 className="font-medium">Database Info</h3>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Database Size:</span>
                              <span>
                                {stats.statistics.database_stats.database_size_mb?.toFixed(
                                  2
                                ) || "N/A"}{" "}
                                MB
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Table Count:</span>
                              <span>
                                {stats.statistics.database_stats.table_count ||
                                  0}
                              </span>
                            </div>
                          </div>

                          {stats.statistics.database_stats.table_statistics && (
                            <div>
                              <h4 className="font-medium mb-2">
                                Table Statistics
                              </h4>
                              <div className="space-y-1">
                                {Object.entries(
                                  stats.statistics.database_stats
                                    .table_statistics
                                ).map(([table, stats]: [string, any]) => (
                                  <div
                                    key={table}
                                    className="flex justify-between text-sm"
                                  >
                                    <span>{table}:</span>
                                    <span>{stats.row_count || 0} rows</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-4">
                          <h3 className="font-medium">Resource Usage</h3>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>CPU Usage:</span>
                              <span>
                                {stats.statistics.resource_usage.cpu_percent?.toFixed(
                                  1
                                ) || "N/A"}
                                %
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Memory Usage:</span>
                              <span>
                                {stats.statistics.resource_usage.memory_percent?.toFixed(
                                  1
                                ) || "N/A"}
                                %
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Disk Free:</span>
                              <span>
                                {stats.statistics.resource_usage.disk_free_gb?.toFixed(
                                  2
                                ) || "N/A"}{" "}
                                GB
                              </span>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium mb-2">
                              Resource Limits
                            </h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span>CPU Limit:</span>
                                <span>
                                  {stats.service_config.max_cpu_percent}%
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>RAM Limit:</span>
                                <span>
                                  {stats.service_config.max_ram_mb} MB
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Disk Limit:</span>
                                <span>
                                  {stats.service_config.max_disk_gb} GB
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          Loading statistics...
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No Database Selected
                </h3>
                <p className="text-muted-foreground mb-4">
                  Select a database instance from the list above to manage it.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
