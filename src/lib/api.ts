// API service layer for UWS platform
// Handles all communication with backend services

export interface ContainerConfig {
  image: string;
  name?: string;
  env?: Record<string, string>;
  cpu: number;
  memory: string;
  ports?: Record<string, number>;
}

export interface Container {
  container_id: string;
  name?: string;
  image: string;
  status: string;
  node_id: string;
  created_at?: string;
  ports?: Record<string, number>;
  cpu?: number;
  memory?: string;
}

export interface Node {
  node_id: string;
  url: string;
  is_healthy: boolean;
  last_seen?: string;
  last_health_check?: string;
}

export interface HealthStatus {
  status: string;
  timestamp: string;
  services?: Record<string, string>;
  system?: {
    free_disk_gb: number;
    memory_usage_percent: number;
    uptime_seconds: number;
  };
}

export interface Metrics {
  active_containers: number;
  active_nodes: number;
  request_count: number;
  websocket_connections: number;
}

export interface ApiError {
  detail: string;
  error_code?: string;
  status_code: number;
}

class ApiService {
  private orchestratorUrl: string;
  private serverUrl: string;
  private authToken: string | null = null;

  constructor() {
    this.orchestratorUrl =
      process.env.NEXT_PUBLIC_ORCHESTRATOR_URL || "http://localhost:9000";
    this.serverUrl =
      process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8002";
  }

  // Set authentication token
  setAuthToken(token: string) {
    this.authToken = token;
  }

