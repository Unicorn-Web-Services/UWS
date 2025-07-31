"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Key,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Play,
  Server,
  Shield,
  Lock,
  Eye,
  EyeOff,
  Plus,
  Edit,
  Trash2,
  X,
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
import { Label } from "@/components/ui/label";

interface SecretsService {
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

export default function SecretsPage() {
  const { toast } = useToast();
  const [secretsServices, setSecretsServices] = useState<SecretsService[]>([]);
  const [currentService, setCurrentService] = useState<SecretsService | null>(null);
  const [loading, setLoading] = useState(true);
  const [launchingService, setLaunchingService] = useState(false);
  const [secrets, setSecrets] = useState<Array<{name: string; created_at: string; updated_at: string}>>([]);
  const [selectedSecret, setSelectedSecret] = useState<{name: string; value: string; created_at: string; updated_at: string} | null>(null);
  const [newSecretName, setNewSecretName] = useState("");
  const [newSecretValue, setNewSecretValue] = useState("");
  const [creatingSecret, setCreatingSecret] = useState(false);
  const [loadingSecrets, setLoadingSecrets] = useState(false);
  const [showSecretValue, setShowSecretValue] = useState(false);

  useEffect(() => {
    fetchSecretsServices();
  }, []);

  const fetchSecretsServices = async () => {
    try {
      setLoading(true);
      const response = await apiService.getSecretsServices();
      setSecretsServices(response.secrets_services);
      
      // If we have services, use the first healthy one
      const healthyService = response.secrets_services.find(service => service.is_healthy);
      if (healthyService) {
        setCurrentService(healthyService);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch secrets services",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const launchSecretsService = async () => {
    try {
      setLaunchingService(true);
      const service = await apiService.launchSecretsService();
      
      toast({
        title: "Success",
        description: "Secrets service launched successfully",
        variant: "success",
      });
      
      // Refresh the services list
      await fetchSecretsServices();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to launch secrets service",
        variant: "destructive",
      });
    } finally {
      setLaunchingService(false);
    }
  };

  const checkServiceHealth = async (serviceId: string) => {
    try {
      const health = await apiService.checkSecretsServiceHealth(serviceId);
      toast({
        title: health.is_healthy ? "Service Healthy" : "Service Unhealthy",
        description: `Last check: ${new Date(health.last_check).toLocaleString()}`,
        variant: health.is_healthy ? "success" : "destructive",
      });
      await fetchSecretsServices();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check service health",
        variant: "destructive",
      });
    }
  };

  const createSecret = async () => {
    if (!currentService || !newSecretName.trim() || !newSecretValue.trim()) return;

    try {
      setCreatingSecret(true);
      await apiService.createSecret(currentService.service_id, newSecretName.trim(), newSecretValue.trim());
      
      toast({
        title: "Success",
        description: "Secret created successfully",
        variant: "success",
      });
      
      setNewSecretName("");
      setNewSecretValue("");
      await listSecrets();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create secret",
        variant: "destructive",
      });
    } finally {
      setCreatingSecret(false);
    }
  };

  const listSecrets = async () => {
    if (!currentService) return;

    try {
      setLoadingSecrets(true);
      const response = await apiService.listSecrets(currentService.service_id);
      setSecrets(response.secrets);
      
      toast({
        title: "Success",
        description: `Found ${response.secrets.length} secrets`,
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to list secrets",
        variant: "destructive",
      });
    } finally {
      setLoadingSecrets(false);
    }
  };

  const getSecret = async (secretName: string) => {
    if (!currentService) return;

    try {
      const response = await apiService.getSecret(currentService.service_id, secretName);
      if (response.secret) {
        setSelectedSecret(response.secret);
        setShowSecretValue(false);
      } else {
        toast({
          title: "Error",
          description: "Secret not found",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get secret",
        variant: "destructive",
      });
    }
  };

  const deleteSecret = async (secretName: string) => {
    if (!currentService) return;

    try {
      await apiService.deleteSecret(currentService.service_id, secretName);
      
      toast({
        title: "Success",
        description: "Secret deleted successfully",
        variant: "success",
      });
      
      setSelectedSecret(null);
      await listSecrets();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete secret",
        variant: "destructive",
      });
    }
  };

  const deleteSecretsService = async (serviceId: string) => {
    try {
      await apiService.removeSecretsService(serviceId);
      toast({
        title: "Success",
        description: "Secrets service deleted successfully",
        variant: "success",
      });
      await fetchSecretsServices();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete secrets service",
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
          <h1 className="text-3xl font-bold tracking-tight">UWS Secrets</h1>
          <p className="text-muted-foreground">
            Secure secrets management service with encryption
          </p>
        </div>

        {/* Secrets Service Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <CardTitle>Secrets Service Status</CardTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchSecretsServices}
                disabled={loading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
            <CardDescription>
              Manage your secrets service instances
            </CardDescription>
          </CardHeader>
          <CardContent>
            {secretsServices.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No secrets services running</p>
                <Button
                  onClick={launchSecretsService}
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
                      Launch Secrets Service
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {secretsServices.map((service) => (
                  <motion.div
                    key={service.service_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${service.is_healthy ? 'bg-green-500' : 'bg-red-500'}`} />
                      <div>
                        <div className="font-medium">Secrets Service {service.service_id.slice(-8)}</div>
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
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteSecretsService(service.service_id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Secrets Operations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Key className="h-5 w-5" />
              <span>Secrets Operations</span>
            </CardTitle>
            <CardDescription>
              Manage your encrypted secrets and sensitive data
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!currentService ? (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No secrets service connected</p>
                <p className="text-sm text-muted-foreground">Launch a secrets service to start managing encrypted data</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Secrets Service Connected</h4>
                  <p className="text-sm text-muted-foreground">
                    Service URL: {currentService.service_url}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Service ID: {currentService.service_id}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Plus className="h-4 w-4" />
                        <span className="font-medium">Store Secret</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Securely store encrypted secrets
                      </p>
                      <div className="space-y-2">
                        <Input
                          placeholder="Secret name..."
                          value={newSecretName}
                          onChange={(e) => setNewSecretName(e.target.value)}
                        />
                        <Input
                          type="password"
                          placeholder="Secret value..."
                          value={newSecretValue}
                          onChange={(e) => setNewSecretValue(e.target.value)}
                        />
                        <Button 
                          size="sm" 
                          className="w-full" 
                          onClick={createSecret}
                          disabled={!newSecretName.trim() || !newSecretValue.trim() || creatingSecret}
                        >
                          {creatingSecret ? (
                            <>
                              <Clock className="h-4 w-4 mr-2 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-2" />
                              Store Secret
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Eye className="h-4 w-4" />
                        <span className="font-medium">List Secrets</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        View all stored secrets
                      </p>
                      <Button 
                        size="sm" 
                        className="w-full" 
                        onClick={listSecrets}
                        disabled={loadingSecrets}
                      >
                        {loadingSecrets ? (
                          <>
                            <Clock className="h-4 w-4 mr-2 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-2" />
                            List Secrets
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Trash2 className="h-4 w-4" />
                        <span className="font-medium">Delete Secret</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Permanently remove secrets
                      </p>
                      <Button 
                        size="sm" 
                        className="w-full" 
                        disabled
                      >
                        Select from list
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {secrets.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Stored Secrets</CardTitle>
                      <CardDescription>
                        Encrypted secrets in storage ({secrets.length} total)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 max-h-64 overflow-auto">
                        {secrets.map((secret) => (
                          <div
                            key={secret.name}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="flex-1">
                              <p className="font-medium">{secret.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Created: {new Date(secret.created_at).toLocaleString()}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => getSecret(secret.name)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => deleteSecret(secret.name)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {selectedSecret && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Secret Details</CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedSecret(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <CardDescription>
                        Secret: {selectedSecret.name}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <Label>Secret Value</Label>
                          <div className="flex items-center space-x-2 mt-1">
                            <Input
                              type={showSecretValue ? "text" : "password"}
                              value={selectedSecret.value}
                              readOnly
                              className="flex-1"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowSecretValue(!showSecretValue)}
                            >
                              {showSecretValue ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <Label>Created</Label>
                            <p className="text-muted-foreground">
                              {new Date(selectedSecret.created_at).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <Label>Updated</Label>
                            <p className="text-muted-foreground">
                              {new Date(selectedSecret.updated_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-medium text-red-900 mb-1">Secrets Service Ready</h4>
                  <p className="text-sm text-red-700">
                    Your secrets management service is running and ready to securely store encrypted data. 
                    All secrets are encrypted using Fernet encryption before storage.
                  </p>
                </div>

                {/* Security Features */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Lock className="h-5 w-5" />
                      <span>Security Features</span>
                    </CardTitle>
                    <CardDescription>
                      Your secrets are protected with industry-standard encryption
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Shield className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <h5 className="font-medium">Fernet Encryption</h5>
                          <p className="text-sm text-muted-foreground">
                            All secrets encrypted with symmetric Fernet encryption
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Key className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h5 className="font-medium">Secure Key Management</h5>
                          <p className="text-sm text-muted-foreground">
                            Encryption keys managed securely by the service
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Lock className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <h5 className="font-medium">Encrypted Storage</h5>
                          <p className="text-sm text-muted-foreground">
                            Secrets stored encrypted in the database
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="h-4 w-4 text-orange-600" />
                        </div>
                        <div>
                          <h5 className="font-medium">Audit Trail</h5>
                          <p className="text-sm text-muted-foreground">
                            Track creation and modification timestamps
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}