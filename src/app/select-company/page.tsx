"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Building2, Users, Plus, ArrowRight, Crown, Shield, Code, Eye } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

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

export default function CompanySelectorPage() {
  const { user, userProfile, companies, switchCompany, loading } = useAuth();
  const [switching, setSwitching] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (!companies || companies.length === 0) {
        router.push("/setup");
      } else if (companies.length === 1) {
        // If user only has one company, automatically switch to it
        handleCompanySelect(companies[0].id);
      }
    }
  }, [user, companies, loading, router]);

  const handleCompanySelect = async (companyId: string) => {
    setSwitching(companyId);
    try {
      await switchCompany(companyId);
      router.push("/");
    } catch (error) {
      console.error("Error switching company:", error);
    } finally {
      setSwitching(null);
    }
  };

  const getUserRole = (company: any): "owner" | "admin" | "developer" | "viewer" => {
    if (!user) return "viewer";
    if (company.ownerId === user.uid) return "owner";
    // In a real app, you'd have role information stored per user per company
    return "admin"; // Default for now
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !userProfile || !companies || companies.length === 0) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4"
          >
            <Building2 className="h-8 w-8 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome back!</h1>
          <p className="text-xl text-gray-600">
            Choose which company you'd like to manage today
          </p>
        </div>

        {/* Companies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {companies.map((company, index) => {
            const userRole = getUserRole(company);
            const RoleIcon = roleIcons[userRole];
            const isLoading = switching === company.id;

            return (
              <motion.div
                key={company.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className={`cursor-pointer hover:shadow-lg transition-all h-full ${
                    isLoading ? 'opacity-50' : ''
                  }`}
                  onClick={() => !isLoading && handleCompanySelect(company.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-1">{company.name}</CardTitle>
                        <CardDescription className="text-sm">
                          /{company.slug}
                        </CardDescription>
                      </div>
                      <Badge
                        variant="outline"
                        className={`${roleColors[userRole]} text-xs`}
                      >
                        <RoleIcon className="h-3 w-3 mr-1" />
                        {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Plan:</span>
                        <span className="font-medium capitalize">{company.plan}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Members:</span>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{company.members.length}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Created:</span>
                        <span>{company.createdAt.toLocaleDateString()}</span>
                      </div>
                      
                      <div className="pt-2">
                        <Button 
                          className="w-full"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <div className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Switching...
                            </div>
                          ) : (
                            <>
                              Enter Dashboard
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Create New Company */}
        <div className="text-center">
          <Card className="border-dashed border-2 border-muted-foreground/25 bg-muted/20">
            <CardContent className="py-12">
              <Plus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Create New Company</h3>
              <p className="text-muted-foreground mb-4">
                Start fresh with a new company and invite your team
              </p>
              <Button 
                variant="outline"
                onClick={() => router.push("/setup")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Company
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* User Info */}
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            Signed in as <span className="font-medium">{userProfile.displayName}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
