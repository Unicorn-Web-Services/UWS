"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  Download,
  Trash2,
  File,
  Folder,
  Plus,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Play,
  Server,
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

interface FileInfo {
  filename: string;
  path: string;
  detail: string;
}

interface BucketService {
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

export default function BucketsPage() {
  const { toast } = useToast();
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [bucketServices, setBucketServices] = useState<BucketService[]>([]);
  const [currentService, setCurrentService] = useState<BucketService | null>(null);
  const [launchingService, setLaunchingService] = useState(false);
  const [removingService, setRemovingService] = useState<string | null>(null);

  useEffect(() => {
    fetchBucketServices();
  }, []);

  const fetchBucketServices = async () => {
    try {
      setLoading(true);
      const response = await apiService.getBucketServices();
      setBucketServices(response.bucket_services);
      
      // If we have services, use the first healthy one
      const healthyService = response.bucket_services.find(service => service.is_healthy);
      if (healthyService) {
        setCurrentService(healthyService);
        await fetchFiles(healthyService.service_id);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch bucket services",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const launchBucketService = async () => {
    try {
      setLaunchingService(true);
      const service = await apiService.launchBucketService();
      
      toast({
        title: "Success",
        description: "Bucket service launched successfully",
        variant: "success",
      });
      
      // Refresh the services list
      await fetchBucketServices();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to launch bucket service",
        variant: "destructive",
      });
    } finally {
      setLaunchingService(false);
    }
  };

  const removeBucketService = async (serviceId: string) => {
    try {
      setRemovingService(serviceId);
      await apiService.removeBucketService(serviceId);
      
      toast({
        title: "Success",
        description: "Bucket service removed successfully",
        variant: "success",
      });
      
      // If we're removing the current service, clear it
      if (currentService?.service_id === serviceId) {
        setCurrentService(null);
        setFiles([]);
      }
      
      // Refresh the services list
      await fetchBucketServices();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove bucket service",
        variant: "destructive",
      });
    } finally {
      setRemovingService(null);
    }
  };

  const fetchFiles = async (serviceId: string) => {
    try {
      const response = await apiService.listBucketFiles(serviceId);
      setFiles(response.files.map(filename => ({
        filename,
        path: `/data/${filename}`,
        detail: "File from bucket service"
      })));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch files",
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    if (!currentService) {
      toast({
        title: "Error",
        description: "No bucket service available. Please launch a service first.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      await apiService.uploadToBucket(currentService.service_id, selectedFile);
      
      toast({
        title: "Success",
        description: `${selectedFile.name} uploaded successfully`,
        variant: "success",
      });
      
      setSelectedFile(null);
      await fetchFiles(currentService.service_id);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (filename: string) => {
    if (!currentService) {
      toast({
        title: "Error",
        description: "No bucket service available",
        variant: "destructive",
      });
      return;
    }

    try {
      const blob = await apiService.downloadFromBucket(currentService.service_id, filename);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: `${filename} downloaded successfully`,
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (filename: string) => {
    if (!currentService) {
      toast({
        title: "Error",
        description: "No bucket service available",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiService.deleteFromBucket(currentService.service_id, filename);
      
      toast({
        title: "Success",
        description: `${filename} deleted successfully`,
        variant: "success",
      });
      
      await fetchFiles(currentService.service_id);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete file",
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
          <h1 className="text-3xl font-bold tracking-tight">UWS Buckets</h1>
          <p className="text-muted-foreground">
            S3-like file storage service with upload, download, and file management
          </p>
        </div>

        {/* Bucket Service Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Server className="h-5 w-5" />
                <CardTitle>Bucket Service Status</CardTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchBucketServices}
                disabled={loading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
            <CardDescription>
              Manage your bucket service instances
            </CardDescription>
          </CardHeader>
          <CardContent>
            {bucketServices.length === 0 ? (
              <div className="text-center py-8">
                <Server className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No bucket services running</p>
                <Button
                  onClick={launchBucketService}
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
                      Launch Bucket Service
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-end mb-4">
                  <Button
                    onClick={launchBucketService}
                    disabled={launchingService}
                    size="sm"
                  >
                    {launchingService ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Launching...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Launch New Service
                      </>
                    )}
                  </Button>
                </div>
                {bucketServices.map((service) => (
                  <motion.div
                    key={service.service_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${service.is_healthy ? 'bg-green-500' : 'bg-red-500'}`} />
                      <div>
                        <div className="font-medium">Bucket Service {service.service_id.slice(-8)}</div>
                        <div className="text-sm text-muted-foreground">
                          {service.ip_address}:{service.port} • {service.status}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Created: {new Date(service.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {service.is_healthy && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCurrentService(service);
                            fetchFiles(service.service_id);
                          }}
                          disabled={currentService?.service_id === service.service_id}
                        >
                          {currentService?.service_id === service.service_id ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Active
                            </>
                          ) : (
                            "Use This Service"
                          )}
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeBucketService(service.service_id)}
                        disabled={removingService === service.service_id}
                      >
                        {removingService === service.service_id ? (
                          <>
                            <Clock className="h-4 w-4 mr-2 animate-spin" />
                            Removing...
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>Upload File</span>
            </CardTitle>
            <CardDescription>
              Upload files to your bucket storage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Input
                type="file"
                onChange={handleFileSelect}
                className="flex-1"
                disabled={!currentService}
              />
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || uploading || !currentService}
              >
                {uploading ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </>
                )}
              </Button>
            </div>
            {selectedFile && (
              <div className="text-sm text-muted-foreground">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
              </div>
            )}
            {!currentService && (
              <div className="text-sm text-amber-600">
                Please launch a bucket service first to upload files
              </div>
            )}
          </CardContent>
        </Card>

        {/* Files List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Folder className="h-5 w-5" />
                <CardTitle>Files</CardTitle>
                {currentService && (
                  <div className="text-sm text-muted-foreground">
                    Connected to: {currentService.ip_address}:{currentService.port}
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => currentService && fetchFiles(currentService.service_id)}
                disabled={loading || !currentService}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
            <CardDescription>
              Manage your stored files
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!currentService ? (
              <div className="text-center py-8">
                <File className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No bucket service connected</p>
                <p className="text-sm text-muted-foreground">Launch a bucket service to view files</p>
              </div>
            ) : files.length === 0 ? (
              <div className="text-center py-8">
                <File className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No files uploaded yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {files.map((file, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <File className="h-5 w-5 text-blue-500" />
                      <div>
                        <div className="font-medium">{file.filename}</div>
                        <div className="text-sm text-muted-foreground">
                          {file.detail}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(file.filename)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(file.filename)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
} 