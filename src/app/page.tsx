"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard-layout";
import { motion } from "framer-motion";
import {
  Cloud,
  Server,
  Database,
  Code,
  Shield,
  CreditCard,
  Activity,
  MessageSquare,
  Key,
  Table,
  Plus,
  Settings,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiService } from "@/lib/api";

const services = [
  {
    id: "compute",
    name: "Compute",
    description: "Virtual machines and containers",
    icon: Server,
    href: "/compute",
    color: "bg-blue-500",
  },
  {
    id: "storage",
    name: "Storage",
    description: "Object and block storage",
    icon: Database,
    href: "/storage",
    color: "bg-green-500",
  },
  {
    id: "lambda",
    name: "Lambda",
    description: "Serverless functions",
    icon: Code,
    href: "/lambda",
    color: "bg-purple-500",
  },
  {
    id: "database",
    name: "Database",
    description: "Managed SQL databases",
    icon: Table,
    href: "/database",
    color: "bg-orange-500",
  },
  {
    id: "queue",
    name: "Queue",
    description: "Message queuing service",
    icon: MessageSquare,
    href: "/queue",
    color: "bg-pink-500",
  },
  {
    id: "secrets",
    name: "Secrets",
    description: "Secure secret management",
    icon: Key,
    href: "/secrets",
    color: "bg-red-500",
  },
  {
    id: "nosql",
    name: "NoSQL",
    description: "Managed NoSQL databases",
    icon: Database,
    href: "/nosql",
    color: "bg-indigo-500",
  },

  {
    id: "monitoring",
    name: "Monitoring",
    description: "Application monitoring",
    icon: Activity,
    href: "/monitoring",
    color: "bg-teal-500",
  },
  {
    id: "billing",
    name: "Billing",
    description: "Billing and usage",
    icon: CreditCard,
    href: "/billing",
    color: "bg-cyan-500",
  },
];

export default function HomePage() {
  const { user, userProfile, company, companies, loading } = useAuth();
  const router = useRouter();
  
  // Dashboard stats state
  const [dashboardStats, setDashboardStats] = useState({
    activeServices: 0,
    monthlyCost: 0,
    activeResources: 0,
    systemHealth: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (userProfile && (!companies || companies.length === 0)) {
        router.push("/setup");
      } else if (companies && companies.length > 0 && !company) {
        router.push("/select-company");
      } else if (user && company) {
        // Load dashboard stats when user and company are available
        loadDashboardStats();
      }
    }
  }, [user, userProfile, company, companies, loading, router]);

  const loadDashboardStats = async () => {
    if (!user) return;
    
    try {
      setStatsLoading(true);
      
      // Fetch all service types in parallel
      const [
        containers,
        bucketServices,
        dbServices,
        nosqlServices,
        queueServices,
        secretsServices,
      ] = await Promise.all([
        apiService.getContainers(user.uid).catch(() => ({ containers: [] })),
        apiService.getBucketServices().catch(() => ({ bucket_services: [] })),
        apiService.getDBServices().catch(() => ({ db_services: [] })),
        apiService.getNoSQLServices().catch(() => ({ nosql_services: [] })),
        apiService.getQueueServices().catch(() => ({ queue_services: [] })),
        apiService.getSecretsServices().catch(() => ({ secrets_services: [] })),
      ]);

      // Calculate active services count
      const allServices = [
        ...(Array.isArray(containers) ? containers : []),
        ...(bucketServices?.bucket_services || []),
        ...(dbServices?.db_services || []),
        ...(nosqlServices?.nosql_services || []),
        ...(queueServices?.queue_services || []),
        ...(secretsServices?.secrets_services || []),
      ];

      const activeServices = allServices.filter(service => {
        // Check if service has is_healthy property (service types)
        if ('is_healthy' in service) {
          return service.is_healthy;
        }
        // Check if service has status property (containers)
        if ('status' in service) {
          return service.status === 'running';
        }
        return false;
      }).length;

      // Calculate system health percentage
      const healthyServices = allServices.filter(service => {
        // Check if service has is_healthy property (service types)
        if ('is_healthy' in service) {
          return service.is_healthy;
        }
        // Check if service has status property (containers)
        if ('status' in service) {
          return service.status === 'running';
        }
        return false;
      }).length;
      const systemHealth = allServices.length > 0 
        ? Math.round((healthyServices / allServices.length) * 100) 
        : 100;

      // Calculate active resources (containers + services)
      const activeResources = allServices.length;

      // For now, use a simple cost calculation based on active services
      // In a real implementation, this would come from billing API
      const monthlyCost = activeServices * 3.55; // $3.55 per service as example

      setDashboardStats({
        activeServices,
        monthlyCost,
        activeResources,
        systemHealth,
      });
    } catch (error) {
      console.error("Error loading dashboard stats:", error);
      // Set fallback values
      setDashboardStats({
        activeServices: 0,
        monthlyCost: 0,
        activeResources: 0,
        systemHealth: 100,
      });
    } finally {
      setStatsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (
    !user ||
    !userProfile ||
    !companies ||
    companies.length === 0 ||
    !company
  ) {
    return null; // Will redirect
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {userProfile.displayName}
          </h1>
          <p className="text-gray-600">
            Managing <span className="font-semibold">{company.name}</span>
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>Active Services</CardDescription>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadDashboardStats}
                  disabled={statsLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${statsLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              <CardTitle className="text-3xl">
                {statsLoading ? '...' : dashboardStats.activeServices}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Monthly Cost</CardDescription>
              <CardTitle className="text-3xl text-green-600">
                {statsLoading ? '...' : `$${dashboardStats.monthlyCost.toFixed(2)}`}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Active Resources</CardDescription>
              <CardTitle className="text-3xl">
                {statsLoading ? '...' : dashboardStats.activeResources}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>System Health</CardDescription>
              <CardTitle className={`text-3xl ${
                dashboardStats.systemHealth >= 90 ? 'text-green-600' : 
                dashboardStats.systemHealth >= 70 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {statsLoading ? '...' : `${dashboardStats.systemHealth}%`}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Services Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={service.href}>
                  <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer h-full">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${service.color}`}>
                          <service.icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {service.name}
                          </CardTitle>
                          <CardDescription className="text-sm">
                            {service.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create Resource
                </CardTitle>
                <CardDescription>
                  Quickly create a new cloud resource
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Create New</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Company Settings
                </CardTitle>
                <CardDescription>
                  Manage your company configuration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Open Settings
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  View Analytics
                </CardTitle>
                <CardDescription>
                  Monitor your usage and performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  View Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
