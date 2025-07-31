"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Server,
  Plus,
  Play,
  Square,
  Trash2,
  Settings,
  Activity,
  Terminal as TerminalIcon,
  ExternalLink,
  AlertCircle,
  RefreshCw,
  RotateCcw,
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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/lib/toast-context";
import { useContainers, useHealthMonitoring } from "@/lib/hooks/useApi";
import { ContainerConfig } from "@/lib/api";
import CleanTerminal from "@/components/clean-terminal";
import InstancePresets from "@/components/instance-presets";
import DashboardLayout from "@/components/dashboard-layout";

export default function ComputePage() {
  const { toast } = useToast();
  const {
    containers,
    loading,
    error,
    createContainer,
    startContainer,
    stopContainer,
    deleteContainer,
    fetchContainers,
  } = useContainers();
  const { orchestratorHealth, serverHealth } = useHealthMonitoring();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedContainer, setSelectedContainer] = useState<any>(null);
  const [config, setConfig] = useState<ContainerConfig>({
    image: "",
    cpu: 0.2,
    memory: "512m",
    env: {},
    ports: {},
  });

  const [envKey, setEnvKey] = useState("");
  const [envValue, setEnvValue] = useState("");
  const [portKey, setPortKey] = useState("");
  const [portValue, setPortValue] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [showTerminal, setShowTerminal] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      await createContainer(config);
      toast({
        title: "Success",
        description: "Container created successfully",
        variant: "success",
      });

      setShowCreateForm(false);
      setConfig({
        image: "",
        name: "",
        env: {},
        cpu: 0.2,
        memory: "512m",
        ports: {},
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create container",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleStartContainer = async (containerId: string) => {
    try {
      await startContainer(containerId);
      toast({
        title: "Success",
        description: "Container started successfully",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to start container",
        variant: "destructive",
      });
    }
  };

  const handleStopContainer = async (containerId: string) => {
    try {
      await stopContainer(containerId);
      toast({
        title: "Success",
        description: "Container stopped successfully",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to stop container",
        variant: "destructive",
      });
    }
  };

  const handleDeleteContainer = async (containerId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this container? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await deleteContainer(containerId);
      toast({
        title: "Success",
        description: "Container deleted successfully",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete container",
        variant: "destructive",
      });
    }
  };

  const handlePresetSelect = (presetConfig: Partial<ContainerConfig>) => {
    setConfig((prev) => ({
      ...prev,
      ...presetConfig,
    }));
  };

  const addEnvironmentVariable = () => {
    if (envKey && envValue) {
      setConfig((prev) => ({
        ...prev,
        env: { ...prev.env, [envKey]: envValue },
      }));
      setEnvKey("");
      setEnvValue("");
    }
  };

  const removeEnvironmentVariable = (key: string) => {
    setConfig((prev) => ({
      ...prev,
      env: Object.fromEntries(
        Object.entries(prev.env || {}).filter(([k]) => k !== key)
      ),
    }));
  };

  const addPort = () => {
    if (portKey && portValue) {
      setConfig((prev) => ({
        ...prev,
        ports: { ...prev.ports, [portKey]: parseInt(portValue) },
      }));
      setPortKey("");
      setPortValue("");
    }
  };

  const removePort = (key: string) => {
    setConfig((prev) => ({
      ...prev,
      ports: Object.fromEntries(
        Object.entries(prev.ports || {}).filter(([k]) => k !== key)
      ),
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "text-green-600";
      case "stopped":
        return "text-gray-500";
      case "error":
        return "text-red-600";
      default:
        return "text-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running":
        return <Play className="h-4 w-4 text-green-600" />;
      case "stopped":
        return <Square className="h-4 w-4 text-gray-500" />;
      case "error":
        return <Trash2 className="h-4 w-4 text-red-600" />;
      default:
        return <Square className="h-4 w-4 text-gray-500" />;
    }
  };

  const runningContainers = containers.filter((c) => c.status === "running");
  const totalCpu = containers.reduce((sum, c) => sum + (c.cpu || 0), 0);
  const totalMemory = containers.reduce((sum, c) => {
    const memoryStr = c.memory || "0m";
    const value = parseFloat(memoryStr.replace(/[^\d.]/g, ""));
    const unit = memoryStr.includes("g")
      ? 1
      : memoryStr.includes("m")
      ? 1 / 1024
      : 1 / 1024 / 1024;
    return sum + value * unit;
  }, 0);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Server className="h-8 w-8 service-compute" />
          <div>
            <h1 className="text-3xl font-bold">UWS-Compute</h1>
            <p className="text-muted-foreground">
              Containerized Application Execution
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchContainers}
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Container
          </Button>
        </div>
      </div>

      {/* Health Status */}
      {(orchestratorHealth || serverHealth) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {orchestratorHealth && (
            <Card
              className={
                orchestratorHealth.status === "healthy"
                  ? "border-green-200"
                  : "border-red-200"
              }
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      orchestratorHealth.status === "healthy"
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  />
                  Orchestrator Health
                </CardTitle>
                <CardDescription className="text-xs">
                  {orchestratorHealth.status === "healthy"
                    ? "All systems operational"
                    : "Service issues detected"}
                </CardDescription>
              </CardHeader>
            </Card>
          )}
          {serverHealth && (
            <Card
              className={
                serverHealth.status === "healthy"
                  ? "border-green-200"
                  : "border-red-200"
              }
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      serverHealth.status === "healthy"
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  />
                  Server Health
                </CardTitle>
                <CardDescription className="text-xs">
                  {serverHealth.status === "healthy"
                    ? "All systems operational"
                    : "Service issues detected"}
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50 mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">Error:</span>
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Running</CardDescription>
            <CardTitle className="text-2xl text-green-600">
              {runningContainers.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Containers</CardDescription>
            <CardTitle className="text-2xl">{containers.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>CPU Usage</CardDescription>
            <CardTitle className="text-2xl">
              {totalCpu.toFixed(1)} cores
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Memory Usage</CardDescription>
            <CardTitle className="text-2xl">
              {totalMemory.toFixed(1)} GB
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Create Form Modal */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-card rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto backdrop-blur-md bg-white"
          >
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Create New Container</h2>
                <Button
                  variant="ghost"
                  onClick={() => setShowCreateForm(false)}
                >
                  ×
                </Button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Image *
                  </label>
                  <Input
                    required
                    placeholder="e.g., nginx:latest"
                    value={config.image}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, image: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <Input
                    placeholder="e.g., my-container"
                    value={config.name || ""}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        name: e.target.value || undefined,
                      }))
                    }
                  />
                </div>
              </div>

              {/* Instance Presets */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Instance Configuration
                </label>
                <div className="mb-4">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex-1">
                      <label className="block text-sm text-muted-foreground mb-1">
                        CPU (vCPU)
                      </label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0.1"
                        required
                        placeholder="0.2"
                        value={config.cpu}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            cpu: parseFloat(e.target.value),
                          }))
                        }
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm text-muted-foreground mb-1">
                        Memory
                      </label>
                      <Input
                        required
                        placeholder="512m, 1g"
                        value={config.memory}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            memory: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    💡 Select a preset below or customize manually
                  </div>
                </div>
                <InstancePresets
                  onPresetSelect={handlePresetSelect}
                  selectedPreset={selectedPreset}
                />
              </div>

              {/* Environment Variables */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Environment Variables
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Key"
                    value={envKey}
                    onChange={(e) => setEnvKey(e.target.value)}
                  />
                  <Input
                    placeholder="Value"
                    value={envValue}
                    onChange={(e) => setEnvValue(e.target.value)}
                  />
                  <Button type="button" onClick={addEnvironmentVariable}>
                    Add
                  </Button>
                </div>
                {Object.entries(config.env || {}).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between bg-muted px-3 py-2 rounded-md mb-1"
                  >
                    <span className="text-sm">
                      <strong>{key}:</strong> {value}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEnvironmentVariable(key)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>

              {/* Ports */}
              <div>
                <label className="block text-sm font-medium mb-2">Ports</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Port (e.g., 5000/tcp)"
                    value={portKey}
                    onChange={(e) => setPortKey(e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Host Port (e.g., 8080)"
                    value={portValue}
                    onChange={(e) => setPortValue(e.target.value)}
                  />
                  <Button type="button" onClick={addPort}>
                    Add
                  </Button>
                </div>
                {Object.entries(config.ports || {}).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between bg-muted px-3 py-2 rounded-md mb-1"
                  >
                    <span className="text-sm">
                      <strong>{key}:</strong> {value}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removePort(key)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1" disabled={isCreating}>
                  {isCreating ? "Creating..." : "Create Container"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Containers List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : containers.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Server className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No containers found</h3>
            <p className="text-muted-foreground mb-4">
              Get started by creating your first container
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Container
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {containers.map((container) => (
            <motion.div
              key={container.container_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="cursor-pointer hover:shadow-lg transition-all bg-[#bababa]">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(container.status)}
                      <CardTitle className="text-lg">
                        {container.name ||
                          container.container_id ||
                          "Unknown Container"}
                      </CardTitle>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowTerminal(container.container_id)}
                        title="Open Terminal"
                      >
                        <TerminalIcon className="h-4 w-4" />
                      </Button>
                      {container.status === "running" ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleStopContainer(container.container_id)
                          }
                          title="Stop Container"
                        >
                          <Square className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleStartContainer(container.container_id)
                          }
                          title="Start Container"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleDeleteContainer(container.container_id)
                        }
                        title="Delete Container"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription>
                    {container.image || "No image specified"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge
                        variant={
                          container.status === "running"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {container.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">CPU:</span>
                      <span>{container.cpu || 0} vCPU</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Memory:</span>
                      <span>{container.memory || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Node:</span>
                      <span className="font-mono text-xs">
                        {container.node_id
                          ? container.node_id.substring(0, 8) + "..."
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created:</span>
                      <span>
                        {container.created_at
                          ? new Date(container.created_at).toLocaleString()
                          : "Unknown"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Clean Terminal Modal */}
      {showTerminal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-6xl max-h-[90vh] overflow-hidden"
          >
            <CleanTerminal
              nodeId={
                containers.find((c) => c.container_id === showTerminal)
                  ?.node_id || "unknown"
              }
              containerId={showTerminal}
              containerName={
                containers.find((c) => c.container_id === showTerminal)?.name
              }
              onClose={() => setShowTerminal(null)}
            />
          </motion.div>
        </motion.div>
      )}
    </DashboardLayout>
  );
}
