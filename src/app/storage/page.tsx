"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Cloud,
  Plus,
  Upload,
  Download,
  Trash2,
  FolderPlus,
  File,
  Folder,
  Search,
  MoreVertical,
  Copy,
  Share2,
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
import DashboardLayout from "@/components/dashboard-layout";

// Mock data for storage
const buckets = [
  {
    id: "web-assets",
    name: "web-assets",
    files: 245,
    size: "1.2GB",
    created: "2024-01-15",
    region: "us-east-1",
  },
  {
    id: "user-uploads",
    name: "user-uploads",
    files: 1832,
    size: "3.7GB",
    created: "2024-01-10",
    region: "us-east-1",
  },
  {
    id: "backups",
    name: "backups",
    files: 56,
    size: "12.4GB",
    created: "2024-01-05",
    region: "us-west-2",
  },
];

const files = [
  {
    id: "1",
    name: "profile-image.jpg",
    type: "image",
    size: "245KB",
    modified: "2024-01-20 14:30",
    url: "#",
  },
  {
    id: "2",
    name: "documents",
    type: "folder",
    size: "—",
    modified: "2024-01-19 09:15",
    url: "#",
  },
  {
    id: "3",
    name: "backup-2024-01-20.zip",
    type: "archive",
    size: "1.2MB",
    modified: "2024-01-20 02:00",
    url: "#",
  },
  {
    id: "4",
    name: "config.json",
    type: "file",
    size: "2.1KB",
    modified: "2024-01-18 16:45",
    url: "#",
  },
];

export default function StoragePage() {
  const [selectedBucket, setSelectedBucket] = useState<string | null>(null);
  const [showCreateBucket, setShowCreateBucket] = useState(false);
  const [newBucketName, setNewBucketName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const handleCreateBucket = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement API call
    console.log("Creating bucket:", newBucketName);
    setNewBucketName("");
    setShowCreateBucket(false);
  };

  const handleFileUpload = () => {
    // TODO: Implement file upload
    console.log("File upload clicked");
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "folder":
        return Folder;
      case "image":
        return File;
      default:
        return File;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Cloud className="h-8 w-8 text-service-storage" />
            <div>
              <h1 className="text-3xl font-bold">UWS-S3 Storage</h1>
              <p className="text-muted-foreground">
                Object storage with bucket organization
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowCreateBucket(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Bucket
            </Button>
            {selectedBucket && (
              <Button onClick={handleFileUpload}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Files
              </Button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Buckets</CardDescription>
              <CardTitle className="text-2xl">{buckets.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Storage</CardDescription>
              <CardTitle className="text-2xl">17.3GB</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Files</CardDescription>
              <CardTitle className="text-2xl">2,133</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Monthly Cost</CardDescription>
              <CardTitle className="text-2xl text-green-600">$12.45</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Buckets List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cloud className="h-5 w-5" />
                  Buckets
                </CardTitle>
                <CardDescription>Your storage buckets</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {buckets.map((bucket) => (
                  <motion.div
                    key={bucket.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedBucket(bucket.id)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedBucket === bucket.id
                        ? "bg-primary/10 border border-primary/20"
                        : "hover:bg-accent"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Cloud className="h-4 w-4 text-service-storage" />
                        <div>
                          <div className="font-medium">{bucket.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {bucket.files} files • {bucket.size}
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Create Bucket Form */}
            {showCreateBucket && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Create New Bucket</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateBucket} className="space-y-4">
                      <div>
                        <Input
                          placeholder="Bucket name"
                          value={newBucketName}
                          onChange={(e) => setNewBucketName(e.target.value)}
                          required
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Must be unique and contain only lowercase letters,
                          numbers, and hyphens
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" size="sm">
                          <FolderPlus className="h-4 w-4 mr-2" />
                          Create
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowCreateBucket(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* File Browser */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <File className="h-5 w-5" />
                    {selectedBucket
                      ? `Files in ${selectedBucket}`
                      : "Select a bucket"}
                  </CardTitle>
                  {selectedBucket && (
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search files..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 w-64"
                        />
                      </div>
                    </div>
                  )}
                </div>
                {selectedBucket && (
                  <CardDescription>
                    Browse and manage files in your selected bucket
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {!selectedBucket ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Cloud className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Select a bucket to view its contents</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {files
                      .filter((file) =>
                        file.name
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase())
                      )
                      .map((file) => {
                        const Icon = getFileIcon(file.type);
                        return (
                          <motion.div
                            key={file.id}
                            whileHover={{ scale: 1.01 }}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-accent cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <Icon
                                className={`h-5 w-5 ${
                                  file.type === "folder"
                                    ? "text-blue-500"
                                    : "text-muted-foreground"
                                }`}
                              />
                              <div>
                                <div className="font-medium">{file.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {file.size} • Modified {file.modified}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Share2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </motion.div>
                        );
                      })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
