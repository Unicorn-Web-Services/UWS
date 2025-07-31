import { useState, useEffect, useCallback } from 'react';
import { apiService, ContainerConfig, Container, Node, HealthStatus } from '../api';
import { useAuth } from '../auth-context';

// Hook for managing containers
export function useContainers() {
  const { user } = useAuth();
  const [containers, setContainers] = useState<Container[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContainers = useCallback(async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getContainers(user.uid);
      setContainers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch containers');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  const createContainer = useCallback(async (config: ContainerConfig) => {
    if (!user?.uid) throw new Error('User not authenticated');
    
    try {
      const newContainer = await apiService.createContainer(config, user.uid);
      setContainers(prev => [...prev, newContainer]);
      return newContainer;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to create container');
    }
  }, [user?.uid]);

  const startContainer = useCallback(async (containerId: string) => {
    try {
      await apiService.startContainer(containerId);
      setContainers(prev => 
        prev.map(container => 
          container.container_id === containerId 
            ? { ...container, status: 'running' }
            : container
        )
      );
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to start container');
    }
  }, []);

  const stopContainer = useCallback(async (containerId: string) => {
    try {
      await apiService.stopContainer(containerId);
      setContainers(prev => 
        prev.map(container => 
          container.container_id === containerId 
            ? { ...container, status: 'stopped' }
            : container
        )
      );
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to stop container');
    }
  }, []);

  const deleteContainer = useCallback(async (containerId: string) => {
    try {
      await apiService.deleteContainer(containerId);
      setContainers(prev => 
        prev.filter(container => container.container_id !== containerId)
      );
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete container');
    }
  }, []);

  useEffect(() => {
    fetchContainers();
  }, [fetchContainers]);

  return {
    containers,
    loading,
    error,
    fetchContainers,
    createContainer,
    startContainer,
    stopContainer,
    deleteContainer,
  };
}

// Hook for managing nodes
export function useNodes() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNodes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getNodes();
      setNodes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch nodes');
    } finally {
      setLoading(false);
    }
  }, []);

  const checkNodeHealth = useCallback(async (nodeId: string) => {
    try {
      const health = await apiService.getNodeHealth(nodeId);
      setNodes(prev => 
        prev.map(node => 
          node.node_id === nodeId 
            ? { ...node, is_healthy: health.healthy }
            : node
        )
      );
      return health;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to check node health');
    }
  }, []);

  useEffect(() => {
    fetchNodes();
  }, [fetchNodes]);

  return {
    nodes,
    loading,
    error,
    fetchNodes,
    checkNodeHealth,
  };
}

// Hook for health monitoring
export function useHealthMonitoring() {
  const [orchestratorHealth, setOrchestratorHealth] = useState<HealthStatus | null>(null);
  const [serverHealth, setServerHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [orchestrator, server] = await Promise.all([
        apiService.getOrchestratorHealth(),
        apiService.getServerHealth(),
      ]);
      
      setOrchestratorHealth(orchestrator);
      setServerHealth(server);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch health status');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    
    // Set up periodic health checks
    const interval = setInterval(fetchHealth, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, [fetchHealth]);

  return {
    orchestratorHealth,
    serverHealth,
    loading,
    error,
    fetchHealth,
  };
}

// Hook for real-time container status updates
export function useContainerStatus(containerId: string) {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getContainerStatus(containerId);
      setStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch container status');
    } finally {
      setLoading(false);
    }
  }, [containerId]);

  useEffect(() => {
    if (containerId) {
      fetchStatus();
      
      // Set up periodic status updates
      const interval = setInterval(fetchStatus, 10000); // Every 10 seconds
      
      return () => clearInterval(interval);
    }
  }, [containerId, fetchStatus]);

  return {
    status,
    loading,
    error,
    fetchStatus,
  };
}

// Hook for WebSocket terminal connection
export function useTerminalWebSocket(nodeId: string, containerId: string) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!nodeId || !containerId) return;

    const ws = apiService.createTerminalWebSocket(nodeId, containerId);

    ws.onopen = () => {
      setConnected(true);
      setError(null);
    };

    ws.onclose = () => {
      setConnected(false);
    };

    ws.onerror = (event) => {
      setError('WebSocket connection error');
      setConnected(false);
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [nodeId, containerId]);

  const sendMessage = useCallback((message: string) => {
    if (socket && connected) {
      socket.send(message);
    }
  }, [socket, connected]);

  return {
    socket,
    connected,
    error,
    sendMessage,
  };
}

// Hook for API service configuration
export function useApiConfig() {
  const { user } = useAuth();

  useEffect(() => {
    // Set authentication token when user changes
    if (user) {
      // You can implement token management here
      // For now, we'll use a simple approach
      apiService.setAuthToken('user-token');
    }
  }, [user]);

  return {
    apiService,
  };
} 