"use client";

import { useState, useEffect, useCallback } from "react";
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
  RefreshCw,
  Filter,
  Calculator,
  LineChart,
  PieChart,
  Gauge,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/dashboard-layout";
import { apiService } from "@/lib/api";

// Types
interface Metric {
  metric_type: string;
  value: number;
  timestamp: string;
  labels: Record<string, string>;
}

interface Alert {
  id: string;
  name: string;
  service_id: string;
  severity: string;
  status: string;
  message: string;
  threshold: string;
  current_value: number;
  triggered_at: string;
  resolved_at?: string;
}

interface Dashboard {
  id: string;
  name: string;
  description: string;
  widgets: Array<{
    id: string;
    name: string;
    type: string;
    config: Record<string, any>;
    position: Record<string, number>;
  }>;
  created_at: string;
  updated_at: string;
}

interface Service {
  service_id: string;
  service_type: string;
  status: string;
  is_healthy: boolean;
}

export default function MonitoringPage() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "alerts" | "dashboards" | "metrics"
  >("overview");
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null);
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const [showCreateDashboard, setShowCreateDashboard] = useState(false);
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedMetric, setSelectedMetric] = useState<string>("");
  const [selectedFunction, setSelectedFunction] = useState<string>("AVG");
  const [timeRange, setTimeRange] = useState<string>("1h");

  // Data states
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(false);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [resultsStale, setResultsStale] = useState(false);
  const [realTimeData, setRealTimeData] = useState<Record<string, any>>({});

  // Form states
  const [newAlertName, setNewAlertName] = useState("");
  const [newAlertService, setNewAlertService] = useState("");
  const [newAlertMetric, setNewAlertMetric] = useState("");
  const [newAlertOperator, setNewAlertOperator] = useState(">");
  const [newAlertThreshold, setNewAlertThreshold] = useState("");
  const [newAlertSeverity, setNewAlertSeverity] = useState("warning");
  const [newAlertFunction, setNewAlertFunction] = useState("AVG");

  const [newDashboardName, setNewDashboardName] = useState("");
  const [newDashboardDescription, setNewDashboardDescription] = useState("");

  // Load data on component mount
  useEffect(() => {
    loadData();
    // Set up real-time updates
    const interval = setInterval(loadData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Mark results as stale when parameters change
  useEffect(() => {
    if (metrics.length > 0) {
      setResultsStale(true);
    }
  }, [selectedService, selectedMetric, selectedFunction, timeRange]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Load alerts
      const alertsData = await apiService.getActiveAlerts();
      setAlerts(alertsData?.alerts || []);

      // Load dashboards
      const dashboardsData = await apiService.getDashboards();
      setDashboards(dashboardsData?.dashboards || []);

      // Load services (combine all service types)
      const [
        bucketServices,
        dbServices,
        nosqlServices,
        queueServices,
        secretsServices,
      ] = await Promise.all([
        apiService.getBucketServices().catch(() => ({ bucket_services: [] })),
        apiService.getDBServices().catch(() => ({ db_services: [] })),
        apiService.getNoSQLServices().catch(() => ({ nosql_services: [] })),
        apiService.getQueueServices().catch(() => ({ queue_services: [] })),
        apiService.getSecretsServices().catch(() => ({ secrets_services: [] })),
      ]);

      const allServices: Service[] = [
        ...(bucketServices?.bucket_services || []).map((s) => ({
          service_id: s.service_id,
          service_type: "bucket",
          status: s.status,
          is_healthy: s.is_healthy,
        })),
        ...(dbServices?.db_services || []).map((s) => ({
          service_id: s.service_id,
          service_type: "database",
          status: s.status,
          is_healthy: s.is_healthy,
        })),
        ...(nosqlServices?.nosql_services || []).map((s) => ({
          service_id: s.service_id,
          service_type: "nosql",
          status: s.status,
          is_healthy: s.is_healthy,
        })),
        ...(queueServices?.queue_services || []).map((s) => ({
          service_id: s.service_id,
          service_type: "queue",
          status: s.status,
          is_healthy: s.is_healthy,
        })),
        ...(secretsServices?.secrets_services || []).map((s) => ({
          service_id: s.service_id,
          service_type: "secrets",
          status: s.status,
          is_healthy: s.is_healthy,
        })),
      ];
      setServices(allServices);

      // Load metrics for selected service
      if (selectedService) {
        await loadServiceMetrics();
      }
    } catch (error) {
      console.error("Error loading monitoring data:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedService]);

  const loadServiceMetrics = useCallback(async () => {
    if (!selectedService) return;

    setMetricsLoading(true);
    setResultsStale(false);
    try {
      const endTime = new Date().toISOString();
      const startTime = new Date(
        Date.now() - getTimeRangeMs(timeRange)
      ).toISOString();

      const metricsData = await apiService.getServiceMetrics(
        selectedService,
        selectedMetric || undefined,
        startTime,
        endTime
      );
      setMetrics(metricsData?.metrics || []);
    } catch (error) {
      console.error("Error loading service metrics:", error);
      setMetrics([]);
    } finally {
      setMetricsLoading(false);
    }
  }, [selectedService, selectedMetric, timeRange]);

  const getTimeRangeMs = (range: string): number => {
    switch (range) {
      case "1h":
        return 60 * 60 * 1000;
      case "6h":
        return 6 * 60 * 60 * 1000;
      case "24h":
        return 24 * 60 * 60 * 1000;
      case "7d":
        return 7 * 24 * 60 * 60 * 1000;
      default:
        return 60 * 60 * 1000;
    }
  };

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.createAlertRule({
        name: newAlertName,
        service_id: newAlertService,
        metric_type: newAlertMetric,
        operator: newAlertOperator,
        threshold_value: parseFloat(newAlertThreshold),
        aggregation_function: newAlertFunction,
        severity: newAlertSeverity,
        is_active: true,
      });

      // Reset form
      setNewAlertName("");
      setNewAlertService("");
      setNewAlertMetric("");
      setNewAlertThreshold("");
      setShowCreateAlert(false);

      // Reload data
      await loadData();
    } catch (error) {
      console.error("Error creating alert:", error);
    }
  };

  const handleCreateDashboard = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.createDashboard({
        name: newDashboardName,
        description: newDashboardDescription,
        widgets: [],
      });

      // Reset form
      setNewDashboardName("");
      setNewDashboardDescription("");
      setShowCreateDashboard(false);

      // Reload data
      await loadData();
    } catch (error) {
      console.error("Error creating dashboard:", error);
    }
  };

  const applyMathematicalFunction = (
    values: number[],
    func: string
  ): number => {
    if (values.length === 0) return 0;

    switch (func.toUpperCase()) {
      case "MIN":
        return Math.min(...values);
      case "MAX":
        return Math.max(...values);
      case "SUM":
        return values.reduce((sum, val) => sum + val, 0);
      case "AVG":
        return values.reduce((sum, val) => sum + val, 0) / values.length;
      case "P95":
        const sorted = [...values].sort((a, b) => a - b);
        const index = Math.floor(sorted.length * 0.95);
        return sorted[index];
      case "COUNT":
        return values.length;
      default:
        return values[values.length - 1]; // Last value
    }
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

  const getServiceIcon = (serviceType: string) => {
    switch (serviceType) {
      case "bucket":
        return <Server className="h-4 w-4" />;
      case "database":
        return <Database className="h-4 w-4" />;
      case "nosql":
        return <Database className="h-4 w-4" />;
      case "queue":
        return <Zap className="h-4 w-4" />;
      case "secrets":
        return <Eye className="h-4 w-4" />;
      default:
        return <Server className="h-4 w-4" />;
    }
  };

  const activeAlertsCount = alerts.filter((a) => a.status === "active").length;
  const healthyServicesCount = services.filter((s) => s.is_healthy).length;
  const totalServicesCount = services.length;

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
                Real-time monitoring and alerts with mathematical functions
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowCreateAlert(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Alert
            </Button>
            <Button
              onClick={() => setShowCreateDashboard(true)}
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Dashboard
            </Button>
            <Button onClick={loadData} variant="outline" disabled={loading}>
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
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
              <CardTitle className="text-2xl text-green-600">
                {totalServicesCount > 0
                  ? `${Math.round(
                      (healthyServicesCount / totalServicesCount) * 100
                    )}%`
                  : "N/A"}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Active Alerts
              </CardDescription>
              <CardTitle className="text-2xl text-red-600">
                {activeAlertsCount}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Services
              </CardDescription>
              <CardTitle className="text-2xl">{totalServicesCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Real-time
              </CardDescription>
              <CardTitle className="text-2xl">Live</CardTitle>
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
              onClick={() => setActiveTab("metrics")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "metrics"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <LineChart className="h-4 w-4 inline mr-2" />
              Metrics
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
                {services.map((service) => (
                  <motion.div
                    key={service.service_id}
                    whileHover={{ scale: 1.02 }}
                  >
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg flex items-center gap-2">
                            {getServiceIcon(service.service_type)}
                            {service.service_type}
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                service.is_healthy
                                  ? "bg-green-500"
                                  : "bg-red-500"
                              }`}
                            />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Status:</span>
                          <span
                            className={`font-medium ${getStatusColor(
                              service.status
                            )}`}
                          >
                            {service.status}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">ID:</span>
                          <span className="font-medium text-xs">
                            {service.service_id.slice(0, 8)}...
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Real-time Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      System Health Trend
                    </CardTitle>
                    <CardDescription>
                      Real-time system health over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
                      <div className="text-center text-muted-foreground">
                        <LineChart className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p>Real-time health trend chart</p>
                        <p className="text-sm">Live data visualization</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Alert Activity
                    </CardTitle>
                    <CardDescription>
                      Alert frequency and severity
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
                      <div className="text-center text-muted-foreground">
                        <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p>Alert activity chart</p>
                        <p className="text-sm">Live alert monitoring</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {activeTab === "metrics" && (
            <div className="space-y-6">
              {/* Metrics Controls */}
              <Card>
                <CardHeader>
                  <CardTitle>Metrics Analysis</CardTitle>
                  <CardDescription>
                    Analyze service metrics with mathematical functions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-sm font-medium">Service</label>
                      <Select
                        value={selectedService}
                        onValueChange={setSelectedService}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select service" />
                        </SelectTrigger>
                        <SelectContent>
                          {services.map((service) => (
                            <SelectItem
                              key={service.service_id}
                              value={service.service_id}
                            >
                              {service.service_type} -{" "}
                              {service.service_id.slice(0, 8)}...
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Metric</label>
                      <Select
                        value={selectedMetric}
                        onValueChange={setSelectedMetric}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select metric" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cpu_usage">CPU Usage</SelectItem>
                          <SelectItem value="memory_usage">
                            Memory Usage
                          </SelectItem>
                          <SelectItem value="disk_usage">Disk Usage</SelectItem>
                          <SelectItem value="request_count">
                            Request Count
                          </SelectItem>
                          <SelectItem value="response_time">
                            Response Time
                          </SelectItem>
                          <SelectItem value="error_rate">Error Rate</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Function</label>
                      <Select
                        value={selectedFunction}
                        onValueChange={setSelectedFunction}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MIN">MIN</SelectItem>
                          <SelectItem value="MAX">MAX</SelectItem>
                          <SelectItem value="SUM">SUM</SelectItem>
                          <SelectItem value="AVG">AVG</SelectItem>
                          <SelectItem value="P95">P95</SelectItem>
                          <SelectItem value="COUNT">COUNT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Time Range</label>
                      <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1h">1 Hour</SelectItem>
                          <SelectItem value="6h">6 Hours</SelectItem>
                          <SelectItem value="24h">24 Hours</SelectItem>
                          <SelectItem value="7d">7 Days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button
                      onClick={loadServiceMetrics}
                      disabled={!selectedService || metricsLoading}
                    >
                      <Calculator
                        className={`h-4 w-4 mr-2 ${
                          metricsLoading ? "animate-spin" : ""
                        }`}
                      />
                      {metricsLoading ? "Calculating..." : "Calculate"}
                    </Button>
                    {!selectedService && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        Select a service to begin metrics analysis
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Metrics Results */}
              {(metrics.length > 0 || metricsLoading) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Metrics Results</span>
                      {resultsStale && !metricsLoading && (
                        <Badge
                          variant="outline"
                          className="text-yellow-600 border-yellow-600"
                        >
                          Parameters changed - click Calculate to update
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {selectedFunction} of{" "}
                      {selectedMetric || "selected metric"} over {timeRange}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {metricsLoading ? (
                      <div className="text-center py-8">
                        <div className="inline-flex items-center gap-2 text-muted-foreground">
                          <RefreshCw className="h-6 w-6 animate-spin" />
                          <span>Calculating metrics...</span>
                        </div>
                      </div>
                    ) : metrics.length > 0 ? (
                      <div
                        className={`space-y-4 ${
                          resultsStale ? "opacity-60" : ""
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-3xl font-bold text-blue-600">
                            {applyMathematicalFunction(
                              metrics.map((m) => m.value),
                              selectedFunction
                            ).toFixed(2)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {selectedFunction} value
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                          <div className="bg-slate-50 p-3 rounded-lg">
                            <div className="text-lg font-semibold">
                              {metrics.length}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Data Points
                            </div>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-lg">
                            <div className="text-lg font-semibold">
                              {Math.min(...metrics.map((m) => m.value)).toFixed(
                                2
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Min Value
                            </div>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-lg">
                            <div className="text-lg font-semibold">
                              {Math.max(...metrics.map((m) => m.value)).toFixed(
                                2
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Max Value
                            </div>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-lg">
                            <div className="text-lg font-semibold">
                              {(
                                metrics.reduce((sum, m) => sum + m.value, 0) /
                                metrics.length
                              ).toFixed(2)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Average
                            </div>
                          </div>
                        </div>

                        <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
                          <div className="text-center text-muted-foreground">
                            <LineChart className="h-16 w-16 mx-auto mb-4 opacity-50" />
                            <p>Metrics visualization chart</p>
                            <p className="text-sm">
                              Time series data ({metrics.length} points)
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Calculator className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p>No metrics data found</p>
                        <p className="text-sm">
                          Try selecting a different service or metric
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
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
                                  {alert.message}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline">
                                    {alert.service_id.slice(0, 8)}...
                                  </Badge>
                                  <Badge
                                    className={getSeverityColor(alert.severity)}
                                  >
                                    {alert.severity}
                                  </Badge>
                                  <Badge
                                    variant={
                                      alert.status === "active"
                                        ? "destructive"
                                        : "secondary"
                                    }
                                  >
                                    {alert.status}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(alert.triggered_at).toLocaleString()}
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
                          Set up monitoring alerts with mathematical functions
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <form
                          onSubmit={handleCreateAlert}
                          className="space-y-4"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium">
                                Alert Name
                              </label>
                              <Input
                                value={newAlertName}
                                onChange={(e) =>
                                  setNewAlertName(e.target.value)
                                }
                                required
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">
                                Service
                              </label>
                              <Select
                                value={newAlertService}
                                onValueChange={setNewAlertService}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select service" />
                                </SelectTrigger>
                                <SelectContent>
                                  {services.map((service) => (
                                    <SelectItem
                                      key={service.service_id}
                                      value={service.service_id}
                                    >
                                      {service.service_type} -{" "}
                                      {service.service_id.slice(0, 8)}...
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="text-sm font-medium">
                                Metric
                              </label>
                              <Select
                                value={newAlertMetric}
                                onValueChange={setNewAlertMetric}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select metric" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="cpu_usage">
                                    CPU Usage
                                  </SelectItem>
                                  <SelectItem value="memory_usage">
                                    Memory Usage
                                  </SelectItem>
                                  <SelectItem value="disk_usage">
                                    Disk Usage
                                  </SelectItem>
                                  <SelectItem value="request_count">
                                    Request Count
                                  </SelectItem>
                                  <SelectItem value="response_time">
                                    Response Time
                                  </SelectItem>
                                  <SelectItem value="error_rate">
                                    Error Rate
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="text-sm font-medium">
                                Function
                              </label>
                              <Select
                                value={newAlertFunction}
                                onValueChange={setNewAlertFunction}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="MIN">MIN</SelectItem>
                                  <SelectItem value="MAX">MAX</SelectItem>
                                  <SelectItem value="SUM">SUM</SelectItem>
                                  <SelectItem value="AVG">AVG</SelectItem>
                                  <SelectItem value="P95">P95</SelectItem>
                                  <SelectItem value="COUNT">COUNT</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="text-sm font-medium">
                                Operator
                              </label>
                              <Select
                                value={newAlertOperator}
                                onValueChange={setNewAlertOperator}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value=">">&gt;</SelectItem>
                                  <SelectItem value=">=">&gt;=</SelectItem>
                                  <SelectItem value="<">&lt;</SelectItem>
                                  <SelectItem value="<=">&lt;=</SelectItem>
                                  <SelectItem value="==">=</SelectItem>
                                  <SelectItem value="!=">≠</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="text-sm font-medium">
                                Threshold
                              </label>
                              <Input
                                type="number"
                                step="0.01"
                                value={newAlertThreshold}
                                onChange={(e) =>
                                  setNewAlertThreshold(e.target.value)
                                }
                                required
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">
                                Severity
                              </label>
                              <Select
                                value={newAlertSeverity}
                                onValueChange={setNewAlertSeverity}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="info">Info</SelectItem>
                                  <SelectItem value="warning">
                                    Warning
                                  </SelectItem>
                                  <SelectItem value="critical">
                                    Critical
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
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
                              <div className="font-medium">
                                {alert.service_id}
                              </div>
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
                                Current Value
                              </div>
                              <div className="font-medium">
                                {alert.current_value.toFixed(2)}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">
                                Status
                              </div>
                              <Badge
                                className={getSeverityColor(alert.severity)}
                              >
                                {alert.status}
                              </Badge>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">
                                Triggered
                              </div>
                              <div className="font-medium">
                                {new Date(alert.triggered_at).toLocaleString()}
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
            <div className="space-y-6">
              {/* Create Dashboard Form */}
              {showCreateDashboard && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Create New Dashboard</CardTitle>
                      <CardDescription>
                        Create a customizable monitoring dashboard
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form
                        onSubmit={handleCreateDashboard}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">
                              Dashboard Name
                            </label>
                            <Input
                              value={newDashboardName}
                              onChange={(e) =>
                                setNewDashboardName(e.target.value)
                              }
                              required
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">
                              Description
                            </label>
                            <Input
                              value={newDashboardDescription}
                              onChange={(e) =>
                                setNewDashboardDescription(e.target.value)
                              }
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button type="submit" size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Dashboard
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowCreateDashboard(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Dashboards Grid */}
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
                        <CardDescription>
                          {dashboard.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Widgets:
                            </span>
                            <span className="font-medium">
                              {dashboard.widgets.length}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Created:
                            </span>
                            <span className="font-medium text-xs">
                              {new Date(
                                dashboard.created_at
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <Button
                            className="w-full"
                            variant="outline"
                            size="sm"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Dashboard
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
