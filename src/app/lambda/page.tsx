"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Code,
  Plus,
  Play,
  Pause,
  Settings,
  Trash2,
  Clock,
  Zap,
  FileText,
  Upload,
  Eye,
  BarChart3,
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

// Mock data for Lambda functions
const functions = [
  {
    id: "user-auth",
    name: "user-auth",
    runtime: "Node.js 18",
    memory: "128MB",
    timeout: "30s",
    lastInvoked: "2 minutes ago",
    invocations: 1247,
    errors: 3,
    status: "active",
  },
  {
    id: "image-processor",
    name: "image-processor",
    runtime: "Python 3.9",
    memory: "512MB",
    timeout: "5m",
    lastInvoked: "15 minutes ago",
    invocations: 432,
    errors: 1,
    status: "active",
  },
  {
    id: "data-backup",
    name: "data-backup",
    runtime: "Node.js 18",
    memory: "256MB",
    timeout: "10m",
    lastInvoked: "2 hours ago",
    invocations: 89,
    errors: 0,
    status: "inactive",
  },
];

const executions = [
  {
    id: "exec-1",
    functionName: "user-auth",
    timestamp: "2024-01-20 14:32:15",
    duration: "245ms",
    status: "success",
    requestId: "abc123-def456",
  },
  {
    id: "exec-2",
    functionName: "image-processor",
    timestamp: "2024-01-20 14:30:42",
    duration: "1.2s",
    status: "success",
    requestId: "ghi789-jkl012",
  },
  {
    id: "exec-3",
    functionName: "user-auth",
    timestamp: "2024-01-20 14:28:33",
    duration: "180ms",
    status: "error",
    requestId: "mno345-pqr678",
  },
];

export default function LambdaPage() {
  const [selectedFunction, setSelectedFunction] = useState<string | null>(null);
  const [showCreateFunction, setShowCreateFunction] = useState(false);
  const [newFunctionName, setNewFunctionName] = useState("");
  const [selectedRuntime, setSelectedRuntime] = useState("nodejs18");

  const handleCreateFunction = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement API call
    console.log("Creating function:", newFunctionName, selectedRuntime);
    setNewFunctionName("");
    setShowCreateFunction(false);
  };

  const handleTestFunction = (functionId: string) => {
    // TODO: Implement function testing
    console.log("Testing function:", functionId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-600";
      case "error":
        return "text-red-600";
      case "active":
        return "text-green-600";
      case "inactive":
        return "text-yellow-600";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Code className="h-8 w-8 text-service-lambda" />
            <div>
              <h1 className="text-3xl font-bold">UWS-Lambda</h1>
              <p className="text-muted-foreground">
                On-demand serverless code execution
              </p>
            </div>
          </div>
          <Button onClick={() => setShowCreateFunction(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Function
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Functions</CardDescription>
              <CardTitle className="text-2xl">{functions.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Invocations</CardDescription>
              <CardTitle className="text-2xl">1,768</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Error Rate</CardDescription>
              <CardTitle className="text-2xl">0.23%</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Avg Duration</CardDescription>
              <CardTitle className="text-2xl">542ms</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Functions List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Functions
                </CardTitle>
                <CardDescription>Your Lambda functions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {functions.map((func) => (
                  <motion.div
                    key={func.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedFunction(func.id)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedFunction === func.id
                        ? "bg-primary/10 border border-primary/20"
                        : "hover:bg-accent"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{func.name}</div>
                        <div
                          className={`text-xs px-2 py-1 rounded-full ${
                            func.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {func.status}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>
                          {func.runtime} • {func.memory}
                        </div>
                        <div>{func.invocations} invocations</div>
                        <div>Last: {func.lastInvoked}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Create Function Form */}
            {showCreateFunction && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Create New Function</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateFunction} className="space-y-4">
                      <div>
                        <Input
                          placeholder="Function name"
                          value={newFunctionName}
                          onChange={(e) => setNewFunctionName(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <select
                          value={selectedRuntime}
                          onChange={(e) => setSelectedRuntime(e.target.value)}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="nodejs18">Node.js 18</option>
                          <option value="python39">Python 3.9</option>
                          <option value="python310">Python 3.10</option>
                          <option value="go119">Go 1.19</option>
                          <option value="java11">Java 11</option>
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Create
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowCreateFunction(false)}
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

          {/* Function Details */}
          <div className="lg:col-span-2 space-y-6">
            {!selectedFunction ? (
              <Card>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    <Code className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Select a function to view its details</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Function Configuration */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        {functions.find((f) => f.id === selectedFunction)?.name}
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleTestFunction(selectedFunction)}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Test
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-2" />
                          Configure
                        </Button>
                        <Button variant="outline" size="sm">
                          <Upload className="h-4 w-4 mr-2" />
                          Deploy
                        </Button>
                      </div>
                    </div>
                    <CardDescription>
                      Function configuration and monitoring
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const func = functions.find(
                        (f) => f.id === selectedFunction
                      );
                      if (!func) return null;

                      return (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <div className="text-sm text-muted-foreground">
                              Runtime
                            </div>
                            <div className="font-medium">{func.runtime}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">
                              Memory
                            </div>
                            <div className="font-medium">{func.memory}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">
                              Timeout
                            </div>
                            <div className="font-medium">{func.timeout}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">
                              Invocations
                            </div>
                            <div className="font-medium">
                              {func.invocations}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>

                {/* Code Editor */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Code Editor
                    </CardTitle>
                    <CardDescription>Edit your function code</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-sm">
                      <div className="text-slate-500">// index.js</div>
                      <div className="mt-2">
                        <div className="text-blue-400">exports</div>
                        <span className="text-slate-300">.handler = </span>
                        <span className="text-yellow-400">async</span>
                        <span className="text-slate-300"> (</span>
                        <span className="text-orange-400">event</span>
                        <span className="text-slate-300">, </span>
                        <span className="text-orange-400">context</span>
                        <span className="text-slate-300">) =&gt; </span>
                        <span className="text-slate-300">{"{"}</span>
                        <br />
                        <span className="ml-4 text-slate-500">
                          // Your function code here
                        </span>
                        <br />
                        <span className="ml-4 text-purple-400">return</span>
                        <span className="text-slate-300"> {"{"}</span>
                        <br />
                        <span className="ml-8 text-green-400">statusCode</span>
                        <span className="text-slate-300">: </span>
                        <span className="text-yellow-400">200</span>
                        <span className="text-slate-300">,</span>
                        <br />
                        <span className="ml-8 text-green-400">body</span>
                        <span className="text-slate-300">: </span>
                        <span className="text-red-400">JSON</span>
                        <span className="text-slate-300">.</span>
                        <span className="text-blue-400">stringify</span>
                        <span className="text-slate-300">(</span>
                        <span className="text-orange-400">
                          'Hello from Lambda!'
                        </span>
                        <span className="text-slate-300">)</span>
                        <br />
                        <span className="ml-4 text-slate-300">{"}"}</span>
                        <br />
                        <span className="text-slate-300">{"}"}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <div className="text-sm text-muted-foreground">
                        Last modified: 2 hours ago
                      </div>
                      <Button size="sm">Save Changes</Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Recent Executions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Recent Executions
                </CardTitle>
                <CardDescription>Function execution history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {executions.map((execution) => (
                    <div
                      key={execution.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            execution.status === "success"
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        />
                        <div>
                          <div className="font-medium">
                            {execution.functionName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {execution.timestamp} • {execution.requestId}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{execution.duration}</div>
                        <div
                          className={`text-xs ${getStatusColor(
                            execution.status
                          )}`}
                        >
                          {execution.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
