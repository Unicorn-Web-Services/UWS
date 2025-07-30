"use client";

import { useState } from "react";
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
import { createContainer } from "@/lib/uwsapi";
import Terminal from "@/components/terminal";
import DashboardLayout from "@/components/dashboard-layout";

interface ContainerConfig {
  image: string;
  name?: string;
  env?: Record<string, string>;
  cpu: number;
  memory: string;
  ports?: Record<string, number>;
}

interface Container {
  id: string;
  name: string;
  image: string;
  status: "running" | "stopped" | "error" | "created";
  cpu: number;
  memory: string;
  created: Date;
  nodeId?: string;
}

// {
//   id: "container-1",
//   name: "web-app-1",
//   image: "nginx:latest",
//   status: "running",
//   cpu: 0.2,
//   memory: "512m",
//   created: new Date(Date.now() - 2 * 60 * 60 * 1000),
// },

export default function ComputePage() {
  const [containers, setContainers] = useState<Container[]>([]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedContainer, setSelectedContainer] = useState<Container | null>(
    null
  );
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await createContainer(config);
      console.log("Container created successfully:", data);

      // Add to local state
      const newContainer: Container = {
        id: data.container?.id,
        name: config.name || `container-${Date.now()}`,
        image: config.image,
        status: "running",
        cpu: config.cpu,
        memory: config.memory,
        created: new Date(),
        nodeId: data.node_id,
      };

      setContainers((prev) => [...prev, newContainer]);
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
      console.error("Error creating container:", error);
    }
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

  const getStatusColor = (status: Container["status"]) => {
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

  const getStatusIcon = (status: Container["status"]) => {
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
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Container
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Running</CardDescription>
            <CardTitle className="text-2xl text-green-600">
              {containers.filter((c) => c.status === "running").length}
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
              {containers.reduce((sum, c) => sum + c.cpu, 0).toFixed(1)} cores
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Memory Usage</CardDescription>
            <CardTitle className="text-2xl">
              {containers
                .reduce(
                  (sum, c) =>
                    sum +
                    parseFloat(c.memory.replace(/[^\d.]/g, "")) /
                      (c.memory.includes("g") ? 1 : 1024),
                  0
                )
                .toFixed(1)}{" "}
              GB
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Create Form Modal */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 "
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    CPU *
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
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Memory *
                  </label>
                  <Input
                    required
                    placeholder="512m, 1g"
                    value={config.memory}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, memory: e.target.value }))
                    }
                  />
                </div>
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
                <Button type="submit" className="flex-1">
                  Create Container
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Containers List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {containers.map((container) => (
          <motion.div
            key={container.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="cursor-pointer hover:shadow-lg transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(container.status)}
                    <CardTitle className="text-lg">{container.name}</CardTitle>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedContainer(container)}
                    >
                      <TerminalIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>{container.image}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className={getStatusColor(container.status)}>
                      {container.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CPU:</span>
                    <span>{container.cpu} cores</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Memory:</span>
                    <span>{container.memory}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span>{container.created.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Terminal Modal */}
      {selectedContainer && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 "
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-card rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden backdrop-blur-md bg-[#BABABA]"
          >
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Terminal - {selectedContainer.name}
              </h2>
              <Button
                variant="ghost"
                onClick={() => setSelectedContainer(null)}
              >
                ×
              </Button>
            </div>
            <div className="p-4">
              <Terminal
                nodeId={selectedContainer.nodeId || "node-1"}
                containerId={selectedContainer.id}
                orchestratorUrl={process.env.NEXT_PUBLIC_ORCHESTRATOR_URL}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </DashboardLayout>
  );
}
