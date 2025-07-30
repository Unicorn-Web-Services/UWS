"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Table,
  Plus,
  Play,
  Pause,
  Settings,
  Trash2,
  Database,
  BarChart3,
  Zap,
  Search,
  RefreshCw,
  Eye,
  Download,
  Upload,
  Copy,
  FileJson,
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

// Mock data for NoSQL tables
const tables = [
  {
    id: "users-table",
    name: "users",
    itemCount: 15420,
    size: "24.3MB",
    readCapacity: 5,
    writeCapacity: 5,
    status: "active",
    created: "2024-01-10",
    region: "us-east-1",
  },
  {
    id: "sessions-table",
    name: "user-sessions",
    itemCount: 3421,
    size: "8.7MB",
    readCapacity: 10,
    writeCapacity: 3,
    status: "active",
    created: "2024-01-15",
    region: "us-east-1",
  },
  {
    id: "analytics-table",
    name: "analytics-events",
    itemCount: 89234,
    size: "156.8MB",
    readCapacity: 25,
    writeCapacity: 15,
    status: "active",
    created: "2024-01-08",
    region: "us-west-2",
  },
];

const sampleData = [
  {
    id: "user-1",
    data: {
      userId: "usr_abc123",
      email: "john@example.com",
      name: "John Doe",
      createdAt: "2024-01-20T10:30:00Z",
      lastLogin: "2024-01-20T14:25:00Z",
      preferences: {
        theme: "dark",
        notifications: true,
      },
    },
  },
  {
    id: "user-2",
    data: {
      userId: "usr_def456",
      email: "jane@example.com",
      name: "Jane Smith",
      createdAt: "2024-01-19T15:45:00Z",
      lastLogin: "2024-01-20T12:10:00Z",
      preferences: {
        theme: "light",
        notifications: false,
      },
    },
  },
];

export default function NoSQLPage() {
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [showCreateTable, setShowCreateTable] = useState(false);
  const [showQueryBuilder, setShowQueryBuilder] = useState(false);
  const [newTableName, setNewTableName] = useState("");
  const [queryInput, setQueryInput] = useState("");

  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement API call
    console.log("Creating table:", newTableName);
    setNewTableName("");
    setShowCreateTable(false);
  };

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement query execution
    console.log("Executing query:", queryInput);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-100";
      case "creating":
        return "text-yellow-600 bg-yellow-100";
      case "deleting":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Table className="h-8 w-8 text-service-nosql" />
            <div>
              <h1 className="text-3xl font-bold">UWS-NoSQL</h1>
              <p className="text-muted-foreground">
                Non-relational database with flexible schemas
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowCreateTable(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Table
            </Button>
            {selectedTable && (
              <Button
                variant="outline"
                onClick={() => setShowQueryBuilder(true)}
              >
                <Search className="h-4 w-4 mr-2" />
                Query Builder
              </Button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Tables</CardDescription>
              <CardTitle className="text-2xl">{tables.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Items</CardDescription>
              <CardTitle className="text-2xl">108,075</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Storage</CardDescription>
              <CardTitle className="text-2xl">189.8MB</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Monthly Requests</CardDescription>
              <CardTitle className="text-2xl">2.4M</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tables List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Table className="h-5 w-5" />
                  NoSQL Tables
                </CardTitle>
                <CardDescription>Your document databases</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {tables.map((table) => (
                  <motion.div
                    key={table.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedTable(table.id)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedTable === table.id
                        ? "bg-primary/10 border border-primary/20"
                        : "hover:bg-accent"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{table.name}</div>
                        <div
                          className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                            table.status
                          )}`}
                        >
                          {table.status}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>{table.itemCount.toLocaleString()} items</div>
                        <div>Size: {table.size}</div>
                        <div>
                          R: {table.readCapacity} | W: {table.writeCapacity}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Create Table Form */}
            {showCreateTable && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Create New Table</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateTable} className="space-y-4">
                      <div>
                        <Input
                          placeholder="Table name"
                          value={newTableName}
                          onChange={(e) => setNewTableName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="Read capacity"
                          type="number"
                          defaultValue="5"
                        />
                        <Input
                          placeholder="Write capacity"
                          type="number"
                          defaultValue="5"
                        />
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
                          onClick={() => setShowCreateTable(false)}
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

          {/* Table Details */}
          <div className="lg:col-span-2 space-y-6">
            {!selectedTable ? (
              <Card>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    <Table className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Select a table to view its details</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Table Overview */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5" />
                        {tables.find((t) => t.id === selectedTable)?.name}
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-2" />
                          Configure
                        </Button>
                        <Button variant="outline" size="sm">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Backup
                        </Button>
                      </div>
                    </div>
                    <CardDescription>
                      Table configuration and metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const table = tables.find((t) => t.id === selectedTable);
                      if (!table) return null;

                      return (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <div className="text-sm text-muted-foreground">
                              Items
                            </div>
                            <div className="font-medium">
                              {table.itemCount.toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">
                              Size
                            </div>
                            <div className="font-medium">{table.size}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">
                              Read/Write
                            </div>
                            <div className="font-medium">
                              {table.readCapacity}/{table.writeCapacity}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">
                              Region
                            </div>
                            <div className="font-medium">{table.region}</div>
                          </div>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>

                {/* Query Builder */}
                {showQueryBuilder && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Search className="h-5 w-5" />
                          Query Builder
                        </CardTitle>
                        <CardDescription>
                          Build and execute NoSQL queries
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleQuery} className="space-y-4">
                          <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-sm">
                            <div className="text-slate-500">
                              // Query Expression
                            </div>
                            <div className="mt-2">
                              <span className="text-blue-400">scan</span>
                              <span className="text-slate-300"> </span>
                              <span className="text-green-400">
                                {
                                  tables.find((t) => t.id === selectedTable)
                                    ?.name
                                }
                              </span>
                              <br />
                              <span className="text-purple-400">where</span>
                              <span className="text-slate-300"> email </span>
                              <span className="text-yellow-400">contains</span>
                              <span className="text-slate-300"> </span>
                              <span className="text-red-400">
                                "@example.com"
                              </span>
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setShowQueryBuilder(false)}
                            >
                              Close
                            </Button>
                            <Button type="submit" size="sm">
                              <Play className="h-4 w-4 mr-2" />
                              Execute Query
                            </Button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Sample Data Viewer */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileJson className="h-5 w-5" />
                      Sample Data
                    </CardTitle>
                    <CardDescription>Preview table items</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {sampleData.map((item, index) => (
                        <div key={item.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-medium">
                              Item {index + 1}
                            </div>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
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
                          <div className="bg-slate-50 p-3 rounded text-sm font-mono overflow-x-auto">
                            <pre>{JSON.stringify(item.data, null, 2)}</pre>
                          </div>
                        </div>
                      ))}
                      <div className="text-center text-sm text-muted-foreground">
                        Showing 2 of{" "}
                        {tables
                          .find((t) => t.id === selectedTable)
                          ?.itemCount.toLocaleString() || 0}{" "}
                        items
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Performance Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Performance Metrics
                    </CardTitle>
                    <CardDescription>
                      Table usage and performance stats
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          2.4K
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Reads/min
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div className="bg-blue-600 h-2 rounded-full w-3/4" />
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          847
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Writes/min
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div className="bg-green-600 h-2 rounded-full w-1/2" />
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          23ms
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Avg Latency
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div className="bg-purple-600 h-2 rounded-full w-1/4" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
