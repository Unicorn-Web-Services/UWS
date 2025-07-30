"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Plus,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Clock,
  Bell,
  Settings,
  Eye,
  Zap,
  Server,
  Database,
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

// Mock data for alerts
const alerts = [
  {
    id: "alert-1",
    name: "High CPU Usage",
    service: "UWS-Compute",
    severity: "critical",
    status: "active",
    description: "CPU usage above 90% for 5 minutes",
    triggered: "2024-01-20 14:25:00",
    threshold: "CPU > 90%",
  },
  {
    id: "alert-2",
    name: "Database Connections",
    service: "UWS-RDB",
    severity: "warning",
    status: "active",
    description: "Database connections approaching limit",
    triggered: "2024-01-20 13:45:00",
    threshold: "Connections > 80",
  },
  {
    id: "alert-3",
    name: "Storage Space",
    service: "UWS-S3",
    severity: "info",
    status: "resolved",
    description: "Storage usage above 75%",
    triggered: "2024-01-20 10:30:00",
    threshold: "Storage > 75%",
  },
];

// Mock data for metrics
const serviceMetrics = [
  {
    service: "UWS-Compute",
    status: "healthy",
    uptime: "99.9%",
    responseTime: "45ms",
    requests: "2.4K/min",
    errors: "0.1%",
    trend: "up",
  },
  {
    service: "UWS-Storage",
    status: "healthy",
    uptime: "99.8%",
    responseTime: "23ms",
    requests: "1.8K/min",
    errors: "0.0%",
    trend: "stable",
  },
  {
    service: "UWS-Database",
    status: "warning",
    uptime: "99.5%",
    responseTime: "78ms",
    requests: "891/min",
    errors: "0.3%",
    trend: "down",
  },
  {
    service: "UWS-Lambda",
    status: "healthy",
    uptime: "99.9%",
    responseTime: "120ms",
    requests: "456/min",
    errors: "0.2%",
    trend: "up",
  },
];

// Mock data for dashboards
const dashboards = [
  {
    id: "overview",
    name: "System Overview",
    description: "High-level system health and performance",
    widgets: 8,
    lastUpdated: "2024-01-20 14:30:00",
  },
  {
    id: "compute",
    name: "Compute Resources",
    description: "Container and instance monitoring",
    widgets: 6,
    lastUpdated: "2024-01-20 14:28:00",
  },
  {
    id: "database",
    name: "Database Performance",
    description: "Database metrics and query performance",
    widgets: 5,
    lastUpdated: "2024-01-20 14:25:00",
  },
];

