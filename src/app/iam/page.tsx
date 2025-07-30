"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Plus,
  Users,
  Key,
  Settings,
  Trash2,
  Crown,
  UserCheck,
  UserX,
  AlertTriangle,
  Lock,
  Unlock,
  Eye,
  Search,
  MoreVertical,
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

// Mock data for users
const users = [
  {
    id: "user-1",
    name: "John Doe",
    email: "john@uws.com",
    role: "Admin",
    status: "active",
    lastLogin: "2024-01-20 14:30",
    created: "2024-01-10",
    permissions: ["compute", "storage", "database", "iam"],
  },
  {
    id: "user-2",
    name: "Jane Smith",
    email: "jane@uws.com",
    role: "Developer",
    status: "active",
    lastLogin: "2024-01-20 12:15",
    created: "2024-01-15",
    permissions: ["compute", "storage", "lambda"],
  },
  {
    id: "user-3",
    name: "Bob Wilson",
    email: "bob@uws.com",
    role: "Viewer",
    status: "inactive",
    lastLogin: "2024-01-18 09:45",
    created: "2024-01-12",
    permissions: ["monitoring"],
  },
];

// Mock data for roles
const roles = [
  {
    id: "admin",
    name: "Administrator",
    description: "Full access to all services and user management",
    userCount: 1,
    permissions: ["*"],
    color: "text-red-600",
  },
  {
    id: "developer",
    name: "Developer",
    description: "Access to development and deployment services",
    userCount: 3,
    permissions: ["compute", "storage", "lambda", "database", "queue"],
    color: "text-blue-600",
  },
  {
    id: "analyst",
    name: "Analyst",
    description: "Read-only access to monitoring and billing",
    userCount: 2,
    permissions: ["monitoring", "billing"],
    color: "text-green-600",
  },
  {
    id: "viewer",
    name: "Viewer",
    description: "Read-only access to basic services",
    userCount: 2,
    permissions: ["monitoring"],
    color: "text-gray-600",
  },
];

// Mock data for recent activity
const recentActivity = [
  {
    id: "1",
    action: "User Login",
    user: "john@uws.com",
    resource: "Dashboard",
    timestamp: "2024-01-20 14:30:15",
    ip: "192.168.1.100",
    status: "success",
  },
  {
    id: "2",
    action: "Permission Changed",
    user: "admin@uws.com",
    resource: "jane@uws.com",
    timestamp: "2024-01-20 13:45:22",
    ip: "192.168.1.50",
    status: "success",
  },
  {
    id: "3",
    action: "Failed Login",
    user: "unknown@uws.com",
    resource: "Login Page",
    timestamp: "2024-01-20 12:20:33",
    ip: "192.168.1.200",
    status: "failed",
  },
];

