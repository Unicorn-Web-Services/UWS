"use client";

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
import DashboardLayout from "@/components/dashboard-layout";

// Service definitions
const services = [
  {
    id: "compute",
    name: "UWS-Compute",
    description: "Containerized application execution with load balancing",
    href: "/compute",
    icon: Server,
    color: "service-compute",
    stats: { running: 12, total: 20 },
  },
  {
    id: "storage",
    name: "UWS-S3",
    description: "Object storage with bucket organization",
    href: "/storage",
    icon: Cloud,
    color: "service-storage",
    stats: { used: "2.4GB", total: "10GB" },
  },
  {
    id: "lambda",
    name: "UWS-Lambda",
    description: "On-demand serverless code execution",
    href: "/lambda",
    icon: Code,
    color: "service-lambda",
    stats: { executions: 1247, errors: 3 },
  },
  {
    id: "database",
    name: "UWS-RDB",
    description: "Managed relational database service",
    href: "/database",
    icon: Database,
    color: "service-database",
    stats: { instances: 3, connections: 45 },
  },
  {
    id: "nosql",
    name: "UWS-NoSQL",
    description: "Non-relational database with flexible schemas",
    href: "/nosql",
    icon: Table,
    color: "service-nosql",
    stats: { tables: 8, requests: 5420 },
  },
  {
    id: "queue",
    name: "UWS-Queue",
    description: "Simple message queue service",
    href: "/queue",
    icon: MessageSquare,
    color: "service-queue",
    stats: { messages: 156, queues: 4 },
  },
  {
    id: "secrets",
    name: "UWS-Secrets",
    description: "Encrypted secrets management",
    href: "/secrets",
    icon: Key,
    color: "service-secrets",
    stats: { secrets: 23, accessed: 145 },
  },
  {
    id: "iam",
    name: "UWS-IAM",
    description: "Identity and access management",
    href: "/iam",
    icon: Shield,
    color: "service-iam",
    stats: { users: 8, roles: 12 },
  },
  {
    id: "monitoring",
    name: "UWS-Monitoring",
    description: "Real-time monitoring and alerts",
    href: "/monitoring",
    icon: Activity,
    color: "service-monitoring",
    stats: { alerts: 2, dashboards: 5 },
  },
  {
    id: "billing",
    name: "UWS-Billing",
    description: "Usage tracking and cost management",
    href: "/billing",
    icon: CreditCard,
    color: "service-billing",
    stats: { thisMonth: "$42.60", alerts: 0 },
  },
];

export default function Dashboard() {
  return (
    <DashboardLayout>
      {/* Welcome Section */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <Cloud className="h-20 w-20 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold mb-2">
            Welcome to Unicorn Web Services
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Your complete cloud platform, built with passion
          </p>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            From a camper van in the company parking lot to a full-featured
            cloud provider. Select a service from the sidebar to get started, or
            explore our dashboard below.
          </p>
        </motion.div>
      </div>

      {/* Service Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {services.map((service, index) => {
          const Icon = service.icon;
          return (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={service.href}>
                <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 group h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Icon
                        className={`h-8 w-8 ${service.color} group-hover:scale-110 transition-transform`}
                      />
                      <Button variant="ghost" size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(service.stats).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-muted-foreground capitalize">
                            {key}:
                          </span>
                          <span className="font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Services</CardDescription>
            <CardTitle className="text-3xl">10</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Monthly Cost</CardDescription>
            <CardTitle className="text-3xl text-green-600">$42.60</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Resources</CardDescription>
            <CardTitle className="text-3xl">87</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>System Health</CardDescription>
            <CardTitle className="text-3xl text-green-600">98.9%</CardTitle>
          </CardHeader>
        </Card>
      </div>
    </DashboardLayout>
  );
}
