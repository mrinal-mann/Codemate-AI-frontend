/**
 * Type definitions for the RAG Chatbot application
 */

// ============================================================================
// AUTH TYPES
// ============================================================================

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  createdAt: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// ============================================================================
// DOCUMENT TYPES
// ============================================================================

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
}

export interface Document {
  id: string;
  googleDocId: string;
  title: string;
  type: "DOCS" | "SHEETS" | "SLIDES";
  isProcessed: boolean;
  chunkCount: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// CHAT TYPES
// ============================================================================

export interface DocumentSource {
  documentId: string;
  documentTitle: string;
  documentType: string;
  chunkText: string;
  similarity?: number;
}

export interface ChatMessage {
  id: string;
  role: "USER" | "ASSISTANT" | "SYSTEM";
  content: string;
  sources?: DocumentSource[];
  createdAt: string;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

export interface ChatHistory {
  session: ChatSession;
  messages: ChatMessage[];
}

// ============================================================================
// API TYPES
// ============================================================================

export interface ApiError {
  error: string;
  detail?: string;
  status_code: number;
}

export interface ChatQueryResponse {
  answer: string;
  session_id: string;
  sources: DocumentSource[];
}

export interface DocumentSelectResponse {
  message: string;
  documents: Document[];
}

export interface SummaryResponse {
  summary: string;
  document_ids: string[];
}