export default function IAMPage() {
  const [activeTab, setActiveTab] = useState<"users" | "roles" | "activity">(
    "users"
  );
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showCreateRole, setShowCreateRole] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserRole, setNewUserRole] = useState("viewer");

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement API call
    console.log("Creating user:", newUserName, newUserEmail, newUserRole);
    setNewUserName("");
    setNewUserEmail("");
    setNewUserRole("viewer");
    setShowCreateUser(false);
  };

  const handleUserAction = (action: string, userId: string) => {
    // TODO: Implement user actions
    console.log(`${action} user:`, userId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-100";
      case "inactive":
        return "text-yellow-600 bg-yellow-100";
      case "suspended":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getActivityStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-600";
      case "failed":
        return "text-red-600";
      case "warning":
        return "text-yellow-600";
      default:
        return "text-muted-foreground";
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Shield className="h-8 w-8 text-service-iam" />
            <div>
              <h1 className="text-3xl font-bold">UWS-IAM</h1>
              <p className="text-muted-foreground">
                Identity and access management
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowCreateUser(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
            <Button variant="outline" onClick={() => setShowCreateRole(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Role
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Users</CardDescription>
              <CardTitle className="text-2xl">{users.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Active Users</CardDescription>
              <CardTitle className="text-2xl">
                {users.filter((u) => u.status === "active").length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Roles</CardDescription>
              <CardTitle className="text-2xl">{roles.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Failed Logins</CardDescription>
              <CardTitle className="text-2xl text-red-600">3</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="border-b">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("users")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "users"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Users className="h-4 w-4 inline mr-2" />
              Users
            </button>
            <button
              onClick={() => setActiveTab("roles")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "roles"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Crown className="h-4 w-4 inline mr-2" />
              Roles
            </button>
            <button
              onClick={() => setActiveTab("activity")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "activity"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <AlertTriangle className="h-4 w-4 inline mr-2" />
              Activity Log
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === "users" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Users List */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Users ({filteredUsers.length})
                      </CardTitle>
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search users..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 w-64"
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {filteredUsers.map((user) => (
                        <motion.div
                          key={user.id}
                          whileHover={{ scale: 1.01 }}
                          className="p-4 rounded-lg border hover:bg-accent cursor-pointer"
                          onClick={() => setSelectedUser(user.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                <span className="font-medium text-primary">
                                  {user.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium">{user.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {user.email}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                    {user.role}
                                  </span>
                                  <span
                                    className={`text-xs px-2 py-1 rounded ${getStatusColor(
                                      user.status
                                    )}`}
                                  >
                                    {user.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUserAction("view", user.id);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUserAction(
                                    user.status === "active"
                                      ? "suspend"
                                      : "activate",
                                    user.id
                                  );
                                }}
                              >
                                {user.status === "active" ? (
                                  <Lock className="h-4 w-4" />
                                ) : (
                                  <Unlock className="h-4 w-4" />
                                )}
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
                          <div className="mt-3 text-xs text-muted-foreground">
                            Last login: {user.lastLogin} • Created:{" "}
                            {user.created}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Create User Form */}
                {showCreateUser && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6"
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle>Add New User</CardTitle>
                        <CardDescription>
                          Create a new user account
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleCreateUser} className="space-y-4">
                          <div>
                            <Input
                              placeholder="Full name"
                              value={newUserName}
                              onChange={(e) => setNewUserName(e.target.value)}
                              required
                            />
                          </div>
                          <div>
                            <Input
                              type="email"
                              placeholder="Email address"
                              value={newUserEmail}
                              onChange={(e) => setNewUserEmail(e.target.value)}
                              required
                            />
                          </div>
                          <div>
                            <select
                              value={newUserRole}
                              onChange={(e) => setNewUserRole(e.target.value)}
                              className="w-full p-2 border rounded-md"
                            >
                              {roles.map((role) => (
                                <option key={role.id} value={role.id}>
                                  {role.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="flex gap-2">
                            <Button type="submit" size="sm">
                              <Plus className="h-4 w-4 mr-2" />
                              Create User
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setShowCreateUser(false)}
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

              {/* User Details */}
              <div className="lg:col-span-1">
                {selectedUser ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>User Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const user = users.find((u) => u.id === selectedUser);
                        if (!user) return null;

                        return (
                          <div className="space-y-4">
                            <div className="text-center">
                              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                                <span className="font-medium text-primary text-xl">
                                  {user.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </span>
                              </div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {user.email}
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div>
                                <div className="text-sm text-muted-foreground">
                                  Role
                                </div>
                                <div className="font-medium">{user.role}</div>
                              </div>
                              <div>
                                <div className="text-sm text-muted-foreground">
                                  Status
                                </div>
                                <div
                                  className={`inline-block text-xs px-2 py-1 rounded ${getStatusColor(
                                    user.status
                                  )}`}
                                >
                                  {user.status}
                                </div>
                              </div>
                              <div>
                                <div className="text-sm text-muted-foreground">
                                  Permissions
                                </div>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {user.permissions.map((permission) => (
                                    <span
                                      key={permission}
                                      className="text-xs bg-primary/10 text-primary px-2 py-1 rounded"
                                    >
                                      {permission}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <div className="text-sm text-muted-foreground">
                                  Last Login
                                </div>
                                <div className="font-medium">
                                  {user.lastLogin}
                                </div>
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
                        <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p>Select a user to view details</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {activeTab === "roles" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {roles.map((role) => (
                <motion.div
                  key={role.id}
                  whileHover={{ scale: 1.02 }}
                  className="cursor-pointer"
                >
                  <Card className="h-full">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Crown className={`h-6 w-6 ${role.color}`} />
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                      <CardTitle className="text-lg">{role.name}</CardTitle>
                      <CardDescription>{role.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Users:</span>
                          <span className="font-medium">{role.userCount}</span>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground mb-2">
                            Permissions:
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {role.permissions.map((permission) => (
                              <span
                                key={permission}
                                className="text-xs bg-primary/10 text-primary px-2 py-1 rounded"
                              >
                                {permission}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === "activity" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  User authentication and authorization events
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
                              : "bg-red-500"
                          }`}
                        />
                        <div>
                          <div className="font-medium">{activity.action}</div>
                          <div className="text-sm text-muted-foreground">
                            {activity.user} • {activity.resource} •{" "}
                            {activity.ip}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {activity.timestamp}
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
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
