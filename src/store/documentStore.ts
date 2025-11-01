import { create } from "zustand";
import { ApiError, Document, GoogleDriveFile } from "../types/index";
import { apiClient } from "../lib/api";

interface DocumentState {
  driveFiles: GoogleDriveFile[];
  myDocuments: Document[];
  selectedFiles: string[];
  isLoading: boolean;
  error: string | null;
  isProcessing: boolean;
  pollingInterval: NodeJS.Timeout | null;

  // Actions
  fetchDriveFiles: () => Promise<void>;
  fetchMyDocuments: () => Promise<void>;
  selectFile: (fileId: string) => void;
  deselectFile: (fileId: string) => void;
  clearSelection: () => void;
  submitDocuments: () => Promise<void>;
  deleteDocument: (documentId: string) => Promise<void>;
  refreshDocuments: () => Promise<void>;
  startPolling: () => void;
  stopPolling: () => void;
  clearError: () => void;
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  driveFiles: [],
  myDocuments: [],
  selectedFiles: [],
  isLoading: false,
  error: null,
  isProcessing: false,
  pollingInterval: null,

  fetchDriveFiles: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.listGoogleDriveFiles();
      set({ driveFiles: response.files, isLoading: false });
    } catch (error) {
      const apiError = error as ApiError;
      set({
        error: apiError.detail || apiError.error || "Failed to fetch files",
        isLoading: false,
      });
    }
  },

  fetchMyDocuments: async () => {
    set({ isLoading: true, error: null });
    try {
      const documents = await apiClient.getMyDocuments();
      const hasProcessing = documents.some((doc) => !doc.isProcessed);
      
      set({ 
        myDocuments: documents, 
        isLoading: false,
        isProcessing: hasProcessing 
      });

      // Start polling if there are processing documents
      if (hasProcessing && !get().pollingInterval) {
        get().startPolling();
      } else if (!hasProcessing && get().pollingInterval) {
        get().stopPolling();
      }
    } catch (error) {
      const apiError = error as ApiError;
      set({
        error: apiError.detail || apiError.error || "Failed to fetch documents",
        isLoading: false,
      });
    }
  },

  selectFile: (fileId: string) => {
    const { selectedFiles } = get();
    if (!selectedFiles.includes(fileId)) {
      set({ selectedFiles: [...selectedFiles, fileId] });
    }
  },

  deselectFile: (fileId: string) => {
    const { selectedFiles } = get();
    set({ selectedFiles: selectedFiles.filter((id) => id !== fileId) });
  },

  clearSelection: () => set({ selectedFiles: [] }),

  submitDocuments: async () => {
    const { selectedFiles } = get();
    if (selectedFiles.length === 0) return;

    set({ isLoading: true, error: null });
    try {
      await apiClient.selectDocuments(selectedFiles);
      set({ selectedFiles: [], isLoading: false });
      // Refresh documents after submission
      await get().fetchMyDocuments();
    } catch (error) {
      const apiError = error as ApiError;
      set({
        error:
          apiError.detail || apiError.error || "Failed to submit documents",
        isLoading: false,
      });
      throw error;
    }
  },

  deleteDocument: async (documentId: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.deleteDocument(documentId);
      const { myDocuments } = get();
      set({
        myDocuments: myDocuments.filter((doc) => doc.id !== documentId),
        isLoading: false,
      });
    } catch (error) {
      const apiError = error as ApiError;
      set({
        error: apiError.detail || apiError.error || "Failed to delete document",
        isLoading: false,
      });
    }
  },

  refreshDocuments: async () => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.refreshDocuments();
      set({ isLoading: false, isProcessing: true });
      // Fetch updated documents and start polling
      await get().fetchMyDocuments();
    } catch (error) {
      const apiError = error as ApiError;
      set({
        error:
          apiError.detail || apiError.error || "Failed to refresh documents",
        isLoading: false,
      });
    }
  },

  startPolling: () => {
    const { pollingInterval } = get();
    if (pollingInterval) return; // Already polling

    const interval = setInterval(() => {
      const { isProcessing } = get();
      if (isProcessing) {
        get().fetchMyDocuments();
      }
    }, 5000); // Poll every 5 seconds

    set({ pollingInterval: interval });
  },

  stopPolling: () => {
    const { pollingInterval } = get();
    if (pollingInterval) {
      clearInterval(pollingInterval);
      set({ pollingInterval: null, isProcessing: false });
    }
  },

  clearError: () => set({ error: null }),
}));
