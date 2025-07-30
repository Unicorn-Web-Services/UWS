"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Plus,
  Send,
  Trash2,
  RefreshCw,
  Clock,
  Users,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Pause,
  Play,
  Settings,
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
import DashboardLayout from "@/components/dashboard-layout";

// Mock data for queues
const queues = [
  {
    id: "email-queue",
    name: "email-notifications",
    type: "FIFO",
    messages: 156,
    dlqMessages: 2,
    status: "active",
    visibility: "30s",
    retention: "14 days",
    created: "2024-01-10",
  },
  {
    id: "processing-queue",
    name: "image-processing",
    type: "Standard",
    messages: 45,
    dlqMessages: 0,
    status: "active",
    visibility: "60s",
    retention: "7 days",
    created: "2024-01-15",
  },
  {
    id: "analytics-queue",
    name: "analytics-events",
    type: "Standard",
    messages: 892,
    dlqMessages: 12,
    status: "paused",
    visibility: "30s",
    retention: "3 days",
    created: "2024-01-08",
  },
];

const recentMessages = [
  {
    id: "msg-1",
    queue: "email-notifications",
    messageId: "abc123-def456",
    timestamp: "2024-01-20 14:32:15",
    status: "processed",
    attempts: 1,
    body: "Welcome email for user john@example.com",
  },
  {
    id: "msg-2",
    queue: "image-processing",
    messageId: "ghi789-jkl012",
    timestamp: "2024-01-20 14:30:42",
    status: "processing",
    attempts: 1,
    body: "Resize image: profile-photo-2024.jpg",
  },
  {
    id: "msg-3",
    queue: "analytics-events",
    messageId: "mno345-pqr678",
    timestamp: "2024-01-20 14:28:33",
    status: "failed",
    attempts: 3,
    body: "User click event tracking data",
  },
];

