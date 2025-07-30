"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Database,
  Plus,
  Play,
  Pause,
  Settings,
  Trash2,
  Users,
  HardDrive,
  Cpu,
  BarChart3,
  RefreshCw,
  Eye,
  Download,
  Upload,
  AlertTriangle,
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

// Mock data for database instances
const databases = [
  {
    id: "prod-db",
    name: "production-database",
    engine: "PostgreSQL 15",
    size: "db.t3.medium",
    storage: "100GB",
    status: "running",
    connections: 45,
    maxConnections: 100,
    cpu: 12,
    created: "2024-01-10",
    endpoint: "prod-db.uws-rdb.amazonaws.com:5432",
  },
  {
    id: "staging-db",
    name: "staging-database",
    engine: "PostgreSQL 15",
    size: "db.t3.small",
    storage: "20GB",
    status: "running",
    connections: 8,
    maxConnections: 50,
    cpu: 5,
    created: "2024-01-15",
    endpoint: "staging-db.uws-rdb.amazonaws.com:5432",
  },
  {
    id: "dev-db",
    name: "development-database",
    engine: "MySQL 8.0",
    size: "db.t3.micro",
    storage: "10GB",
    status: "stopped",
    connections: 0,
    maxConnections: 20,
    cpu: 0,
    created: "2024-01-18",
    endpoint: "dev-db.uws-rdb.amazonaws.com:3306",
  },
];

const recentActivity = [
  {
    id: "1",
    database: "production-database",
    action: "Backup completed",
    timestamp: "2024-01-20 14:30:00",
    status: "success",
  },
  {
    id: "2",
    database: "staging-database",
    action: "Connection spike detected",
    timestamp: "2024-01-20 14:15:22",
    status: "warning",
  },
  {
    id: "3",
    database: "production-database",
    action: "Performance optimization applied",
    timestamp: "2024-01-20 13:45:10",
    status: "success",
  },
];