export default function MonitoringPage() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "alerts" | "dashboards"
  >("overview");
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null);
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const [newAlertName, setNewAlertName] = useState("");
  const [newAlertService, setNewAlertService] = useState("compute");

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement API call
    console.log("Creating alert:", newAlertName, newAlertService);
    setNewAlertName("");
    setNewAlertService("compute");
    setShowCreateAlert(false);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-600 bg-red-100";
      case "warning":
        return "text-yellow-600 bg-yellow-100";
      case "info":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-600";
      case "warning":
        return "text-yellow-600";
      case "critical":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Activity className="h-8 w-8 text-service-monitoring" />
            <div>
              <h1 className="text-3xl font-bold">UWS-Monitoring</h1>
              <p className="text-muted-foreground">
                Real-time monitoring and alerts
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowCreateAlert(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Alert
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                System Health
              </CardDescription>
              <CardTitle className="text-2xl text-green-600">98.9%</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Active Alerts
              </CardDescription>
              <CardTitle className="text-2xl text-red-600">
                {alerts.filter((a) => a.status === "active").length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Avg Response Time
              </CardDescription>
              <CardTitle className="text-2xl">67ms</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Requests/Min
              </CardDescription>
              <CardTitle className="text-2xl">5.6K</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="border-b">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "overview"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <BarChart3 className="h-4 w-4 inline mr-2" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab("alerts")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "alerts"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Bell className="h-4 w-4 inline mr-2" />
              Alerts
            </button>
            <button
              onClick={() => setActiveTab("dashboards")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "dashboards"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Eye className="h-4 w-4 inline mr-2" />
              Dashboards
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === "overview" && (
            <>
              {/* Service Health Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {serviceMetrics.map((service) => (
                  <motion.div
                    key={service.service}
                    whileHover={{ scale: 1.02 }}
                  >
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">
                            {service.service}
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            {getTrendIcon(service.trend)}
                            <div
                              className={`w-3 h-3 rounded-full ${
                                service.status === "healthy"
                                  ? "bg-green-500"
                                  : service.status === "warning"
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                              }`}
                            />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Uptime:</span>
                          <span className="font-medium">{service.uptime}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Response:
                          </span>
                          <span className="font-medium">
                            {service.responseTime}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Requests:
                          </span>
                          <span className="font-medium">
                            {service.requests}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Errors:</span>
                          <span
                            className={`font-medium ${
                              parseFloat(service.errors) > 0.5
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                          >
                            {service.errors}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Response Time Trends
                    </CardTitle>
                    <CardDescription>
                      Average response time over the last 6 hours
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
                      <div className="text-center text-muted-foreground">
                        <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p>Response time chart would be rendered here</p>
                        <p className="text-sm">Real-time data visualization</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Request Volume
                    </CardTitle>
                    <CardDescription>
                      Request volume across all services
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
                      <div className="text-center text-muted-foreground">
                        <Activity className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p>Request volume chart would be rendered here</p>
                        <p className="text-sm">Live traffic monitoring</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {activeTab === "alerts" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Alerts List */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      Alert Rules ({alerts.length})
                    </CardTitle>
                    <CardDescription>
                      Monitor your services with custom alerts
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {alerts.map((alert) => (
                        <motion.div
                          key={alert.id}
                          whileHover={{ scale: 1.01 }}
                          className="p-4 rounded-lg border hover:bg-accent cursor-pointer"
                          onClick={() => setSelectedAlert(alert.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <AlertTriangle
                                className={`h-5 w-5 ${
                                  alert.severity === "critical"
                                    ? "text-red-600"
                                    : alert.severity === "warning"
                                    ? "text-yellow-600"
                                    : "text-blue-600"
                                }`}
                              />
                              <div>
                                <div className="font-medium">{alert.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {alert.description}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                    {alert.service}
                                  </span>
                                  <span
                                    className={`text-xs px-2 py-1 rounded ${getSeverityColor(
                                      alert.severity
                                    )}`}
                                  >
                                    {alert.severity}
                                  </span>
                                  <span
                                    className={`text-xs px-2 py-1 rounded ${
                                      alert.status === "active"
                                        ? "text-red-600 bg-red-100"
                                        : "text-green-600 bg-green-100"
                                    }`}
                                  >
                                    {alert.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {alert.triggered}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Create Alert Form */}
                {showCreateAlert && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6"
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle>Create New Alert</CardTitle>
                        <CardDescription>
                          Set up monitoring alerts for your services
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <form
                          onSubmit={handleCreateAlert}
                          className="space-y-4"
                        >
                          <div>
                            <Input
                              placeholder="Alert name"
                              value={newAlertName}
                              onChange={(e) => setNewAlertName(e.target.value)}
                              required
                            />
                          </div>
                          <div>
                            <select
                              value={newAlertService}
                              onChange={(e) =>
                                setNewAlertService(e.target.value)
                              }
                              className="w-full p-2 border rounded-md"
                            >
                              <option value="compute">UWS-Compute</option>
                              <option value="storage">UWS-Storage</option>
                              <option value="database">UWS-Database</option>
                              <option value="lambda">UWS-Lambda</option>
                              <option value="queue">UWS-Queue</option>
                            </select>
                          </div>
                          <div>
                            <Input placeholder="Condition (e.g., CPU > 90%)" />
                          </div>
                          <div className="flex gap-2">
                            <Button type="submit" size="sm">
                              <Plus className="h-4 w-4 mr-2" />
                              Create Alert
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setShowCreateAlert(false)}
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

              {/* Alert Details */}
              <div className="lg:col-span-1">
                {selectedAlert ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Alert Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const alert = alerts.find(
                          (a) => a.id === selectedAlert
                        );
                        if (!alert) return null;

                        return (
                          <div className="space-y-4">
                            <div>
                              <div className="text-sm text-muted-foreground">
                                Name
                              </div>
                              <div className="font-medium">{alert.name}</div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">
                                Service
                              </div>
                              <div className="font-medium">{alert.service}</div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">
                                Threshold
                              </div>
                              <div className="font-medium font-mono text-sm bg-slate-100 p-2 rounded">
                                {alert.threshold}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">
                                Status
                              </div>
                              <div
                                className={`inline-block text-xs px-2 py-1 rounded ${
                                  alert.status === "active"
                                    ? "text-red-600 bg-red-100"
                                    : "text-green-600 bg-green-100"
                                }`}
                              >
                                {alert.status}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">
                                Triggered
                              </div>
                              <div className="font-medium">
                                {alert.triggered}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent>
                      <div className="text-center py-12 text-muted-foreground">
                        <Bell className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p>Select an alert to view details</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {activeTab === "dashboards" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dashboards.map((dashboard) => (
                <motion.div
                  key={dashboard.id}
                  whileHover={{ scale: 1.02 }}
                  className="cursor-pointer"
                >
                  <Card className="h-full">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <BarChart3 className="h-6 w-6 text-service-monitoring" />
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                      <CardTitle>{dashboard.name}</CardTitle>
                      <CardDescription>{dashboard.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Widgets:
                          </span>
                          <span className="font-medium">
                            {dashboard.widgets}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Last Updated:
                          </span>
                          <span className="font-medium text-xs">
                            {dashboard.lastUpdated}
                          </span>
                        </div>
                        <Button className="w-full" variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Dashboard
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