export default function QueuePage() {
  const [selectedQueue, setSelectedQueue] = useState<string | null>(null);
  const [showCreateQueue, setShowCreateQueue] = useState(false);
  const [showSendMessage, setShowSendMessage] = useState(false);
  const [newQueueName, setNewQueueName] = useState("");
  const [queueType, setQueueType] = useState("Standard");
  const [messageBody, setMessageBody] = useState("");

  const handleCreateQueue = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement API call
    console.log("Creating queue:", newQueueName, queueType);
    setNewQueueName("");
    setShowCreateQueue(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement API call
    console.log("Sending message:", messageBody, "to queue:", selectedQueue);
    setMessageBody("");
    setShowSendMessage(false);
  };

  const handleQueueAction = (action: string, queueId: string) => {
    // TODO: Implement queue actions
    console.log(`${action} queue:`, queueId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-100";
      case "paused":
        return "text-yellow-600 bg-yellow-100";
      case "error":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getMessageStatusColor = (status: string) => {
    switch (status) {
      case "processed":
        return "text-green-600";
      case "processing":
        return "text-blue-600";
      case "failed":
        return "text-red-600";
      case "pending":
        return "text-yellow-600";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <MessageSquare className="h-8 w-8 text-service-queue" />
            <div>
              <h1 className="text-3xl font-bold">UWS-Queue</h1>
              <p className="text-muted-foreground">
                Simple message queue service
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowCreateQueue(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Queue
            </Button>
            {selectedQueue && (
              <Button onClick={() => setShowSendMessage(true)}>
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Queues</CardDescription>
              <CardTitle className="text-2xl">{queues.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Messages</CardDescription>
              <CardTitle className="text-2xl">1,093</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>DLQ Messages</CardDescription>
              <CardTitle className="text-2xl">14</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Processing Rate</CardDescription>
              <CardTitle className="text-2xl">45/min</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Queue List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Message Queues
                </CardTitle>
                <CardDescription>Your message queues</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {queues.map((queue) => (
                  <motion.div
                    key={queue.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedQueue(queue.id)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedQueue === queue.id
                        ? "bg-primary/10 border border-primary/20"
                        : "hover:bg-accent"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{queue.name}</div>
                        <div
                          className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                            queue.status
                          )}`}
                        >
                          {queue.status}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>{queue.type} Queue</div>
                        <div>{queue.messages} messages</div>
                        <div>DLQ: {queue.dlqMessages} messages</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Create Queue Form */}
            {showCreateQueue && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Create New Queue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateQueue} className="space-y-4">
                      <div>
                        <Input
                          placeholder="Queue name"
                          value={newQueueName}
                          onChange={(e) => setNewQueueName(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <select
                          value={queueType}
                          onChange={(e) => setQueueType(e.target.value)}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="Standard">Standard Queue</option>
                          <option value="FIFO">FIFO Queue</option>
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Create
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowCreateQueue(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Send Message Form */}
            {showSendMessage && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Send Message</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSendMessage} className="space-y-4">
                      <div>
                        <textarea
                          placeholder="Message body (JSON format)"
                          value={messageBody}
                          onChange={(e) => setMessageBody(e.target.value)}
                          className="w-full p-2 border rounded-md h-24 resize-none"
                          required
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" size="sm">
                          <Send className="h-4 w-4 mr-2" />
                          Send
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowSendMessage(false)}
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

          {/* Queue Details */}
          <div className="lg:col-span-2 space-y-6">
            {!selectedQueue ? (
              <Card>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Select a queue to view its details</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Queue Overview */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        {queues.find((q) => q.id === selectedQueue)?.name}
                      </CardTitle>
                      <div className="flex gap-2">
                        {(() => {
                          const queue = queues.find(
                            (q) => q.id === selectedQueue
                          );
                          return queue?.status === "active" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleQueueAction("pause", selectedQueue)
                              }
                            >
                              <Pause className="h-4 w-4 mr-2" />
                              Pause
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() =>
                                handleQueueAction("resume", selectedQueue)
                              }
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Resume
                            </Button>
                          );
                        })()}
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-2" />
                          Configure
                        </Button>
                        <Button variant="outline" size="sm">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Purge
                        </Button>
                      </div>
                    </div>
                    <CardDescription>
                      Message queue configuration and metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const queue = queues.find((q) => q.id === selectedQueue);
                      if (!queue) return null;

                      return (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <div className="text-sm text-muted-foreground">
                              Queue Type
                            </div>
                            <div className="font-medium">{queue.type}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">
                              Visibility Timeout
                            </div>
                            <div className="font-medium">
                              {queue.visibility}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">
                              Retention Period
                            </div>
                            <div className="font-medium">{queue.retention}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">
                              Created
                            </div>
                            <div className="font-medium">{queue.created}</div>
                          </div>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>

                {/* Queue Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Available Messages
                      </CardDescription>
                      <CardTitle className="text-2xl">
                        {queues.find((q) => q.id === selectedQueue)?.messages ||
                          0}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        DLQ Messages
                      </CardDescription>
                      <CardTitle className="text-2xl text-red-600">
                        {queues.find((q) => q.id === selectedQueue)
                          ?.dlqMessages || 0}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Messages/Min
                      </CardDescription>
                      <CardTitle className="text-2xl text-green-600">
                        23
                      </CardTitle>
                    </CardHeader>
                  </Card>
                </div>

                {/* Message Inspector */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Message Inspector
                    </CardTitle>
                    <CardDescription>
                      View and manage queue messages
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-sm">
                      <div className="text-slate-500">
                        // Sample Message Body
                      </div>
                      <div className="mt-2">
                        <span className="text-slate-300">{"{"}</span>
                        <br />
                        <span className="ml-2 text-green-400">"messageId"</span>
                        <span className="text-slate-300">: </span>
                        <span className="text-yellow-400">"abc123-def456"</span>
                        <span className="text-slate-300">,</span>
                        <br />
                        <span className="ml-2 text-green-400">"timestamp"</span>
                        <span className="text-slate-300">: </span>
                        <span className="text-yellow-400">
                          "2024-01-20T14:32:15Z"
                        </span>
                        <span className="text-slate-300">,</span>
                        <br />
                        <span className="ml-2 text-green-400">"body"</span>
                        <span className="text-slate-300">: </span>
                        <span className="text-yellow-400">
                          "Welcome email for user"
                        </span>
                        <br />
                        <span className="text-slate-300">{"}"}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <div className="text-sm text-muted-foreground">
                        Showing 1 of{" "}
                        {queues.find((q) => q.id === selectedQueue)?.messages ||
                          0}{" "}
                        messages
                      </div>
                      <Button size="sm">Poll Messages</Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Recent Messages */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Messages
                </CardTitle>
                <CardDescription>
                  Recent message processing activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentMessages.map((message) => (
                    <div
                      key={message.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            message.status === "processed"
                              ? "bg-green-500"
                              : message.status === "processing"
                              ? "bg-blue-500"
                              : "bg-red-500"
                          }`}
                        />
                        <div>
                          <div className="font-medium">{message.body}</div>
                          <div className="text-xs text-muted-foreground">
                            {message.queue} • {message.timestamp} • Attempt{" "}
                            {message.attempts}
                          </div>
                        </div>
                      </div>
                      <div
                        className={`text-xs ${getMessageStatusColor(
                          message.status
                        )}`}
                      >
                        {message.status}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
