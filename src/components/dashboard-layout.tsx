"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  BarChart3,
  Settings,
  User,
  Bell,
  Menu,
  Home,
  Building2,
  LogOut,
  ChevronDown,
  RefreshCcwIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth-context";
import { useApiConfig } from "@/lib/hooks/useApi";
import { useToast } from "@/lib/toast-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const services = [
  {
    id: "home",
    name: "Dashboard",
    href: "/",
    icon: Home,
    color: "text-primary",
  },
  {
    id: "services",
    name: "Services",
    href: "/services",
    icon: Settings,
    color: "text-blue-600",
  },
  {
    id: "compute",
    name: "UWS-Compute",
    href: "/compute",
    icon: Server,
    color: "service-compute",
  },
  {
    id: "storage",
    name: "UWS-S3",
    href: "/buckets",
    icon: Cloud,
    color: "service-storage",
  },
  {
    id: "lambda",
    name: "UWS-Lambda",
    href: "/lambda",
    icon: Code,
    color: "service-lambda",
  },
  {
    id: "database",
    name: "UWS-RDB",
    href: "/database",
    icon: Database,
    color: "service-database",
  },
  {
    id: "nosql",
    name: "UWS-NoSQL",
    href: "/nosql",
    icon: Table,
    color: "service-nosql",
  },
  {
    id: "queue",
    name: "UWS-Queue",
    href: "/queue",
    icon: MessageSquare,
    color: "service-queue",
  },
  {
    id: "secrets",
    name: "UWS-Secrets",
    href: "/secrets",
    icon: Key,
    color: "service-secrets",
  },

  {
    id: "monitoring",
    name: "UWS-Monitoring",
    href: "/monitoring",
    icon: Activity,
    color: "service-monitoring",
  },
  {
    id: "billing",
    name: "UWS-Billing",
    href: "/billing",
    icon: CreditCard,
    color: "service-billing",
  },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();
  const { user, userProfile, company, companies, switchCompany, logout } =
    useAuth();
  const { toast } = useToast();
  const router = useRouter();

  // Initialize API configuration
  useApiConfig();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Logout error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCompanySwitch = (companyId: string) => {
    router.push("/select-company");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Link href="/" className="flex items-center gap-2">
              <Cloud className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold">Unicorn Web Services</h1>
                <p className="text-xs text-muted-foreground">
                  Driven by Passion, Not Profit
                </p>
              </div>
            </Link>
          </div>

          <div className="ml-auto flex items-center gap-4 ">
            {/* Company Selector */}
            {company && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Building2 className="h-4 w-4" />
                    {company.name}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72">
                  <DropdownMenuLabel>
                    <div>
                      <div className="font-semibold">{company.name}</div>
                      <div className="text-xs text-muted-foreground">
                        /{company.slug}
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {/* Current Company Actions */}
                  <DropdownMenuItem
                    onClick={() => {
                      router.push("/company");
                      console.log(companies);
                    }}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Company Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/company")}>
                    <User className="h-4 w-4 mr-2" />
                    Manage Users
                  </DropdownMenuItem>

                  {/* Other Companies */}
                  <DropdownMenuItem
                    onClick={() => router.push("/select-company")}
                  >
                    <RefreshCcwIcon className="h-4 w-4 mr-2" />
                    Switch Company
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <div className="relative">
              <Input placeholder="Search services..." className="w-64 pl-10" />
              <BarChart3 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            </div>

            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user?.photoURL || ""}
                      alt={userProfile?.displayName || ""}
                    />
                    <AvatarFallback>
                      {userProfile?.displayName?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {userProfile?.displayName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <motion.aside
          initial={false}
          animate={{ width: sidebarOpen ? 280 : 0 }}
          className="border-r bg-card/30 overflow-hidden"
        >
          <div className="p-6 space-y-2">
            <h2 className="text-lg font-semibold mb-4">Services</h2>
            {services.map((service) => {
              const Icon = service.icon;
              const isActive = pathname === service.href;
              return (
                <Link key={service.id} href={service.href}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "hover:bg-accent"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${
                        isActive ? "text-primary" : service.color
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{service.name}</div>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
