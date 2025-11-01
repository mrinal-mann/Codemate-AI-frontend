/**
 * API client for backend communication
 */

import type {
  User,
  AuthResponse,
  GoogleDriveFile,
  Document,
  DocumentSelectResponse,
  ChatQueryResponse,
  ChatSession,
  ChatHistory,
  SummaryResponse,
} from "../types/index";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", token);
    }
  }

  getToken(): string | null {
    if (!this.token && typeof window !== "undefined") {
      this.token = localStorage.getItem("access_token");
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: "An error occurred",
        status_code: response.status,
      }));
      throw error;
    }

    return response.json();
  }

  // ============================================================================
  // AUTH ENDPOINTS
  // ============================================================================

  async getGoogleAuthUrl(): Promise<{ auth_url: string }> {
    return this.request("/auth/google/login");
  }

  async handleGoogleCallback(code: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>("/auth/google/callback", {
      method: "POST",
      body: JSON.stringify({ code }),
    });

    if (response.access_token) {
      this.setToken(response.access_token);
    }

    return response;
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>("/auth/me");
  }

  async logout(): Promise<void> {
    await this.request("/auth/logout", { method: "POST" });
    this.clearToken();
  }

  // ============================================================================
  // DOCUMENT ENDPOINTS
  // ============================================================================

  async listGoogleDriveFiles(): Promise<{ files: GoogleDriveFile[] }> {
    return this.request<{ files: GoogleDriveFile[] }>("/documents/list");
  }

  async selectDocuments(
    documentIds: string[]
  ): Promise<DocumentSelectResponse> {
    return this.request<DocumentSelectResponse>("/documents/select", {
      method: "POST",
      body: JSON.stringify({ document_ids: documentIds }),
    });
  }

  async getMyDocuments(): Promise<Document[]> {
    return this.request<Document[]>("/documents/my-documents");
  }

  async deleteDocument(documentId: string): Promise<void> {
    await this.request(`/documents/${documentId}`, {
      method: "DELETE",
    });
  }

  async refreshDocuments(): Promise<{ message: string }> {
    return this.request<{ message: string }>("/documents/refresh", {
      method: "POST",
    });
  }

  // ============================================================================
  // CHAT ENDPOINTS
  // ============================================================================

  async queryChatbot(
    question: string,
    sessionId?: string
  ): Promise<ChatQueryResponse> {
    return this.request<ChatQueryResponse>("/chat/query", {
      method: "POST",
      body: JSON.stringify({
        question,
        session_id: sessionId,
        stream: false,
      }),
    });
  }

  async getChatSessions(): Promise<ChatSession[]> {
    return this.request<ChatSession[]>("/chat/sessions");
  }

  async getChatHistory(sessionId: string): Promise<ChatHistory> {
    return this.request<ChatHistory>(`/chat/sessions/${sessionId}`);
  }

  async deleteChatSession(sessionId: string): Promise<void> {
    await this.request(`/chat/sessions/${sessionId}`, {
      method: "DELETE",
    });
  }

  async summarizeDocuments(
    documentIds: string[],
    summaryType: "concise" | "detailed" | "bullet_points" = "concise"
  ): Promise<SummaryResponse> {
    return this.request<SummaryResponse>("/chat/summarize", {
      method: "POST",
      body: JSON.stringify({
        document_ids: documentIds,
        summary_type: summaryType,
      }),
    });
  }
}

export const apiClient = new ApiClient(API_URL);
