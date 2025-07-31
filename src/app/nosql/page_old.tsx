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

export default function NoSQLPage() {
  const { toast } = useToast();
  const [nosqlServices, setNoSQLServices] = useState<NoSQLService[]>([]);
  const [currentService, setCurrentService] = useState<NoSQLService | null>(null);
  const [loading, setLoading] = useState(true);
  const [launchingService, setLaunchingService] = useState(false);

  useEffect(() => {
    fetchNoSQLServices();
  }, []);

  const fetchNoSQLServices = async () => {
    try {
      setLoading(true);
      const response = await apiService.getNoSQLServices();
      setNoSQLServices(response.nosql_services);
      
      // If we have services, use the first healthy one
      const healthyService = response.nosql_services.find(service => service.is_healthy);
      if (healthyService) {
        setCurrentService(healthyService);
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

  const checkServiceHealth = async (serviceId: string) => {
    try {
      const health = await apiService.checkNoSQLServiceHealth(serviceId);
      toast({
        title: health.is_healthy ? "Service Healthy" : "Service Unhealthy",
        description: `Last check: ${new Date(health.last_check).toLocaleString()}`,
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
                <p className="text-muted-foreground mb-4">No NoSQL services running</p>
                <Button
                  onClick={launchNoSQLService}
                  disabled={launchingService}
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
                      <div className={`w-3 h-3 rounded-full ${service.is_healthy ? 'bg-green-500' : 'bg-red-500'}`} />
                      <div>
                        <div className="font-medium">NoSQL Service {service.service_id.slice(-8)}</div>
                        <div className="text-sm text-muted-foreground">
                          {service.ip_address}:{service.port} • {service.status}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => checkServiceHealth(service.service_id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Health Check
                      </Button>
                      {service.is_healthy && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentService(service)}
                        >
                          Use This Service
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>NoSQL Operations</span>
            </CardTitle>
            <CardDescription>
              Manage your document database operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!currentService ? (
              <div className="text-center py-8">
                <Layers className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No NoSQL service connected</p>
                <p className="text-sm text-muted-foreground">Launch a NoSQL service to start using document operations</p>
              </div>
            ) : (
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Plus className="h-4 w-4" />
                        <span className="font-medium">Create Collection</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Create a new document collection
                      </p>
                      <Button size="sm" className="w-full" disabled>
                        Coming Soon
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <FileText className="h-4 w-4" />
                        <span className="font-medium">Save Document</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Insert documents into collections
                      </p>
                      <Button size="sm" className="w-full" disabled>
                        Coming Soon
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Search className="h-4 w-4" />
                        <span className="font-medium">Query Documents</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Search and filter documents
                      </p>
                      <Button size="sm" className="w-full" disabled>
                        Coming Soon
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Trash2 className="h-4 w-4" />
                        <span className="font-medium">Delete Documents</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Remove documents and collections
                      </p>
                      <Button size="sm" className="w-full" disabled>
                        Coming Soon
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-1">NoSQL Service Ready</h4>
                  <p className="text-sm text-green-700">
                    Your MongoDB NoSQL service is running and ready to accept document operations. 
                    Use the service URL above to connect your applications for document storage and querying.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}