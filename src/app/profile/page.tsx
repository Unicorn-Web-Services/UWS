"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Calendar,
  Shield,
  Bell,
  Key,
  Trash2,
  Edit,
  Save,
  X,
  Camera,
  Building2,
  Crown,
  Code,
  Eye,
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
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth-context";
import DashboardLayout from "@/components/dashboard-layout";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

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

export default function ProfilePage() {
  const { user, userProfile, company, companies } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");

  // Notification preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  // Security
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName);
      setEmail(userProfile.email);
    }
  }, [userProfile]);

  const handleSaveProfile = async () => {
    if (!user || !userProfile) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Update Firebase Auth profile
      await updateProfile(user, { displayName });

      // Update Firestore user profile
      await updateDoc(doc(db, "users", user.uid), {
        displayName,
        email,
      });

      setSuccess("Profile updated successfully!");
      setEditing(false);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    // Password change would typically be handled with Firebase Auth
    // For now, just show a success message
    setSuccess("Password change functionality would be implemented here");
    setShowChangePassword(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const getUserCompanyRole = (companyId: string) => {
    const targetCompany = companies.find((c) => c.id === companyId);
    if (!targetCompany || !user) return "viewer";
    return targetCompany.ownerId === user.uid ? "owner" : "admin"; // Simplified for demo
  };

  if (!user || !userProfile) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Profile Not Found</h2>
            <p className="text-muted-foreground">
              Please sign in to view your profile.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Profile Settings</h1>
            <p className="text-muted-foreground">
              Manage your account settings and preferences
            </p>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md"
          >
            {success}
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md"
          >
            {error}
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="relative mx-auto mb-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage
                      src={user.photoURL || ""}
                      alt={userProfile.displayName}
                    />
                    <AvatarFallback className="text-2xl">
                      {userProfile.displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                    disabled
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <CardTitle className="text-xl">
                  {userProfile.displayName}
                </CardTitle>
                <CardDescription>{userProfile.email}</CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                      Update your personal details and contact information
                    </CardDescription>
                  </div>
                  <Button
                    variant={editing ? "ghost" : "outline"}
                    size="sm"
                    onClick={() => {
                      if (editing) {
                        setEditing(false);
                        setDisplayName(userProfile.displayName);
                        setEmail(userProfile.email);
                      } else {
                        setEditing(true);
                      }
                    }}
                  >
                    {editing ? (
                      <X className="h-4 w-4" />
                    ) : (
                      <Edit className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      disabled={!editing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={!editing}
                    />
                  </div>
                </div>

                {editing && (
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleSaveProfile} disabled={loading}>
                      <Save className="h-4 w-4 mr-2" />
                      {loading ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button variant="outline" onClick={() => setEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Company Memberships */}
            <Card>
              <CardHeader>
                <CardTitle>Company Memberships</CardTitle>
                <CardDescription>
                  Companies you belong to and your role in each
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {companies && companies.length > 0 ? (
                    companies.map((comp, index) => {
                      const role = getUserCompanyRole(comp.id);
                      const RoleIcon = roleIcons[role];
                      const isCurrentCompany = company?.id === comp.id;

                      return (
                        <div
                          key={comp.id}
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            isCurrentCompany
                              ? "bg-primary/5 border-primary/20"
                              : "bg-muted/30"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-full">
                              <Building2 className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">{comp.name}</div>
                              <div className="text-sm text-muted-foreground">
                                /{comp.slug}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={`${roleColors[role]} text-xs`}
                            >
                              <RoleIcon className="h-3 w-3 mr-1" />
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                            </Badge>
                            {isCurrentCompany && (
                              <Badge variant="default" className="text-xs">
                                Current
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      No company memberships found
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Notification Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Configure how you want to receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label
                      htmlFor="email-notifications"
                      className="text-sm font-medium"
                    >
                      Email Notifications
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label
                      htmlFor="push-notifications"
                      className="text-sm font-medium"
                    >
                      Push Notifications
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Receive push notifications in your browser
                    </p>
                  </div>
                  <Switch
                    id="push-notifications"
                    checked={pushNotifications}
                    onCheckedChange={setPushNotifications}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label
                      htmlFor="security-alerts"
                      className="text-sm font-medium"
                    >
                      Security Alerts
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Receive alerts about security events
                    </p>
                  </div>
                  <Switch
                    id="security-alerts"
                    checked={securityAlerts}
                    onCheckedChange={setSecurityAlerts}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label
                      htmlFor="marketing-emails"
                      className="text-sm font-medium"
                    >
                      Marketing Emails
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Receive marketing and promotional emails
                    </p>
                  </div>
                  <Switch
                    id="marketing-emails"
                    checked={marketingEmails}
                    onCheckedChange={setMarketingEmails}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your account security and authentication
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Dialog
                    open={showChangePassword}
                    onOpenChange={setShowChangePassword}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Key className="h-4 w-4 mr-2" />
                        Change Password
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                        <DialogDescription>
                          Enter your current password and choose a new one.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="current-password">
                            Current Password
                          </Label>
                          <Input
                            id="current-password"
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="new-password">New Password</Label>
                          <Input
                            id="new-password"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="confirm-password">
                            Confirm New Password
                          </Label>
                          <Input
                            id="confirm-password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setShowChangePassword(false)}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleChangePassword}>
                          Change Password
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Two-Factor Authentication</div>
                    <p className="text-xs text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    <Shield className="h-4 w-4 mr-2" />
                    Enable 2FA
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-700">Danger Zone</CardTitle>
                <CardDescription>
                  Irreversible actions that affect your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-red-700">
                      Delete Account
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Permanently delete your account and all associated data
                    </p>
                  </div>
                  <Button variant="destructive" size="sm" disabled>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
