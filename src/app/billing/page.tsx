"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  Plus,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  AlertCircle,
  Eye,
  Settings,
  BarChart3,
  Clock,
  Zap,
  Server,
  Database,
  Cloud,
  RefreshCw,
  Calculator,
  PieChart,
  LineChart,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/dashboard-layout";
import { apiService } from "@/lib/api";

// Types
interface UsageData {
  service_id: string;
  service_type: string;
  usage_amount: number;
  unit: string;
  cost: number;
  timestamp: string;
  extra_data: Record<string, any>;
}

interface CostBreakdown {
  service_type: string;
  usage: number;
  unit: string;
  rate: number;
  cost: number;
  percentage: number;
}

interface Invoice {
  invoice_id: string;
  period: string;
  start_date: string;
  end_date: string;
  total_amount: number;
  status: string;
  due_date: string;
  created_at: string;
}

interface SpendingLimits {
  monthly: number;
  daily: number;
  hourly: number;
}

interface CostForecast {
  current_cost: number;
  projected_cost: number;
  daily_average: number;
  remaining_days: number;
}

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "usage" | "history" | "alerts" | "limits">("overview");
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const [showSetLimit, setShowSetLimit] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Data states
  const [usage, setUsage] = useState<UsageData[]>([]);
  const [costBreakdown, setCostBreakdown] = useState<CostBreakdown[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [spendingLimits, setSpendingLimits] = useState<SpendingLimits>({ monthly: 100, daily: 5, hourly: 0.5 });
  const [costForecast, setCostForecast] = useState<CostForecast>({ current_cost: 0, projected_cost: 0, daily_average: 0, remaining_days: 0 });

  // Form states
  const [newAlertName, setNewAlertName] = useState("");
  const [newAlertThreshold, setNewAlertThreshold] = useState("");
  const [newAlertPeriod, setNewAlertPeriod] = useState("monthly");
  
  const [newLimitPeriod, setNewLimitPeriod] = useState("monthly");
  const [newLimitAmount, setNewLimitAmount] = useState("");

  // Load data on component mount
  useEffect(() => {
    loadData();
    // Set up periodic updates
    const interval = setInterval(loadData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [selectedPeriod]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load current usage
      const usageData = await apiService.getCurrentUsage();
      setUsage(usageData?.usage || []);

      // Load cost breakdown
      const breakdownData = await apiService.getCostBreakdown(selectedPeriod);
      setCostBreakdown(breakdownData?.breakdown || []);

      // Load billing history
      const historyData = await apiService.getBillingHistory(10);
      setInvoices(historyData?.invoices || []);

      // Load spending limits
      const limitsData = await apiService.getSpendingLimits();
      setSpendingLimits(limitsData?.spending_limits || { monthly: 100, daily: 5, hourly: 0.5 });

      // Load cost forecast
      const forecastData = await apiService.getCostForecast();
      setCostForecast(forecastData || { current_cost: 0, projected_cost: 0, daily_average: 0, remaining_days: 0 });

    } catch (error) {
      console.error("Error loading billing data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.createBillingAlert({
        type: "spending_limit",
        period: newAlertPeriod,
        limit_amount: parseFloat(newAlertThreshold),
        message: `${newAlertName} - ${newAlertPeriod} spending limit`,
      });

      // Reset form
      setNewAlertName("");
      setNewAlertThreshold("");
      setShowCreateAlert(false);
      
      // Reload data
      await loadData();
    } catch (error) {
      console.error("Error creating billing alert:", error);
    }
  };

  const handleSetSpendingLimit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.setSpendingLimit(newLimitPeriod, parseFloat(newLimitAmount));

      // Reset form
      setNewLimitAmount("");
      setShowSetLimit(false);
      
      // Reload data
      await loadData();
    } catch (error) {
      console.error("Error setting spending limit:", error);
    }
  };

  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      const invoiceDetails = await apiService.getInvoiceDetails(invoiceId);
      // Create a downloadable invoice (simplified)
      const invoiceText = `
INVOICE
ID: ${invoiceDetails.invoice_id}
Period: ${invoiceDetails.period}
Amount: $${invoiceDetails.total_amount}
Status: ${invoiceDetails.status}
Due Date: ${invoiceDetails.due_date}
      `;
      
      const blob = new Blob([invoiceText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoiceId}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading invoice:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "text-green-600 bg-green-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "overdue":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-red-600" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-green-600" />;
      default:
        return <BarChart3 className="h-4 w-4 text-gray-600" />;
    }
  };

  const getServiceIcon = (serviceType: string) => {
    switch (serviceType) {
      case "compute":
        return <Server className="h-4 w-4" />;
      case "storage":
        return <Cloud className="h-4 w-4" />;
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

  const totalCurrentCost = usage.reduce((sum, item) => sum + item.cost, 0);
  const totalProjectedCost = costForecast.projected_cost;
  const monthlyLimit = spendingLimits.monthly;
  const usagePercentage = (totalCurrentCost / monthlyLimit) * 100;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <CreditCard className="h-8 w-8 text-service-billing" />
            <div>
              <h1 className="text-3xl font-bold">UWS-Billing</h1>
              <p className="text-muted-foreground">
                Usage tracking and cost management with spending limits
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowCreateAlert(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Cost Alert
            </Button>
            <Button onClick={() => setShowSetLimit(true)} variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Set Limits
            </Button>
            <Button onClick={loadData} variant="outline" disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Current Month
              </CardDescription>
              <CardTitle className="text-2xl text-blue-600">
                ${totalCurrentCost.toFixed(2)}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Projected Cost
              </CardDescription>
              <CardTitle className="text-2xl text-orange-600">
                ${totalProjectedCost.toFixed(2)}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Monthly Limit
              </CardDescription>
              <CardTitle className="text-2xl">
                ${monthlyLimit.toFixed(2)}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Gauge className="h-4 w-4" />
                Usage
              </CardDescription>
              <CardTitle className={`text-2xl ${usagePercentage > 80 ? 'text-red-600' : usagePercentage > 60 ? 'text-yellow-600' : 'text-green-600'}`}>
                {usagePercentage.toFixed(1)}%
              </CardTitle>
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
              onClick={() => setActiveTab("usage")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "usage"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Zap className="h-4 w-4 inline mr-2" />
              Usage Details
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "history"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Clock className="h-4 w-4 inline mr-2" />
              Billing History
            </button>
            <button
              onClick={() => setActiveTab("limits")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "limits"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Settings className="h-4 w-4 inline mr-2" />
              Spending Limits
            </button>
            <button
              onClick={() => setActiveTab("alerts")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "alerts"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <AlertCircle className="h-4 w-4 inline mr-2" />
              Cost Alerts
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === "overview" && (
            <>
              {/* Cost Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Cost Breakdown
                    </CardTitle>
                    <CardDescription>
                      Current {selectedPeriod} spending by service
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {costBreakdown.map((item) => (
                        <div
                          key={item.service_type}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            {getServiceIcon(item.service_type)}
                            <div>
                              <div className="font-medium capitalize">
                                {item.service_type}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {item.usage.toFixed(2)} {item.unit}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">${item.cost.toFixed(2)}</div>
                            <div className="text-sm text-muted-foreground">
                              {item.percentage.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Cost Trends
                    </CardTitle>
                    <CardDescription>
                      Spending trends over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
                      <div className="text-center text-muted-foreground">
                        <LineChart className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p>Cost trend chart</p>
                        <p className="text-sm">Historical spending analysis</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Cost Forecast */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Cost Forecast
                  </CardTitle>
                  <CardDescription>
                    Predicted spending based on current usage patterns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        ${costForecast.current_cost.toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Current Month
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-orange-600">
                        ${costForecast.projected_cost.toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Projected Total
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        ${costForecast.daily_average.toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Daily Average
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">
                        {costForecast.remaining_days}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Days Remaining
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === "usage" && (
            <div className="space-y-6">
              {/* Usage Period Selector */}
              <Card>
                <CardHeader>
                  <CardTitle>Usage Period</CardTitle>
                  <CardDescription>Select the time period for usage analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="hourly">Hourly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Usage Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {costBreakdown.map((service) => (
                  <motion.div
                    key={service.service_type}
                    whileHover={{ scale: 1.02 }}
                  >
                    <Card className="h-full">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          {getServiceIcon(service.service_type)}
                          <Badge variant="outline">
                            {service.percentage.toFixed(1)}%
                          </Badge>
                        </div>
                        <CardTitle className="text-lg capitalize">
                          {service.service_type}
                        </CardTitle>
                        <CardDescription>
                          {service.usage.toFixed(2)} {service.unit}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              ${service.cost.toFixed(2)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Total Cost
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{
                                width: `${Math.min(service.percentage, 100)}%`,
                              }}
                            />
                          </div>
                          <div className="text-xs text-center text-muted-foreground">
                            ${service.rate.toFixed(4)} per {service.unit}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Billing History
                </CardTitle>
                <CardDescription>
                  Your past invoices and payments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {invoices.map((invoice) => (
                    <div
                      key={invoice.invoice_id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div className="flex items-center gap-4">
                        <CreditCard className="h-5 w-5 text-service-billing" />
                        <div>
                          <div className="font-medium">{invoice.period}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(invoice.start_date).toLocaleDateString()} - {new Date(invoice.end_date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-medium">${invoice.total_amount.toFixed(2)}</div>
                          <Badge className={getStatusColor(invoice.status)}>
                            {invoice.status}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadInvoice(invoice.invoice_id)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "limits" && (
            <div className="space-y-6">
              {/* Current Limits */}
              <Card>
                <CardHeader>
                  <CardTitle>Current Spending Limits</CardTitle>
                  <CardDescription>Your configured spending limits</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        ${spendingLimits.monthly.toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground">Monthly Limit</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        ${spendingLimits.daily.toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground">Daily Limit</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        ${spendingLimits.hourly.toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground">Hourly Limit</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Set New Limit Form */}
              {showSetLimit && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Set Spending Limit</CardTitle>
                      <CardDescription>
                        Configure spending limits for different time periods
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSetSpendingLimit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Period</label>
                            <Select value={newLimitPeriod} onValueChange={setNewLimitPeriod}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="hourly">Hourly</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Amount ($)</label>
                            <Input
                              type="number"
                              step="0.01"
                              value={newLimitAmount}
                              onChange={(e) => setNewLimitAmount(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button type="submit" size="sm">
                            <Settings className="h-4 w-4 mr-2" />
                            Set Limit
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowSetLimit(false)}
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
          )}

          {activeTab === "alerts" && (
            <div className="space-y-6">
              {/* Create Alert Form */}
              {showCreateAlert && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Create Cost Alert</CardTitle>
                      <CardDescription>
                        Get notified when spending exceeds thresholds
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleCreateAlert} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="text-sm font-medium">Alert Name</label>
                            <Input
                              value={newAlertName}
                              onChange={(e) => setNewAlertName(e.target.value)}
                              required
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Period</label>
                            <Select value={newAlertPeriod} onValueChange={setNewAlertPeriod}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="hourly">Hourly</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Threshold ($)</label>
                            <Input
                              type="number"
                              step="0.01"
                              value={newAlertThreshold}
                              onChange={(e) => setNewAlertThreshold(e.target.value)}
                              required
                            />
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

              {/* Usage vs Limits Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Usage vs Limits</CardTitle>
                  <CardDescription>Current usage compared to spending limits</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Monthly Usage</span>
                      <span className="text-sm text-muted-foreground">
                        ${totalCurrentCost.toFixed(2)} / ${monthlyLimit.toFixed(2)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${
                          usagePercentage > 80 ? 'bg-red-600' : usagePercentage > 60 ? 'bg-yellow-600' : 'bg-green-600'
                        }`}
                        style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                      />
                    </div>
                    <div className="text-xs text-center text-muted-foreground">
                      {usagePercentage.toFixed(1)}% of monthly limit used
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
