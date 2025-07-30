"use client";

import { useState } from "react";
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

// Mock data for billing
const currentUsage = [
  {
    service: "UWS-Compute",
    icon: Server,
    usage: "145 container hours",
    cost: "$14.50",
    trend: "up",
    percentage: 34.1,
  },
  {
    service: "UWS-Storage",
    icon: Cloud,
    usage: "189.8 GB stored",
    cost: "$9.49",
    trend: "stable",
    percentage: 22.3,
  },
  {
    service: "UWS-Database",
    icon: Database,
    usage: "87 instance hours",
    cost: "$8.70",
    trend: "down",
    percentage: 20.4,
  },
  {
    service: "UWS-Lambda",
    icon: Zap,
    usage: "2.4M executions",
    cost: "$4.80",
    trend: "up",
    percentage: 11.3,
  },
  {
    service: "UWS-Queue",
    usage: "1.2M requests",
    cost: "$2.40",
    trend: "stable",
    percentage: 5.6,
  },
  {
    service: "UWS-Other",
    usage: "Various services",
    cost: "$2.61",
    trend: "up",
    percentage: 6.3,
  },
];

// Mock data for billing history
const billingHistory = [
  {
    id: "inv-2024-01",
    period: "January 2024",
    amount: "$42.60",
    status: "paid",
    dueDate: "2024-02-01",
    services: 6,
  },
  {
    id: "inv-2023-12",
    period: "December 2023",
    amount: "$38.45",
    status: "paid",
    dueDate: "2024-01-01",
    services: 5,
  },
  {
    id: "inv-2023-11",
    period: "November 2023",
    amount: "$35.20",
    status: "paid",
    dueDate: "2023-12-01",
    services: 4,
  },
];

// Mock data for cost alerts
const costAlerts = [
  {
    id: "alert-1",
    name: "Monthly Budget Alert",
    threshold: "$50.00",
    current: "$42.60",
    status: "active",
    percentage: 85.2,
  },
  {
    id: "alert-2",
    name: "Compute Usage Alert",
    threshold: "$20.00",
    current: "$14.50",
    status: "ok",
    percentage: 72.5,
  },
];

// Mock data for forecasting
const costForecast = {
  thisMonth: "$42.60",
  projected: "$48.30",
  lastMonth: "$38.45",
  trend: "up",
  savings: "$2.15",
};

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "usage" | "history" | "alerts"
  >("overview");
  const [selectedPeriod, setSelectedPeriod] = useState("current");
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const [newAlertName, setNewAlertName] = useState("");
  const [newAlertThreshold, setNewAlertThreshold] = useState("");

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement API call
    console.log("Creating cost alert:", newAlertName, newAlertThreshold);
    setNewAlertName("");
    setNewAlertThreshold("");
    setShowCreateAlert(false);
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    // TODO: Implement invoice download
    console.log("Downloading invoice:", invoiceId);
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
                Usage tracking and cost management
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowCreateAlert(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Cost Alert
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
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
                ${costForecast.thisMonth}
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
                ${costForecast.projected}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Last Month
              </CardDescription>
              <CardTitle className="text-2xl">
                ${costForecast.lastMonth}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4" />
                Potential Savings
              </CardDescription>
              <CardTitle className="text-2xl text-green-600">
                ${costForecast.savings}
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
                      Current month spending by service
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {currentUsage.map((item) => {
                        const Icon = item.icon || Server;
                        return (
                          <div
                            key={item.service}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <Icon className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <div className="font-medium">
                                  {item.service}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {item.usage}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">{item.cost}</div>
                              <div className="text-sm text-muted-foreground">
                                {item.percentage}%
                              </div>
                            </div>
                          </div>
                        );
                      })}
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
                      Spending trends over the last 6 months
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
                      <div className="text-center text-muted-foreground">
                        <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p>Cost trend chart would be rendered here</p>
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
                    <TrendingUp className="h-5 w-5" />
                    Cost Forecast
                  </CardTitle>
                  <CardDescription>
                    Predicted spending based on current usage patterns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        ${costForecast.thisMonth}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Current Month
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-orange-600">
                        ${costForecast.projected}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Projected Total
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        +13%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        vs Last Month
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === "usage" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentUsage.map((service) => {
                const Icon = service.icon || Server;
                return (
                  <motion.div
                    key={service.service}
                    whileHover={{ scale: 1.02 }}
                  >
                    <Card className="h-full">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <Icon className="h-6 w-6 text-service-billing" />
                          {getTrendIcon(service.trend)}
                        </div>
                        <CardTitle className="text-lg">
                          {service.service}
                        </CardTitle>
                        <CardDescription>{service.usage}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {service.cost}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Current Month
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
                            {service.percentage}% of total spend
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
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
                  {billingHistory.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div className="flex items-center gap-4">
                        <CreditCard className="h-5 w-5 text-service-billing" />
                        <div>
                          <div className="font-medium">{invoice.period}</div>
                          <div className="text-sm text-muted-foreground">
                            {invoice.services} services • Due: {invoice.dueDate}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-medium">{invoice.amount}</div>
                          <div
                            className={`text-xs px-2 py-1 rounded ${getStatusColor(
                              invoice.status
                            )}`}
                          >
                            {invoice.status}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadInvoice(invoice.id)}
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

          {activeTab === "alerts" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cost Alerts */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      Cost Alerts ({costAlerts.length})
                    </CardTitle>
                    <CardDescription>
                      Monitor your spending with custom alerts
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {costAlerts.map((alert) => (
                        <div key={alert.id} className="p-4 rounded-lg border">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{alert.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {alert.current} of {alert.threshold} budget used
                              </div>
                            </div>
                            <div
                              className={`text-xs px-2 py-1 rounded ${
                                alert.status === "active"
                                  ? "text-red-600 bg-red-100"
                                  : "text-green-600 bg-green-100"
                              }`}
                            >
                              {alert.status}
                            </div>
                          </div>
                          <div className="mt-3">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  alert.percentage > 90
                                    ? "bg-red-600"
                                    : alert.percentage > 75
                                    ? "bg-yellow-600"
                                    : "bg-green-600"
                                }`}
                                style={{
                                  width: `${Math.min(alert.percentage, 100)}%`,
                                }}
                              />
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {alert.percentage.toFixed(1)}% of budget used
                            </div>
                          </div>
                        </div>
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
                        <CardTitle>Create Cost Alert</CardTitle>
                        <CardDescription>
                          Get notified when spending exceeds thresholds
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
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="Threshold amount ($)"
                              value={newAlertThreshold}
                              onChange={(e) =>
                                setNewAlertThreshold(e.target.value)
                              }
                              required
                            />
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

              {/* Budget Summary */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Budget Summary</CardTitle>
                    <CardDescription>Monthly budget overview</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">
                          $50.00
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Monthly Budget
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Used:</span>
                          <span className="font-medium">$42.60</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Remaining:
                          </span>
                          <span className="font-medium text-green-600">
                            $7.40
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-blue-600 h-3 rounded-full"
                            style={{ width: "85.2%" }}
                          />
                        </div>
                        <div className="text-xs text-center text-muted-foreground">
                          85.2% of budget used
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
