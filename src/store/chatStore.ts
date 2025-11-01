import { create } from "zustand";
import { ApiError, ChatMessage, ChatSession } from "../types/index";
import { apiClient } from "../lib/api";

interface ChatState {
  sessions: ChatSession[];
  currentSessionId: string | null;
  messages: ChatMessage[];
  isLoading: boolean;
  isTyping: boolean;
  error: string | null;

  // Actions
  fetchSessions: () => Promise<void>;
  fetchHistory: (sessionId: string) => Promise<void>;
  sendMessage: (question: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  setCurrentSession: (sessionId: string | null) => void;
  clearMessages: () => void;
  clearError: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  sessions: [],
  currentSessionId: null,
  messages: [],
  isLoading: false,
  isTyping: false,
  error: null,

  fetchSessions: async () => {
    set({ isLoading: true, error: null });
    try {
      const sessions = await apiClient.getChatSessions();
      set({ sessions, isLoading: false });
    } catch (error) {
      const apiError = error as ApiError;
      set({
        error: apiError.detail || apiError.error || "Failed to fetch sessions",
        isLoading: false,
      });
    }
  },

  fetchHistory: async (sessionId: string) => {
    set({ isLoading: true, error: null });
    try {
      const history = await apiClient.getChatHistory(sessionId);
      set({
        messages: history.messages,
        currentSessionId: sessionId,
        isLoading: false,
      });
    } catch (error) {
      const apiError = error as ApiError;
      set({
        error: apiError.detail || apiError.error || "Failed to fetch history",
        isLoading: false,
      });
    }
  },

  sendMessage: async (question: string) => {
    const { currentSessionId, messages } = get();

    // Add user message immediately
    const userMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: "USER",
      content: question,
      createdAt: new Date().toISOString(),
    };

    set({
      messages: [...messages, userMessage],
      isTyping: true,
      error: null,
    });

    try {
      const response = await apiClient.queryChatbot(
        question,
        currentSessionId || undefined
      );

      // Add assistant message
      const assistantMessage: ChatMessage = {
        id: `temp-${Date.now() + 1}`,
        role: "ASSISTANT",
        content: response.answer,
        sources: response.sources,
        createdAt: new Date().toISOString(),
      };

      set({
        messages: [...get().messages, assistantMessage],
        currentSessionId: response.session_id,
        isTyping: false,
      });

      // Refresh sessions
      await get().fetchSessions();
    } catch (error) {
      const apiError = error as ApiError;
      set({
        error: apiError.detail || apiError.error || "Failed to send message",
        isTyping: false,
      });
      throw error;
    }
  },

  deleteSession: async (sessionId: string) => {
    try {
      await apiClient.deleteChatSession(sessionId);
      const { sessions, currentSessionId } = get();

      set({
        sessions: sessions.filter((s) => s.id !== sessionId),
        ...(currentSessionId === sessionId && {
          currentSessionId: null,
          messages: [],
        }),
      });
    } catch (error) {
      const apiError = error as ApiError;
      set({
        error: apiError.detail || apiError.error || "Failed to delete session",
        isLoading: false,
      });
    }
  },

  setCurrentSession: (sessionId: string | null) => {
    set({ currentSessionId: sessionId });
    if (sessionId) {
      get().fetchHistory(sessionId);
    } else {
      set({ messages: [] });
    }
  },

  clearMessages: () => set({ messages: [], currentSessionId: null }),

  clearError: () => set({ error: null }),
}));
