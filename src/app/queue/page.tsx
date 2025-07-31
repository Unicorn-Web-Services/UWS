"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Play,
  Server,
  Send,
  Inbox,
  ArrowRight,
  Archive,
  Trash2,
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
import { useToast } from "@/lib/toast-context";
import DashboardLayout from "@/components/dashboard-layout";
import { apiService } from "@/lib/api";

interface QueueService {
  service_id: string;
  container_id: string;
  node_id: string;
  ip_address: string;
  port: number;
  status: string;
  is_healthy: boolean;
  created_at: string;
  service_url: string;
}

export default function QueuePage() {
  const { toast } = useToast();
  const [queueServices, setQueueServices] = useState<QueueService[]>([]);
  const [currentService, setCurrentService] = useState<QueueService | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [launchingService, setLaunchingService] = useState(false);
  const [messages, setMessages] = useState<
    Array<{ id: string; message: string; timestamp: string }>
  >([]);
  const [newMessage, setNewMessage] = useState("");
  const [addingMessage, setAddingMessage] = useState(false);
  const [readingMessages, setReadingMessages] = useState(false);
  const [messageLimit, setMessageLimit] = useState(10);

  useEffect(() => {
    fetchQueueServices();
  }, []);

  const fetchQueueServices = async () => {
    try {
      setLoading(true);
      const response = await apiService.getQueueServices();
      setQueueServices(response.queue_services);

      // If we have services, use the first healthy one
      const healthyService = response.queue_services.find(
        (service) => service.is_healthy
      );
      if (healthyService) {
        setCurrentService(healthyService);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch queue services",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const launchQueueService = async () => {
    try {
      setLaunchingService(true);
      const service = await apiService.launchQueueService();

      toast({
        title: "Success",
        description: "Queue service launched successfully",
        variant: "success",
      });

      // Refresh the services list
      await fetchQueueServices();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to launch queue service",
        variant: "destructive",
      });
    } finally {
      setLaunchingService(false);
    }
  };

  const checkServiceHealth = async (serviceId: string) => {
    try {
      const health = await apiService.checkQueueServiceHealth(serviceId);
      toast({
        title: health.is_healthy ? "Service Healthy" : "Service Unhealthy",
        description: `Last check: ${new Date(
          health.last_check
        ).toLocaleString()}`,
        variant: health.is_healthy ? "success" : "destructive",
      });
      await fetchQueueServices();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check service health",
        variant: "destructive",
      });
    }
  };

  const addMessage = async () => {
    if (!currentService || !newMessage.trim()) return;

    try {
      setAddingMessage(true);
      await apiService.sendQueueMessage(
        currentService.service_id,
        { message: newMessage.trim() }
      );

      toast({
        title: "Success",
        description: "Message added to queue successfully",
        variant: "success",
      });

      setNewMessage("");
      await readMessages();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add message to queue",
        variant: "destructive",
      });
    } finally {
      setAddingMessage(false);
    }
  };

  const readMessages = async () => {
    if (!currentService) return;

    try {
      setReadingMessages(true);
      const response = await apiService.listQueueMessages(
        currentService.service_id
      );
      
      // Transform the response to match the expected format
      const transformedMessages = response.messages.map(msg => ({
        id: msg.id,
        message: msg.message, // The queue service returns 'message' field, not 'data'
        timestamp: msg.timestamp
      }));
      
      setMessages(transformedMessages);

      toast({
        title: "Success",
        description: `Read ${transformedMessages.length} messages from queue`,
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to read messages from queue",
        variant: "destructive",
      });
    } finally {
      setReadingMessages(false);
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!currentService) return;

    try {
      await apiService.deleteQueueMessage(currentService.service_id, messageId);

      toast({
        title: "Success",
        description: "Message deleted from queue successfully",
        variant: "success",
      });

      await readMessages();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete message from queue",
        variant: "destructive",
      });
    }
  };

  const deleteQueueService = async (serviceId: string) => {
    try {
      await apiService.removeQueueService(serviceId);
      toast({
        title: "Success",
        description: "Queue service deleted successfully",
        variant: "success",
      });
      await fetchQueueServices();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete queue service",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">UWS Queue</h1>
          <p className="text-muted-foreground">
            In-memory message queue service for asynchronous processing
          </p>
        </div>

        {/* Queue Service Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <CardTitle>Queue Service Status</CardTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchQueueServices}
                disabled={loading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={launchQueueService} disabled={launchingService}>
                {launchingService ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Launching...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Launch Queue Service
                  </>
                )}
              </Button>
            </div>
            <CardDescription>
              Manage your queue service instances
            </CardDescription>
          </CardHeader>
          <CardContent>
            {queueServices.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  No queue services running
                </p>
                <Button
                  onClick={launchQueueService}
                  disabled={launchingService}
                >
                  {launchingService ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Launching...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Launch Queue Service
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {queueServices.map((service) => (
                  <motion.div
                    key={service.service_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          service.is_healthy ? "bg-green-500" : "bg-red-500"
                        }`}
                      />
                      <div>
                        <div className="font-medium">
                          Queue Service {service.service_id.slice(-8)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {service.ip_address}:{service.port} • {service.status}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => checkServiceHealth(service.service_id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Health Check
                      </Button>
                      {service.is_healthy && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentService(service)}
                        >
                          Use This Service
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteQueueService(service.service_id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Queue Operations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Send className="h-5 w-5" />
              <span>Queue Operations</span>
            </CardTitle>
            <CardDescription>
              Manage your message queue operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!currentService ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No queue service connected
                </p>
                <p className="text-sm text-muted-foreground">
                  Launch a queue service to start message processing
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Queue Service Connected</h4>
                  <p className="text-sm text-muted-foreground">
                    Service URL: {currentService.service_url}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Service ID: {currentService.service_id}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Send className="h-4 w-4" />
                        <span className="font-medium">Send Message</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Add messages to the queue for processing
                      </p>
                      <div className="space-y-2">
                        <Input
                          placeholder="Enter message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && addMessage()}
                        />
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={addMessage}
                          disabled={!newMessage.trim() || addingMessage}
                        >
                          {addingMessage ? (
                            <>
                              <Clock className="h-4 w-4 mr-2 animate-spin" />
                              Adding...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              Send Message
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Inbox className="h-4 w-4" />
                        <span className="font-medium">Receive Messages</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Consume messages from the queue
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            placeholder="Limit"
                            value={messageLimit}
                            onChange={(e) =>
                              setMessageLimit(parseInt(e.target.value) || 10)
                            }
                            className="w-20"
                          />
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={readMessages}
                            disabled={readingMessages}
                          >
                            {readingMessages ? (
                              <>
                                <Clock className="h-4 w-4 mr-2 animate-spin" />
                                Reading...
                              </>
                            ) : (
                              <>
                                <Inbox className="h-4 w-4 mr-2" />
                                Read Messages
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {messages.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Queue Messages</CardTitle>
                      <CardDescription>
                        Messages in the queue ({messages.length} total)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 max-h-64 overflow-auto">
                        {messages.map((msg) => (
                          <div
                            key={msg.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="flex-1">
                              <p className="font-medium">{msg.message}</p>
                              <p className="text-sm text-muted-foreground">
                                ID: {msg.id} •{" "}
                                {new Date(msg.timestamp).toLocaleString()}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteMessage(msg.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <h4 className="font-medium text-orange-900 mb-1">
                    Queue Service Ready
                  </h4>
                  <p className="text-sm text-orange-700">
                    Your message queue service is running and ready to process
                    messages. Use the service URL above to connect your
                    applications for asynchronous message processing.
                  </p>
                </div>

                {/* Queue Flow Diagram */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Message Flow</CardTitle>
                    <CardDescription>
                      How messages flow through your queue system
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between py-4">
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Send className="h-6 w-6 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium">Producer</span>
                        <span className="text-xs text-muted-foreground">
                          Sends messages
                        </span>
                      </div>

                      <ArrowRight className="h-6 w-6 text-muted-foreground" />

                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <MessageSquare className="h-6 w-6 text-green-600" />
                        </div>
                        <span className="text-sm font-medium">Queue</span>
                        <span className="text-xs text-muted-foreground">
                          Stores messages
                        </span>
                      </div>

                      <ArrowRight className="h-6 w-6 text-muted-foreground" />

                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                          <Inbox className="h-6 w-6 text-purple-600" />
                        </div>
                        <span className="text-sm font-medium">Consumer</span>
                        <span className="text-xs text-muted-foreground">
                          Processes messages
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
