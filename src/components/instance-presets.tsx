"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ContainerConfig } from "@/lib/api";

export interface InstancePreset {
  id: string;
  name: string;
  description: string;
  cpu: number;
  memory: string;
  category: "general" | "compute" | "memory" | "storage";
  pricePerHour?: number;
}

const INSTANCE_PRESETS: InstancePreset[] = [
  // General Purpose
  {
    id: "t3.nano",
    name: "t3.nano",
    description: "General Purpose - Burstable Performance",
    cpu: 0.25,
    memory: "512m",
    category: "general",
    pricePerHour: 0.0052,
  },
  {
    id: "t3.micro",
    name: "t3.micro",
    description: "General Purpose - Burstable Performance",
    cpu: 0.5,
    memory: "1g",
    category: "general",
    pricePerHour: 0.0104,
  },
  {
    id: "t3.small",
    name: "t3.small",
    description: "General Purpose - Burstable Performance",
    cpu: 1,
    memory: "2g",
    category: "general",
    pricePerHour: 0.0208,
  },
  {
    id: "t3.medium",
    name: "t3.medium",
    description: "General Purpose - Burstable Performance",
    cpu: 2,
    memory: "4g",
    category: "general",
    pricePerHour: 0.0416,
  },
  {
    id: "m5.large",
    name: "m5.large",
    description: "General Purpose - Balanced",
    cpu: 2,
    memory: "8g",
    category: "general",
    pricePerHour: 0.096,
  },
  {
    id: "m5.xlarge",
    name: "m5.xlarge",
    description: "General Purpose - Balanced",
    cpu: 4,
    memory: "16g",
    category: "general",
    pricePerHour: 0.192,
  },
  // Compute Optimized
  {
    id: "c5.large",
    name: "c5.large",
    description: "Compute Optimized - High Performance",
    cpu: 2,
    memory: "4g",
    category: "compute",
    pricePerHour: 0.085,
  },
  {
    id: "c5.xlarge",
    name: "c5.xlarge",
    description: "Compute Optimized - High Performance",
    cpu: 4,
    memory: "8g",
    category: "compute",
    pricePerHour: 0.17,
  },
  {
    id: "c5.2xlarge",
    name: "c5.2xlarge",
    description: "Compute Optimized - High Performance",
    cpu: 8,
    memory: "16g",
    category: "compute",
    pricePerHour: 0.34,
  },
  // Memory Optimized
  {
    id: "r5.large",
    name: "r5.large",
    description: "Memory Optimized - High Memory",
    cpu: 2,
    memory: "16g",
    category: "memory",
    pricePerHour: 0.126,
  },
  {
    id: "r5.xlarge",
    name: "r5.xlarge",
    description: "Memory Optimized - High Memory",
    cpu: 4,
    memory: "32g",
    category: "memory",
    pricePerHour: 0.252,
  },
  {
    id: "r5.2xlarge",
    name: "r5.2xlarge",
    description: "Memory Optimized - High Memory",
    cpu: 8,
    memory: "64g",
    category: "memory",
    pricePerHour: 0.504,
  },
  // Storage Optimized
  {
    id: "i3.large",
    name: "i3.large",
    description: "Storage Optimized - High I/O",
    cpu: 2,
    memory: "15g",
    category: "storage",
    pricePerHour: 0.156,
  },
  {
    id: "i3.xlarge",
    name: "i3.xlarge",
    description: "Storage Optimized - High I/O",
    cpu: 4,
    memory: "30g",
    category: "storage",
    pricePerHour: 0.312,
  },
];

interface InstancePresetsProps {
  onPresetSelect: (config: Partial<ContainerConfig>) => void;
  selectedPreset?: string;
}

export default function InstancePresets({ onPresetSelect, selectedPreset }: InstancePresetsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    { id: "all", name: "All Types" },
    { id: "general", name: "General Purpose" },
    { id: "compute", name: "Compute Optimized" },
    { id: "memory", name: "Memory Optimized" },
    { id: "storage", name: "Storage Optimized" },
  ];

  const filteredPresets = INSTANCE_PRESETS.filter(
    preset => selectedCategory === "all" || preset.category === selectedCategory
  );

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "general":
        return "bg-blue-100 text-blue-800";
      case "compute":
        return "bg-green-100 text-green-800";
      case "memory":
        return "bg-purple-100 text-purple-800";
      case "storage":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "general":
        return "⚖️";
      case "compute":
        return "🚀";
      case "memory":
        return "🧠";
      case "storage":
        return "💾";
      default:
        return "📦";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Instance Types</h3>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPresets.map((preset) => (
          <Card
            key={preset.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedPreset === preset.id
                ? "ring-2 ring-primary border-primary"
                : "hover:border-primary/50"
            }`}
            onClick={() => onPresetSelect({
              cpu: preset.cpu,
              memory: preset.memory,
            })}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">
                  {preset.name}
                </CardTitle>
                <Badge className={getCategoryColor(preset.category)}>
                  {getCategoryIcon(preset.category)} {preset.category}
                </Badge>
              </div>
              <CardDescription className="text-sm">
                {preset.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">vCPU:</span>
                  <span className="font-medium">{preset.cpu}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Memory:</span>
                  <span className="font-medium">{preset.memory}</span>
                </div>
                {preset.pricePerHour && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Price:</span>
                    <span className="font-medium text-green-600">
                      ${preset.pricePerHour.toFixed(4)}/hr
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 