  // Authentication methods
  async login(username: string, password: string): Promise<{
    access_token: string;
    refresh_token: string;
    token_type: string;
  }> {
    return this.apiRequest<{
      access_token: string;
      refresh_token: string;
      token_type: string;
    }>(`${this.serverUrl}/auth/login`, {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
  }

  async getCurrentUser(): Promise<{
    id: number;
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
    is_active: boolean;
    is_superuser: boolean;
    created_at: string;
    last_login?: string;
  }> {
    return this.apiRequest<{
      id: number;
      username: string;
      email: string;
      first_name?: string;
      last_name?: string;
      is_active: boolean;
      is_superuser: boolean;
      created_at: string;
      last_login?: string;
    }>(`${this.serverUrl}/auth/me`);
  }

  async refreshToken(refreshToken: string): Promise<{
    access_token: string;
    refresh_token: string;
    token_type: string;
  }> {
    return this.apiRequest<{
      access_token: string;
      refresh_token: string;
      token_type: string;
    }>(`${this.serverUrl}/auth/refresh`, {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  }

  // Get headers with authentication
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (this.authToken) {
      headers["Authorization"] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  // Handle API responses
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData: ApiError = await response.json().catch(() => ({
        detail: "Unknown error occurred",
        status_code: response.status,
      }));

      throw new Error(
        errorData.detail || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    return response.json();
  }

  // Generic API request method
  private async apiRequest<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    const config: RequestInit = {
      headers: this.getHeaders(),
      ...options,
    };

    const response = await fetch(url, config);
    return this.handleResponse<T>(response);
  }

  // Container Management
  async createContainer(
    config: ContainerConfig,
    userId: string
  ): Promise<Container> {
    return this.apiRequest<Container>(`${this.orchestratorUrl}/launch`, {
      method: "POST",
      body: JSON.stringify({
        user_id: userId,
        config,
      }),
    });
  }

  async getContainers(userId: string): Promise<Container[]> {
    const response = await this.apiRequest<{ containers: Container[] }>(
      `${this.orchestratorUrl}/user/${userId}/containers`
    );
    return response.containers;
  }

  async getContainerStatus(containerId: string): Promise<any> {
    return this.apiRequest(
      `${this.orchestratorUrl}/containers/${containerId}/status`
    );
  }

  async getContainerPorts(
    containerId: string
  ): Promise<Record<string, number>> {
    return this.apiRequest<Record<string, number>>(
      `${this.orchestratorUrl}/containers/${containerId}/ports`
    );
  }

  async startContainer(containerId: string): Promise<any> {
    return this.apiRequest(
      `${this.orchestratorUrl}/containers/${containerId}/start`,
      {
        method: "POST",
      }
    );
  }

  async stopContainer(containerId: string): Promise<any> {
    return this.apiRequest(
      `${this.orchestratorUrl}/containers/${containerId}/stop`,
      {
        method: "POST",
      }
    );
  }

  async restartContainer(containerId: string): Promise<any> {
    return this.apiRequest(
      `${this.orchestratorUrl}/containers/${containerId}/restart`,
      {
        method: "POST",
      }
    );
  }

  async deleteContainer(containerId: string): Promise<{ message: string }> {
    return this.apiRequest<{ message: string }>(
      `${this.orchestratorUrl}/containers/${containerId}`,
      {
        method: "DELETE",
      }
    );
  }

  async listAllContainers(all: boolean = false): Promise<Container[]> {
    return this.apiRequest<Container[]>(
      `${this.orchestratorUrl}/containers?all=${all}`
    );
  }

  // Node Management
  async getNodes(): Promise<Node[]> {
    const response = await this.apiRequest<{ nodes: Node[] }>(
      `${this.orchestratorUrl}/nodes`
    );
    return response.nodes;
  }

  async getNodeHealth(
    nodeId: string
  ): Promise<{ node_id: string; healthy: boolean }> {
    return this.apiRequest<{ node_id: string; healthy: boolean }>(
      `${this.orchestratorUrl}/health_check/${nodeId}`
    );
  }

  async getOrchestratorMetrics(): Promise<string> {
    const response = await fetch(`${this.orchestratorUrl}/metrics`);
    return response.text();
  }

  async getServerMetrics(): Promise<string> {
    const response = await fetch(`${this.serverUrl}/metrics`);
    return response.text();
  }

  // Service-specific endpoints
  async launchBucketService(): Promise<
    Container & {
      service_id: string;
      ip_address: string;
      port: number;
      service_url: string;
    }
  > {
    return this.apiRequest<
      Container & {
        service_id: string;
        ip_address: string;
        port: number;
        service_url: string;
      }
    >(`${this.orchestratorUrl}/launchBucket`, {
      method: "POST",
    });
  }

  // Bucket service management
  async getBucketServices(): Promise<{
    bucket_services: Array<{
      service_id: string;
      container_id: string;
      node_id: string;
      ip_address: string;
      port: number;
      status: string;
      is_healthy: boolean;
      created_at: string;
      service_url: string;
    }>;
  }> {
    return this.apiRequest<{
      bucket_services: Array<{
        service_id: string;
        container_id: string;
        node_id: string;
        ip_address: string;
        port: number;
        status: string;
        is_healthy: boolean;
        created_at: string;
        service_url: string;
      }>;
    }>(`${this.orchestratorUrl}/bucket-services`);
  }

  async getBucketService(serviceId: string): Promise<{
    service_id: string;
    container_id: string;
    node_id: string;
    ip_address: string;
    port: number;
    status: string;
    is_healthy: boolean;
    created_at: string;
    service_url: string;
  }> {
    return this.apiRequest<{
      service_id: string;
      container_id: string;
      node_id: string;
      ip_address: string;
      port: number;
      status: string;
      is_healthy: boolean;
      created_at: string;
      service_url: string;
    }>(`${this.orchestratorUrl}/bucket-services/${serviceId}`);
  }

  async listBucketFiles(serviceId: string): Promise<{ files: string[] }> {
    return this.apiRequest<{ files: string[] }>(
      `${this.orchestratorUrl}/bucket-services/${serviceId}/files`
    );
  }

  async uploadToBucket(
    serviceId: string,
    file: File
  ): Promise<{ filename: string; detail: string; path: string }> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
      `${this.orchestratorUrl}/bucket-services/${serviceId}/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        detail: "Unknown error occurred",
        status_code: response.status,
      }));
      throw new Error(
        errorData.detail || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    return response.json();
  }

  async downloadFromBucket(serviceId: string, filename: string): Promise<Blob> {
    const response = await fetch(
      `${this.orchestratorUrl}/bucket-services/${serviceId}/download/${filename}`
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        detail: "Unknown error occurred",
        status_code: response.status,
      }));
      throw new Error(
        errorData.detail || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    return response.blob();
  }

  async deleteFromBucket(
    serviceId: string,
    filename: string
  ): Promise<{ detail: string }> {
    return this.apiRequest<{ detail: string }>(
      `${this.orchestratorUrl}/bucket-services/${serviceId}/delete/${filename}`,
      {
        method: "DELETE",
      }
    );
  }

  async checkBucketServiceHealth(serviceId: string): Promise<{
    service_id: string;
    is_healthy: boolean;
    last_check: string;
    service_url: string;
  }> {
    return this.apiRequest<{
      service_id: string;
      is_healthy: boolean;
      last_check: string;
      service_url: string;
    }>(`${this.orchestratorUrl}/bucket-services/${serviceId}/health`);
  }

  async removeBucketService(serviceId: string): Promise<{ message: string }> {
    return this.apiRequest<{ message: string }>(
      `${this.orchestratorUrl}/bucket-services/${serviceId}`,
      {
        method: "DELETE",
      }
    );
  }

  async launchDBService(config?: {
    instance_name?: string;
    max_cpu_percent?: number;
    max_ram_mb?: number;
    max_disk_gb?: number;
    database_name?: string;
  }): Promise<
    Container & {
      service_id: string;
      ip_address: string;
      port: number;
      service_url: string;
    }
  > {
    return this.apiRequest<
      Container & {
        service_id: string;
        ip_address: string;
        port: number;
        service_url: string;
      }
    >(`${this.orchestratorUrl}/launchDB`, {
      method: "POST",
      ...(config && { body: JSON.stringify(config) }),
    });
  }

  async launchNoSQLService(): Promise<
    Container & {
      service_id: string;
      ip_address: string;
      port: number;
      service_url: string;
    }
  > {
    return this.apiRequest<
      Container & {
        service_id: string;
        ip_address: string;
        port: number;
        service_url: string;
      }
    >(`${this.orchestratorUrl}/launchNoSQL`, {
      method: "POST",
    });
  }

  async launchQueueService(): Promise<
    Container & {
      service_id: string;
      ip_address: string;
      port: number;
      service_url: string;
    }
  > {
    return this.apiRequest<
      Container & {
        service_id: string;
        ip_address: string;
        port: number;
        service_url: string;
      }
    >(`${this.orchestratorUrl}/launchQueue`, {
      method: "POST",
    });
  }

  async launchSecretsService(): Promise<
    Container & {
      service_id: string;
      ip_address: string;
      port: number;
      service_url: string;
    }
  > {
    return this.apiRequest<
      Container & {
        service_id: string;
        ip_address: string;
        port: number;
        service_url: string;
      }
    >(`${this.orchestratorUrl}/launchSecrets`, {
      method: "POST",
    });
  }

  // DB service management
  async getDBServices(): Promise<{
    db_services: Array<{
      service_id: string;
      container_id: string;
      node_id: string;
      ip_address: string;
      port: number;
      status: string;
      is_healthy: boolean;
      created_at: string;
      service_url: string;
      max_cpu_percent: number;
      max_ram_mb: number;
      max_disk_gb: number;
      database_name: string;
      instance_name?: string;
    }>;
  }> {
    return this.apiRequest<{
      db_services: Array<{
        service_id: string;
        container_id: string;
        node_id: string;
        ip_address: string;
        port: number;
        status: string;
        is_healthy: boolean;
        created_at: string;
        service_url: string;
        max_cpu_percent: number;
        max_ram_mb: number;
        max_disk_gb: number;
        database_name: string;
        instance_name?: string;
      }>;
    }>(`${this.orchestratorUrl}/db-services`);
  }

  async getDBService(serviceId: string): Promise<{
    service_id: string;
    container_id: string;
    node_id: string;
    ip_address: string;
    port: number;
    status: string;
    is_healthy: boolean;
    created_at: string;
    service_url: string;
    max_cpu_percent: number;
    max_ram_mb: number;
    max_disk_gb: number;
    database_name: string;
    instance_name?: string;
  }> {
    return this.apiRequest<{
      service_id: string;
      container_id: string;
      node_id: string;
      ip_address: string;
      port: number;
      status: string;
      is_healthy: boolean;
      created_at: string;
      service_url: string;
      max_cpu_percent: number;
      max_ram_mb: number;
      max_disk_gb: number;
      database_name: string;
      instance_name?: string;
    }>(`${this.orchestratorUrl}/db-services/${serviceId}`);
  }

  async checkDBServiceHealth(serviceId: string): Promise<{
    service_id: string;
    is_healthy: boolean;
    last_check: string;
    service_url: string;
  }> {
    return this.apiRequest<{
      service_id: string;
      is_healthy: boolean;
      last_check: string;
      service_url: string;
    }>(`${this.orchestratorUrl}/db-services/${serviceId}/health`);
  }

  // Database SQL operations
  async executeDBQuery(
    serviceId: string,
    query: string,
    params?: Record<string, any>
  ): Promise<{
    service_id: string;
    query_result: {
      success: boolean;
      result: any[];
      timestamp: string;
    };
    timestamp: string;
  }> {
    return this.apiRequest<{
      service_id: string;
      query_result: {
        success: boolean;
        result: any[];
        timestamp: string;
      };
      timestamp: string;
    }>(`${this.orchestratorUrl}/db-services/${serviceId}/sql/query`, {
      method: "POST",
      body: JSON.stringify({ query, params }),
    });
  }

  async getDBTables(serviceId: string): Promise<{
    service_id: string;
    tables: {
      tables: string[];
      timestamp: string;
    };
    timestamp: string;
  }> {
    return this.apiRequest<{
      service_id: string;
      tables: {
        tables: string[];
        timestamp: string;
      };
      timestamp: string;
    }>(`${this.orchestratorUrl}/db-services/${serviceId}/sql/tables`);
  }

  async getDBTableSchema(
    serviceId: string,
    tableName: string
  ): Promise<{
    service_id: string;
    schema: {
      table_name: string;
      columns: Array<{
        name: string;
        type: string;
        not_null: boolean;
        default_value: any;
        primary_key: boolean;
      }>;
      timestamp: string;
    };
    timestamp: string;
  }> {
    return this.apiRequest<{
      service_id: string;
      schema: {
        table_name: string;
        columns: Array<{
          name: string;
          type: string;
          not_null: boolean;
          default_value: any;
          primary_key: boolean;
        }>;
        timestamp: string;
      };
      timestamp: string;
    }>(
      `${this.orchestratorUrl}/db-services/${serviceId}/sql/schema/${tableName}`
    );
  }

  async updateDBServiceConfig(
    serviceId: string,
    config: {
      max_cpu_percent?: number;
      max_ram_mb?: number;
      max_disk_gb?: number;
      instance_name?: string;
    }
  ): Promise<{
    service_id: string;
    message: string;
    updated_config: {
      max_cpu_percent: number;
      max_ram_mb: number;
      max_disk_gb: number;
      instance_name?: string;
    };
    timestamp: string;
  }> {
    return this.apiRequest<{
      service_id: string;
      message: string;
      updated_config: {
        max_cpu_percent: number;
        max_ram_mb: number;
        max_disk_gb: number;
        instance_name?: string;
      };
      timestamp: string;
    }>(`${this.orchestratorUrl}/db-services/${serviceId}/config`, {
      method: "PUT",
      body: JSON.stringify(config),
    });
  }

  async removeDBService(serviceId: string): Promise<{ message: string }> {
    return this.apiRequest<{ message: string }>(
      `${this.orchestratorUrl}/db-services/${serviceId}`,
      {
        method: "DELETE",
      }
    );
  }

  async getDBServiceStats(serviceId: string): Promise<{
    service_id: string;
    statistics: {
      database_stats: {
        database_size_mb?: number;
        table_count?: number;
        tables?: string[];
        table_statistics?: Record<string, { row_count?: number }>;
      };
      resource_usage: {
        cpu_percent: number;
        memory_percent: number;
        disk_free_gb: number;
      };
      timestamp: string;
    };
    service_config: {
      max_cpu_percent: number;
      max_ram_mb: number;
      max_disk_gb: number;
      instance_name?: string;
      database_name: string;
    };
    timestamp: string;
  }> {
    return this.apiRequest<{
      service_id: string;
      statistics: {
        database_stats: {
          database_size_mb?: number;
          table_count?: number;
          tables?: string[];
          table_statistics?: Record<string, { row_count?: number }>;
        };
        resource_usage: {
          cpu_percent: number;
          memory_percent: number;
          disk_free_gb: number;
        };
        timestamp: string;
      };
      service_config: {
        max_cpu_percent: number;
        max_ram_mb: number;
        max_disk_gb: number;
        instance_name?: string;
        database_name: string;
      };
      timestamp: string;
    }>(`${this.orchestratorUrl}/db-services/${serviceId}/stats`);
  }

  // NoSQL service management
  async getNoSQLServices(): Promise<{
    nosql_services: Array<{
      service_id: string;
      container_id: string;
      node_id: string;
      ip_address: string;
      port: number;
      status: string;
      is_healthy: boolean;
      created_at: string;
      service_url: string;
    }>;
  }> {
    return this.apiRequest<{
      nosql_services: Array<{
        service_id: string;
        container_id: string;
        node_id: string;
        ip_address: string;
        port: number;
        status: string;
        is_healthy: boolean;
        created_at: string;
        service_url: string;
      }>;
    }>(`${this.orchestratorUrl}/nosql-services`);
  }

  async getNoSQLService(serviceId: string): Promise<{
    service_id: string;
    container_id: string;
    node_id: string;
    ip_address: string;
    port: number;
    status: string;
    is_healthy: boolean;
    created_at: string;
    service_url: string;
  }> {
    return this.apiRequest<{
      service_id: string;
      container_id: string;
      node_id: string;
      ip_address: string;
      port: number;
      status: string;
      is_healthy: boolean;
      created_at: string;
      service_url: string;
    }>(`${this.orchestratorUrl}/nosql-services/${serviceId}`);
  }

  async checkNoSQLServiceHealth(serviceId: string): Promise<{
    service_id: string;
    is_healthy: boolean;
    last_check: string;
    service_url: string;
  }> {
    return this.apiRequest<{
      service_id: string;
      is_healthy: boolean;
      last_check: string;
      service_url: string;
    }>(`${this.orchestratorUrl}/nosql-services/${serviceId}/health`);
  }

  // NoSQL collection management
  async getNoSQLCollections(serviceId: string): Promise<{
    service_id: string;
    collections: {
      collections: string[];
    };
    timestamp: string;
  }> {
    return this.apiRequest<{
      service_id: string;
      collections: {
        collections: string[];
      };
      timestamp: string;
    }>(`${this.orchestratorUrl}/nosql-services/${serviceId}/collections`);
  }

  async createNoSQLCollection(
    serviceId: string,
    collectionName: string
  ): Promise<{
    service_id: string;
    collection_name: string;
    result: any;
    timestamp: string;
  }> {
    return this.apiRequest<{
      service_id: string;
      collection_name: string;
      result: any;
      timestamp: string;
    }>(
      `${this.orchestratorUrl}/nosql-services/${serviceId}/collections/${collectionName}`,
      {
        method: "POST",
      }
    );
  }

  async saveNoSQLEntity(
    serviceId: string,
    collectionName: string,
    entityData: any
  ): Promise<{
    service_id: string;
    collection_name: string;
    result: {
      inserted_id: string;
    };
    timestamp: string;
  }> {
    return this.apiRequest<{
      service_id: string;
      collection_name: string;
      result: {
        inserted_id: string;
      };
      timestamp: string;
    }>(
      `${this.orchestratorUrl}/nosql-services/${serviceId}/collections/${collectionName}/save`,
      {
        method: "POST",
        body: JSON.stringify(entityData),
      }
    );
  }

  async queryNoSQLCollection(
    serviceId: string,
    collectionName: string,
    field: string,
    value: string
  ): Promise<{
    service_id: string;
    collection_name: string;
    query_result: any[];
    timestamp: string;
  }> {
    const params = new URLSearchParams({ field, value });
    return this.apiRequest<{
      service_id: string;
      collection_name: string;
      query_result: any[];
      timestamp: string;
    }>(
      `${this.orchestratorUrl}/nosql-services/${serviceId}/collections/${collectionName}/query?${params}`
    );
  }

  async scanNoSQLCollection(
    serviceId: string,
    collectionName: string
  ): Promise<{
    service_id: string;
    collection_name: string;
    documents: any[];
    timestamp: string;
  }> {
    return this.apiRequest<{
      service_id: string;
      collection_name: string;
      documents: any[];
      timestamp: string;
    }>(
      `${this.orchestratorUrl}/nosql-services/${serviceId}/collections/${collectionName}/scan`
    );
  }

  async getNoSQLEntity(
    serviceId: string,
    collectionName: string,
    entityId: string
  ): Promise<{
    service_id: string;
    collection_name: string;
    entity: any;
    timestamp: string;
  }> {
    return this.apiRequest<{
      service_id: string;
      collection_name: string;
      entity: any;
      timestamp: string;
    }>(
      `${this.orchestratorUrl}/nosql-services/${serviceId}/collections/${collectionName}/entity/${entityId}`
    );
  }

  async updateNoSQLEntity(
    serviceId: string,
    collectionName: string,
    entityId: string,
    updateData: any
  ): Promise<{
    service_id: string;
    collection_name: string;
    entity_id: string;
    result: any;
    timestamp: string;
  }> {
    return this.apiRequest<{
      service_id: string;
      collection_name: string;
      entity_id: string;
      result: any;
      timestamp: string;
    }>(
      `${this.orchestratorUrl}/nosql-services/${serviceId}/collections/${collectionName}/entity/${entityId}`,
      {
        method: "PUT",
        body: JSON.stringify(updateData),
      }
    );
  }

  async deleteNoSQLEntity(
    serviceId: string,
    collectionName: string,
    entityId: string
  ): Promise<{
    service_id: string;
    collection_name: string;
    entity_id: string;
    result: any;
    timestamp: string;
  }> {
    return this.apiRequest<{
      service_id: string;
      collection_name: string;
      entity_id: string;
      result: any;
      timestamp: string;
    }>(
      `${this.orchestratorUrl}/nosql-services/${serviceId}/collections/${collectionName}/entity/${entityId}`,
      {
        method: "DELETE",
      }
    );
  }

  async removeNoSQLService(serviceId: string): Promise<{ message: string }> {
    return this.apiRequest<{ message: string }>(
      `${this.orchestratorUrl}/nosql-services/${serviceId}`,
      {
        method: "DELETE",
      }
    );
  }

  // Queue service management
  async getQueueServices(): Promise<{
    queue_services: Array<{
      service_id: string;
      container_id: string;
      node_id: string;
      ip_address: string;
      port: number;
      status: string;
      is_healthy: boolean;
      created_at: string;
      service_url: string;
    }>;
  }> {
    return this.apiRequest<{
      queue_services: Array<{
        service_id: string;
        container_id: string;
        node_id: string;
        ip_address: string;
        port: number;
        status: string;
        is_healthy: boolean;
        created_at: string;
        service_url: string;
      }>;
    }>(`${this.orchestratorUrl}/queue-services`);
  }

  async getQueueService(serviceId: string): Promise<{
    service_id: string;
    container_id: string;
    node_id: string;
    ip_address: string;
    port: number;
    status: string;
    is_healthy: boolean;
    created_at: string;
    service_url: string;
  }> {
    return this.apiRequest<{
      service_id: string;
      container_id: string;
      node_id: string;
      ip_address: string;
      port: number;
      status: string;
      is_healthy: boolean;
      created_at: string;
      service_url: string;
    }>(`${this.orchestratorUrl}/queue-services/${serviceId}`);
  }

  async checkQueueServiceHealth(serviceId: string): Promise<{
    service_id: string;
    is_healthy: boolean;
    last_check: string;
    service_url: string;
  }> {
    return this.apiRequest<{
      service_id: string;
      is_healthy: boolean;
      last_check: string;
      service_url: string;
    }>(`${this.orchestratorUrl}/queue-services/${serviceId}/health`);
  }

  // Secrets service management
  async getSecretsServices(): Promise<{
    secrets_services: Array<{
      service_id: string;
      container_id: string;
      node_id: string;
      ip_address: string;
      port: number;
      status: string;
      is_healthy: boolean;
      created_at: string;
      service_url: string;
    }>;
  }> {
    return this.apiRequest<{
      secrets_services: Array<{
        service_id: string;
        container_id: string;
        node_id: string;
        ip_address: string;
        port: number;
        status: string;
        is_healthy: boolean;
        created_at: string;
        service_url: string;
      }>;
    }>(`${this.orchestratorUrl}/secrets-services`);
  }

  async getSecretsService(serviceId: string): Promise<{
    service_id: string;
    container_id: string;
    node_id: string;
    ip_address: string;
    port: number;
    status: string;
    is_healthy: boolean;
    created_at: string;
    service_url: string;
  }> {
    return this.apiRequest<{
      service_id: string;
      container_id: string;
      node_id: string;
      ip_address: string;
      port: number;
      status: string;
      is_healthy: boolean;
      created_at: string;
      service_url: string;
    }>(`${this.orchestratorUrl}/secrets-services/${serviceId}`);
  }

  async checkSecretsServiceHealth(serviceId: string): Promise<{
    service_id: string;
    is_healthy: boolean;
    last_check: string;
    service_url: string;
  }> {
    return this.apiRequest<{
      service_id: string;
      is_healthy: boolean;
      last_check: string;
      service_url: string;
    }>(`${this.orchestratorUrl}/secrets-services/${serviceId}/health`);
  }

  // Secrets operations
  async createSecret(serviceId: string, secretData: { name: string; value: string }): Promise<{
    service_id: string;
    secret_name: string;
    created: boolean;
    timestamp: string;
  }> {
    return this.apiRequest<{
      service_id: string;
      secret_name: string;
      created: boolean;
      timestamp: string;
    }>(`${this.orchestratorUrl}/secrets-services/${serviceId}/secrets`, {
      method: "POST",
      body: JSON.stringify(secretData),
    });
  }

  async getSecret(serviceId: string, secretName: string): Promise<{
    service_id: string;
    secret: {
      name: string;
      value: string;
      created_at: string;
      updated_at: string;
    } | null;
    timestamp: string;
  }> {
    return this.apiRequest<{
      service_id: string;
      secret: {
        name: string;
        value: string;
        created_at: string;
        updated_at: string;
      } | null;
      timestamp: string;
    }>(`${this.orchestratorUrl}/secrets-services/${serviceId}/secrets/${secretName}`);
  }

  async listSecrets(serviceId: string): Promise<{
    service_id: string;
    secrets: Array<{
      name: string;
      created_at: string;
      updated_at: string;
    }>;
    timestamp: string;
  }> {
    return this.apiRequest<{
      service_id: string;
      secrets: Array<{
        name: string;
        created_at: string;
        updated_at: string;
      }>;
      timestamp: string;
    }>(`${this.orchestratorUrl}/secrets-services/${serviceId}/secrets`);
  }

  async deleteSecret(serviceId: string, secretName: string): Promise<{
    service_id: string;
    secret_name: string;
    deleted: boolean;
    timestamp: string;
  }> {
    return this.apiRequest<{
      service_id: string;
      secret_name: string;
      deleted: boolean;
      timestamp: string;
    }>(`${this.orchestratorUrl}/secrets-services/${serviceId}/secrets/${secretName}`, {
      method: "DELETE",
    });
  }

  async removeSecretsService(serviceId: string): Promise<{ message: string }> {
    return this.apiRequest<{ message: string }>(
      `${this.orchestratorUrl}/secrets-services/${serviceId}`,
      {
        method: "DELETE",
      }
    );
  }

  // Queue operations
  async sendQueueMessage(serviceId: string, message: any): Promise<{
    service_id: string;
    message_id: string;
    sent: boolean;
    timestamp: string;
  }> {
    return this.apiRequest<{
      service_id: string;
      message_id: string;
      sent: boolean;
      timestamp: string;
    }>(`${this.orchestratorUrl}/queue-services/${serviceId}/messages`, {
      method: "POST",
      body: JSON.stringify(message),
    });
  }

  async receiveQueueMessage(serviceId: string): Promise<{
    service_id: string;
    message: {
      id: string;
      data: any;
      timestamp: string;
    } | null;
    timestamp: string;
  }> {
    return this.apiRequest<{
      service_id: string;
      message: {
        id: string;
        data: any;
        timestamp: string;
      } | null;
      timestamp: string;
    }>(`${this.orchestratorUrl}/queue-services/${serviceId}/messages`);
  }

  async listQueueMessages(serviceId: string): Promise<{
    service_id: string;
    messages: Array<{
      id: string;
      message: string;
      timestamp: string;
    }>;
    timestamp: string;
  }> {
    return this.apiRequest<{
      service_id: string;
      messages: Array<{
        id: string;
        message: string;
        timestamp: string;
      }>;
      timestamp: string;
    }>(`${this.orchestratorUrl}/queue-services/${serviceId}/messages`);
  }

  async deleteQueueMessage(serviceId: string, messageId: string): Promise<{
    service_id: string;
    message_id: string;
    deleted: boolean;
    timestamp: string;
  }> {
    return this.apiRequest<{
      service_id: string;
      message_id: string;
      deleted: boolean;
      timestamp: string;
    }>(`${this.orchestratorUrl}/queue-services/${serviceId}/messages/${messageId}`, {
      method: "DELETE",
    });
  }

  async removeQueueService(serviceId: string): Promise<{ message: string }> {
    return this.apiRequest<{ message: string }>(
      `${this.orchestratorUrl}/queue-services/${serviceId}`,
      {
        method: "DELETE",
      }
    );
  }

  async getTemplates(): Promise<{
    templates: Record<string, any>;
    available: string[];
  }> {
    return this.apiRequest<{
      templates: Record<string, any>;
      available: string[];
    }>(`${this.orchestratorUrl}/templates`);
  }

  // WebSocket connection for terminal
  createTerminalWebSocket(nodeId: string, containerId: string): WebSocket {
    const wsUrl = this.orchestratorUrl.replace("http", "ws");
    return new WebSocket(`${wsUrl}/ws/terminal/${nodeId}/${containerId}`);
  }

  // Error handling utilities
  isApiError(error: any): error is ApiError {
    return (
      error &&
      typeof error.detail === "string" &&
      typeof error.status_code === "number"
    );
  }

  // Retry mechanism for failed requests
  async retryRequest<T>(
    requestFn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error as Error;

        if (attempt === maxRetries) {
          throw lastError;
        }

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, delay * attempt));
      }
    }

    throw lastError!;
  }
}

// Create singleton instance
export const apiService = new ApiService();
