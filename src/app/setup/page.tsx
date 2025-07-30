"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Building2, Check, ArrowRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

const plans = [
  {
    id: "free",
    name: "Starter",
    price: "$0",
    description: "Perfect for getting started",
    features: [
      "5 team members",
      "10 GB storage",
      "100 compute hours/month",
      "Basic monitoring",
      "Email support",
    ],
    popular: false,
  },
  {
    id: "pro",
    name: "Professional",
    price: "$29",
    description: "For growing teams",
    features: [
      "25 team members",
      "100 GB storage",
      "500 compute hours/month",
      "Advanced monitoring",
      "Priority support",
      "Custom integrations",
    ],
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "$99",
    description: "For large organizations",
    features: [
      "Unlimited team members",
      "1 TB storage",
      "Unlimited compute hours",
      "Full monitoring suite",
      "24/7 phone support",
      "Custom SLA",
      "Dedicated account manager",
    ],
    popular: false,
  },
];

export default function CompanySetupPage() {
  const [step, setStep] = useState(1);
  const [companyName, setCompanyName] = useState("");
  const [companySlug, setCompanySlug] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("free");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { createCompany, userProfile, companies } = useAuth();
  const router = useRouter();

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()
      .substring(0, 30);
  };

  const handleCompanyNameChange = (name: string) => {
    setCompanyName(name);
    setCompanySlug(generateSlug(name));
  };

  const handleCreateCompany = async () => {
    if (!companyName.trim() || !companySlug.trim()) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await createCompany(companyName.trim(), companySlug.trim());
      router.push("/");
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {companies && companies.length > 0
              ? "Create New Company"
              : "Welcome to UWS!"}
          </h1>
          <p className="text-xl text-gray-600">
            {companies && companies.length > 0
              ? "Set up a new company for your team"
              : "Let's set up your company and get you started"}
          </p>
          {companies && companies.length > 0 && (
            <div className="mt-4">
              <Button
                variant="outline"
                onClick={() => router.push("/select-company")}
              >
                ← Back to Companies
              </Button>
            </div>
          )}
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center space-x-4">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step >= 1
                  ? "bg-primary text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              1
            </div>
            <div
              className={`w-16 h-1 ${step >= 2 ? "bg-primary" : "bg-gray-200"}`}
            />
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step >= 2
                  ? "bg-primary text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              2
            </div>
            <div
              className={`w-16 h-1 ${step >= 3 ? "bg-primary" : "bg-gray-200"}`}
            />
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step >= 3
                  ? "bg-primary text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              3
            </div>
          </div>
        </div>

        {/* Step 1: Company Information */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-md mx-auto"
          >
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>
                  Tell us about your company to get started
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Company Name *
                  </label>
                  <Input
                    type="text"
                    placeholder="Acme Inc."
                    value={companyName}
                    onChange={(e) => handleCompanyNameChange(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Company Slug *
                  </label>
                  <div className="flex items-center">
                    <span className="text-sm text-muted-foreground mr-2">
                      uws.com/
                    </span>
                    <Input
                      type="text"
                      placeholder="acme-inc"
                      value={companySlug}
                      onChange={(e) => setCompanySlug(e.target.value)}
                      className="flex-1"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    This will be your company's unique URL identifier
                  </p>
                </div>

                {error && (
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                    {error}
                  </div>
                )}

                <Button
                  onClick={() => setStep(2)}
                  className="w-full"
                  disabled={!companyName.trim() || !companySlug.trim()}
                >
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Choose Plan */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Choose Your Plan</h2>
              <p className="text-gray-600">
                Select the plan that best fits your needs
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {plans.map((plan) => (
                <motion.div
                  key={plan.id}
                  whileHover={{ scale: 1.02 }}
                  className="relative"
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <Card
                    className={`cursor-pointer transition-all h-full ${
                      selectedPlan === plan.id
                        ? "ring-2 ring-primary shadow-lg"
                        : "hover:shadow-md"
                    }`}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl">{plan.name}</CardTitle>
                        {selectedPlan === plan.id && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="text-3xl font-bold">
                          {plan.price}
                          <span className="text-sm font-normal text-muted-foreground">
                            /month
                          </span>
                        </div>
                        <CardDescription>{plan.description}</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <li
                            key={index}
                            className="flex items-center gap-2 text-sm"
                          >
                            <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-4">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={() => setStep(3)}>
                Continue with {plans.find((p) => p.id === selectedPlan)?.name}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-md mx-auto"
          >
            <Card>
              <CardHeader>
                <CardTitle>Ready to Launch!</CardTitle>
                <CardDescription>
                  Review your setup and create your company
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Company:</span>
                    <span className="font-medium">{companyName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">URL:</span>
                    <span className="font-medium">uws.com/{companySlug}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Plan:</span>
                    <span className="font-medium">
                      {plans.find((p) => p.id === selectedPlan)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Owner:</span>
                    <span className="font-medium">
                      {userProfile.displayName}
                    </span>
                  </div>
                </div>

                {error && (
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                    {error}
                  </div>
                )}

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep(2)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleCreateCompany}
                    className="flex-1"
                    disabled={loading}
                  >
                    {loading ? "Creating..." : "Create Company"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
