"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Key,
  Plus,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  Shield,
  Lock,
  RefreshCw,
  AlertTriangle,
  Clock,
  Settings,
  Edit,
  Search,
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

// Mock data for secrets
const secrets = [
  {
    id: "db-password",
    name: "database-password",
    description: "Production database password",
    type: "password",
    lastAccessed: "2024-01-20 14:30",
    created: "2024-01-10",
    tags: ["production", "database"],
    accessCount: 145,
  },
  {
    id: "api-key",
    name: "stripe-api-key",
    description: "Stripe payment gateway API key",
    type: "api-key",
    lastAccessed: "2024-01-20 12:15",
    created: "2024-01-15",
    tags: ["payments", "stripe"],
    accessCount: 67,
  },
  {
    id: "jwt-secret",
    name: "jwt-signing-secret",
    description: "JWT token signing secret",
    type: "secret",
    lastAccessed: "2024-01-20 09:45",
    created: "2024-01-08",
    tags: ["auth", "jwt"],
    accessCount: 234,
  },
  {
    id: "ssh-key",
    name: "deployment-ssh-key",
    description: "SSH key for deployment servers",
    type: "ssh-key",
    lastAccessed: "2024-01-19 16:20",
    created: "2024-01-05",
    tags: ["deployment", "ssh"],
    accessCount: 89,
  },
];

const auditLogs = [
  {
    id: "1",
    action: "Secret Accessed",
    secret: "database-password",
    user: "john@uws.com",
    timestamp: "2024-01-20 14:30:15",
    ip: "192.168.1.100",
    status: "success",
  },
  {
    id: "2",
    action: "Secret Created",
    secret: "new-api-key",
    user: "admin@uws.com",
    timestamp: "2024-01-20 13:45:22",
    ip: "192.168.1.50",
    status: "success",
  },
  {
    id: "3",
    action: "Failed Access",
    secret: "production-key",
    user: "test@uws.com",
    timestamp: "2024-01-20 12:20:33",
    ip: "192.168.1.200",
    status: "failed",
  },
];

export default function SecretsPage() {
  const [selectedSecret, setSelectedSecret] = useState<string | null>(null);
  const [showCreateSecret, setShowCreateSecret] = useState(false);
  const [showSecretValue, setShowSecretValue] = useState<{
    [key: string]: boolean;
  }>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [newSecretName, setNewSecretName] = useState("");
  const [newSecretValue, setNewSecretValue] = useState("");
  const [newSecretDescription, setNewSecretDescription] = useState("");

  const handleCreateSecret = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement API call
    console.log("Creating secret:", newSecretName);
    setNewSecretName("");
    setNewSecretValue("");
    setNewSecretDescription("");
    setShowCreateSecret(false);
  };

  const handleCopySecret = (secretId: string) => {
    // TODO: Implement copy to clipboard
    console.log("Copying secret:", secretId);
  };

  const toggleSecretVisibility = (secretId: string) => {
    setShowSecretValue((prev) => ({
      ...prev,
      [secretId]: !prev[secretId],
    }));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "password":
        return Lock;
      case "api-key":
        return Key;
      case "ssh-key":
        return Shield;
      default:
        return Key;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-600";
      case "failed":
        return "text-red-600";
      case "warning":
        return "text-yellow-600";
      default:
        return "text-muted-foreground";
    }
  };

  const filteredSecrets = secrets.filter(
    (secret) =>
      secret.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      secret.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      secret.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Key className="h-8 w-8 text-service-secrets" />
            <div>
              <h1 className="text-3xl font-bold">UWS-Secrets</h1>
              <p className="text-muted-foreground">
                Encrypted secrets management
              </p>
            </div>
          </div>
          <Button onClick={() => setShowCreateSecret(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Secret
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Secrets</CardDescription>
              <CardTitle className="text-2xl">{secrets.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Accesses</CardDescription>
              <CardTitle className="text-2xl">535</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Failed Attempts</CardDescription>
              <CardTitle className="text-2xl text-red-600">12</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Active Users</CardDescription>
              <CardTitle className="text-2xl">8</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Secrets List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Secrets
                  </CardTitle>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search secrets..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
                <CardDescription>
                  Manage your encrypted secrets and API keys
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredSecrets.map((secret) => {
                    const TypeIcon = getTypeIcon(secret.type);
                    return (
                      <motion.div
                        key={secret.id}
                        whileHover={{ scale: 1.01 }}
                        className="p-4 rounded-lg border hover:bg-accent cursor-pointer"
                        onClick={() => setSelectedSecret(secret.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <TypeIcon className="h-5 w-5 text-service-secrets" />
                            <div>
                              <div className="font-medium">{secret.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {secret.description}
                              </div>
                              <div className="flex gap-1 mt-1">
                                {secret.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="text-xs bg-primary/10 text-primary px-2 py-1 rounded"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSecretVisibility(secret.id);
                              }}
                            >
                              {showSecretValue[secret.id] ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopySecret(secret.id);
                              }}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        {showSecretValue[secret.id] && (
                          <div className="mt-3 p-3 bg-slate-900 text-slate-100 rounded font-mono text-sm">
                            <div className="text-slate-500">
                              // Secret Value (Encrypted)
                            </div>
                            <div className="mt-1 break-all">
                              {secret.type === "ssh-key"
                                ? "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC..."
                                : "••••••••••••••••••••••••••••••••"}
                            </div>
                          </div>
                        )}
                        <div className="mt-3 text-xs text-muted-foreground">
                          Last accessed: {secret.lastAccessed} •{" "}
                          {secret.accessCount} total accesses
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Create Secret Form */}
            {showCreateSecret && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Create New Secret</CardTitle>
                    <CardDescription>
                      Store a new encrypted secret
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateSecret} className="space-y-4">
                      <div>
                        <Input
                          placeholder="Secret name"
                          value={newSecretName}
                          onChange={(e) => setNewSecretName(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Input
                          placeholder="Description"
                          value={newSecretDescription}
                          onChange={(e) =>
                            setNewSecretDescription(e.target.value)
                          }
                          required
                        />
                      </div>
                      <div>
                        <textarea
                          placeholder="Secret value"
                          value={newSecretValue}
                          onChange={(e) => setNewSecretValue(e.target.value)}
                          className="w-full p-2 border rounded-md h-24 resize-none font-mono"
                          required
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Create Secret
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowCreateSecret(false)}
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

          {/* Audit Logs */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Audit Logs
                </CardTitle>
                <CardDescription>Recent secret access activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="p-3 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-sm">{log.action}</div>
                        <div
                          className={`text-xs ${getStatusColor(log.status)}`}
                        >
                          {log.status}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>Secret: {log.secret}</div>
                        <div>User: {log.user}</div>
                        <div>IP: {log.ip}</div>
                        <div>{log.timestamp}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Security Recommendations */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Security Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                    <div>
                      <div className="font-medium">
                        Rotate secrets regularly
                      </div>
                      <div className="text-muted-foreground">
                        Change secrets every 90 days
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Monitor access patterns</div>
                      <div className="text-muted-foreground">
                        Review audit logs regularly
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                    <div>
                      <div className="font-medium">
                        Use principle of least privilege
                      </div>
                      <div className="text-muted-foreground">
                        Grant minimal required access
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