export default function DatabasePage() {
  const [selectedDatabase, setSelectedDatabase] = useState<string | null>(null);
  const [showCreateDatabase, setShowCreateDatabase] = useState(false);
  const [newDatabaseName, setNewDatabaseName] = useState("");
  const [selectedEngine, setSelectedEngine] = useState("postgresql15");

  const handleCreateDatabase = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement API call
    console.log("Creating database:", newDatabaseName, selectedEngine);
    setNewDatabaseName("");
    setShowCreateDatabase(false);
  };

  const handleDatabaseAction = (action: string, databaseId: string) => {
    // TODO: Implement database actions
    console.log(`${action} database:`, databaseId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "text-green-600 bg-green-100";
      case "stopped":
        return "text-red-600 bg-red-100";
      case "starting":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getActivityStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-600";
      case "warning":
        return "text-yellow-600";
      case "error":
        return "text-red-600";
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
            <Database className="h-8 w-8 text-service-database" />
            <div>
              <h1 className="text-3xl font-bold">UWS-RDB</h1>
              <p className="text-muted-foreground">
                Managed relational database service
              </p>
            </div>
          </div>
          <Button onClick={() => setShowCreateDatabase(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Database
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Instances</CardDescription>
              <CardTitle className="text-2xl">{databases.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Active Connections</CardDescription>
              <CardTitle className="text-2xl">53</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Storage</CardDescription>
              <CardTitle className="text-2xl">130GB</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Monthly Cost</CardDescription>
              <CardTitle className="text-2xl text-green-600">$87.50</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Database List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Database Instances
                </CardTitle>
                <CardDescription>Your managed databases</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {databases.map((db) => (
                  <motion.div
                    key={db.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedDatabase(db.id)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedDatabase === db.id
                        ? "bg-primary/10 border border-primary/20"
                        : "hover:bg-accent"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{db.name}</div>
                        <div
                          className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                            db.status
                          )}`}
                        >
                          {db.status}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>
                          {db.engine} • {db.size}
                        </div>
                        <div>
                          {db.connections}/{db.maxConnections} connections
                        </div>
                        <div>
                          CPU: {db.cpu}% • Storage: {db.storage}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Create Database Form */}
            {showCreateDatabase && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Create New Database</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateDatabase} className="space-y-4">
                      <div>
                        <Input
                          placeholder="Database identifier"
                          value={newDatabaseName}
                          onChange={(e) => setNewDatabaseName(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <select
                          value={selectedEngine}
                          onChange={(e) => setSelectedEngine(e.target.value)}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="postgresql15">PostgreSQL 15</option>
                          <option value="postgresql14">PostgreSQL 14</option>
                          <option value="mysql80">MySQL 8.0</option>
                          <option value="mysql57">MySQL 5.7</option>
                          <option value="mariadb106">MariaDB 10.6</option>
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
                          onClick={() => setShowCreateDatabase(false)}
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

          {/* Database Details */}
          <div className="lg:col-span-2 space-y-6">
            {!selectedDatabase ? (
              <Card>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    <Database className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Select a database to view its details</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Database Overview */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <HardDrive className="h-5 w-5" />
                        {
                          databases.find((db) => db.id === selectedDatabase)
                            ?.name
                        }
                      </CardTitle>
                      <div className="flex gap-2">
                        {(() => {
                          const db = databases.find(
                            (db) => db.id === selectedDatabase
                          );
                          return db?.status === "running" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleDatabaseAction("stop", selectedDatabase)
                              }
                            >
                              <Pause className="h-4 w-4 mr-2" />
                              Stop
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() =>
                                handleDatabaseAction("start", selectedDatabase)
                              }
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Start
                            </Button>
                          );
                        })()}
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
                      Database configuration and monitoring
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const db = databases.find(
                        (db) => db.id === selectedDatabase
                      );
                      if (!db) return null;

                      return (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <div className="text-sm text-muted-foreground">
                              Engine
                            </div>
                            <div className="font-medium">{db.engine}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">
                              Instance Size
                            </div>
                            <div className="font-medium">{db.size}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">
                              Storage
                            </div>
                            <div className="font-medium">{db.storage}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">
                              Endpoint
                            </div>
                            <div className="font-medium text-xs">
                              {db.endpoint}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
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
                      Real-time database performance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const db = databases.find(
                        (db) => db.id === selectedDatabase
                      );
                      if (!db) return null;

                      return (
                        <div className="grid grid-cols-3 gap-6">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {db.cpu}%
                            </div>
                            <div className="text-sm text-muted-foreground">
                              CPU Usage
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${db.cpu}%` }}
                              />
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {db.connections}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Connections
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                              <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{
                                  width: `${
                                    (db.connections / db.maxConnections) * 100
                                  }%`,
                                }}
                              />
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">
                              45ms
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Avg Query Time
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                              <div className="bg-purple-600 h-2 rounded-full w-1/3" />
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>

                {/* Query Console */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      Query Console
                    </CardTitle>
                    <CardDescription>
                      Execute SQL queries directly
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-sm">
                        <div className="text-slate-500">
                          -- SQL Query Console
                        </div>
                        <div className="mt-2">
                          <span className="text-blue-400">SELECT</span>
                          <span className="text-slate-300"> * </span>
                          <span className="text-blue-400">FROM</span>
                          <span className="text-slate-300"> users </span>
                          <span className="text-blue-400">WHERE</span>
                          <span className="text-slate-300"> created_at </span>
                          <span className="text-purple-400">&gt;</span>
                          <span className="text-slate-300"> </span>
                          <span className="text-green-400">'2024-01-01'</span>
                          <span className="text-slate-300">;</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <div className="text-sm text-muted-foreground">
                          Ready to execute query
                        </div>
                        <Button size="sm">
                          <Play className="h-4 w-4 mr-2" />
                          Execute Query
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Database events and notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            activity.status === "success"
                              ? "bg-green-500"
                              : activity.status === "warning"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                        />
                        <div>
                          <div className="font-medium">{activity.action}</div>
                          <div className="text-xs text-muted-foreground">
                            {activity.database} • {activity.timestamp}
                          </div>
                        </div>
                      </div>
                      <div
                        className={`text-xs ${getActivityStatusColor(
                          activity.status
                        )}`}
                      >
                        {activity.status}
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
