"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Users,
  Settings,
  CreditCard,
  Shield,
  Bell,
  Plus,
  Edit,
  Trash2,
  UserPlus,
  Crown,
  User,
  Eye,
  Code,
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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth-context";
import DashboardLayout from "@/components/dashboard-layout";

const roleIcons = {
  owner: Crown,
  admin: Shield,
  developer: Code,
  viewer: Eye,
};

const roleColors = {
  owner: "bg-yellow-100 text-yellow-800 border-yellow-200",
  admin: "bg-red-100 text-red-800 border-red-200",
  developer: "bg-blue-100 text-blue-800 border-blue-200",
  viewer: "bg-gray-100 text-gray-800 border-gray-200",
};

// Mock data for team members
const mockTeamMembers = [
  {
    id: "1",
    name: "John Doe",
    email: "john@company.com",
    role: "owner" as const,
    joinedAt: new Date("2024-01-01"),
    lastActive: new Date("2024-01-15"),
    avatar: "",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@company.com",
    role: "admin" as const,
    joinedAt: new Date("2024-01-05"),
    lastActive: new Date("2024-01-14"),
    avatar: "",
  },
  {
    id: "3",
    name: "Bob Wilson",
    email: "bob@company.com",
    role: "developer" as const,
    joinedAt: new Date("2024-01-10"),
    lastActive: new Date("2024-01-13"),
    avatar: "",
  },
];

export default function CompanyPage() {
  const { userProfile, company } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [teamMembers, setTeamMembers] = useState(mockTeamMembers);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("viewer");

  const handleInviteUser = () => {
    // Here you would typically send an invitation
    console.log("Inviting", inviteEmail, "as", inviteRole);
    setInviteDialogOpen(false);
    setInviteEmail("");
    setInviteRole("viewer");
  };

  if (!company || !userProfile) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">No Company Selected</h2>
            <p className="text-muted-foreground">
              Please select or create a company first.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{company.name}</h1>
              <p className="text-muted-foreground">Company Management</p>
            </div>
          </div>
          <Button>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Team Members</CardDescription>
                  <CardTitle className="text-3xl">
                    {teamMembers.length}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Active Services</CardDescription>
                  <CardTitle className="text-3xl">12</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Monthly Usage</CardDescription>
                  <CardTitle className="text-3xl text-green-600">
                    $42.60
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Resources</CardDescription>
                  <CardTitle className="text-3xl">87</CardTitle>
                </CardHeader>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest company activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          New compute instance created
                        </p>
                        <p className="text-xs text-muted-foreground">
                          2 hours ago
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          Database backup completed
                        </p>
                        <p className="text-xs text-muted-foreground">
                          4 hours ago
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          Jane Smith joined the team
                        </p>
                        <p className="text-xs text-muted-foreground">
                          1 day ago
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common management tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full justify-start">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite Team Member
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Update Billing
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Company Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Team Members</h2>
                <p className="text-muted-foreground">
                  Manage your team and permissions
                </p>
              </div>
              <Dialog
                open={inviteDialogOpen}
                onOpenChange={setInviteDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite Team Member</DialogTitle>
                    <DialogDescription>
                      Send an invitation to join your company.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="colleague@company.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="role">Role</Label>
                      <Select value={inviteRole} onValueChange={setInviteRole}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viewer">Viewer</SelectItem>
                          <SelectItem value="developer">Developer</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setInviteDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleInviteUser}>Send Invitation</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamMembers.map((member) => {
                    const RoleIcon = roleIcons[member.role];
                    return (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="font-medium">{member.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {member.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={roleColors[member.role]}
                          >
                            <RoleIcon className="h-3 w-3 mr-1" />
                            {member.role.charAt(0).toUpperCase() +
                              member.role.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {member.joinedAt.toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {member.lastActive.toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-3 w-3" />
                            </Button>
                            {member.role !== "owner" && (
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Billing & Usage</CardTitle>
                <CardDescription>
                  Manage your subscription and usage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Billing Management
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Billing features will be available soon
                  </p>
                  <Button variant="outline">Set up Billing</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Company Settings</CardTitle>
                <CardDescription>
                  Manage your company information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input id="company-name" defaultValue={company.name} />
                </div>
                <div>
                  <Label htmlFor="company-slug">Company Slug</Label>
                  <Input id="company-slug" defaultValue={company.slug} />
                </div>
                <Button>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
