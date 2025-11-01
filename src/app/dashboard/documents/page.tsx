"use client";

import { useEffect, useState } from "react";
import { useDocumentStore } from "../../../store/documentStore";
import { ApiError } from "../../../types";
import { useToast } from "../../../hooks/use-toast";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Badge } from "../../../components/ui/badge";
import { Checkbox } from "../../../components/ui/checkbox";
import { ScrollArea } from "../../../components/ui/scroll-area";
import {
  FileText,
  Sheet,
  Presentation,
  Loader2,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Clock,
  Search,
  Plus,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../components/ui/alert-dialog";

const MIME_TYPE_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  "application/vnd.google-apps.document": FileText,
  "application/vnd.google-apps.spreadsheet": Sheet,
  "application/vnd.google-apps.presentation": Presentation,
};

const MIME_TYPE_LABELS: Record<string, string> = {
  "application/vnd.google-apps.document": "Doc",
  "application/vnd.google-apps.spreadsheet": "Sheet",
  "application/vnd.google-apps.presentation": "Slides",
};

export default function DocumentsPage() {
  const { toast } = useToast();
  const {
    driveFiles,
    myDocuments,
    selectedFiles,
    isLoading,
    fetchDriveFiles,
    fetchMyDocuments,
    selectFile,
    deselectFile,
    submitDocuments,
    deleteDocument,
    refreshDocuments,
  } = useDocumentStore();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchMyDocuments();
  }, [fetchMyDocuments]);

  const handleOpenAddDialog = async () => {
    setShowAddDialog(true);
    if (driveFiles.length === 0) {
      await fetchDriveFiles();
    }
  };

  const handleSubmitDocuments = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "No documents selected",
        description: "Please select at least one document",
        variant: "destructive",
      });
      return;
    }

    try {
      await submitDocuments();
      setShowAddDialog(false);
      toast({
        title: "Documents submitted",
        description: `Processing ${selectedFiles.length} document(s) in the background`,
      });

      // Refresh after 5 seconds to show processing status
      setTimeout(() => fetchMyDocuments(), 5000);
    } catch (error) {
      const apiError = error as ApiError;
      toast({
        title: "Failed to submit documents",
        description: apiError.detail || apiError.error || "An error occurred",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (documentId: string) => {
    try {
      await deleteDocument(documentId);
      toast({
        title: "Document deleted",
        description: "The document has been removed",
      });
      setDeleteConfirm(null);
    } catch (error) {
      const apiError = error as ApiError;
      toast({
        title: "Failed to delete document",
        description: apiError.detail || apiError.error || "An error occurred",
        variant: "destructive",
      });
    }
  };

  const handleRefresh = async () => {
    try {
      await refreshDocuments();
      toast({
        title: "Refresh started",
        description: "Your documents will be updated shortly",
      });
    } catch (error) {
      const apiError = error as ApiError;
      toast({
        title: "Refresh failed",
        description: apiError.detail || apiError.error || "An error occurred",
        variant: "destructive",
      });
    }
  };

  const filteredDriveFiles = driveFiles.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const processingDocs = myDocuments.filter((doc) => !doc.isProcessed);
  const readyDocs = myDocuments.filter((doc) => doc.isProcessed);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600 mt-1">
            Manage your Google Docs, Sheets, and Slides
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button onClick={handleOpenAddDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Add Documents
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Documents</CardDescription>
            <CardTitle className="text-3xl">{myDocuments.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Ready to Chat</CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {readyDocs.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Processing</CardDescription>
            <CardTitle className="text-3xl text-orange-600">
              {processingDocs.length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Processing Documents */}
      {processingDocs.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-900">
              <Clock className="h-5 w-5 mr-2 animate-pulse" />
              Processing Documents
            </CardTitle>
            <CardDescription className="text-orange-700">
              These documents are being processed and will be ready soon
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {processingDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-orange-600" />
                    <div>
                      <div className="font-medium text-gray-900">
                        {doc.title}
                      </div>
                      <div className="text-sm text-gray-500">{doc.type}</div>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-orange-100 text-orange-700"
                  >
                    Processing...
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ready Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle2 className="h-5 w-5 mr-2 text-green-600" />
            Ready Documents
          </CardTitle>
          <CardDescription>
            These documents are ready for chat and questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {readyDocs.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No documents yet
              </h3>
              <p className="text-gray-600 mb-4">
                Add documents from your Google Drive to get started
              </p>
              <Button onClick={handleOpenAddDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Document
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {readyDocs.map((doc) => {
                const Icon =
                  MIME_TYPE_ICONS["application/vnd.google-apps.document"];
                return (
                  <Card
                    key={doc.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <Icon className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base truncate">
                              {doc.title}
                            </CardTitle>
                            <CardDescription className="mt-1">
                              {doc.type} • {doc.chunkCount} chunks
                            </CardDescription>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirm(doc.id)}
                          className="shrink-0"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>
                          Updated {new Date(doc.updatedAt).toLocaleDateString()}
                        </span>
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-700"
                        >
                          Ready
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Documents Dialog */}
      <AlertDialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <AlertDialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
          <AlertDialogHeader>
            <AlertDialogTitle>Add Documents from Google Drive</AlertDialogTitle>
            <AlertDialogDescription>
              Select documents to add to your knowledge base. Selected:{" "}
              {selectedFiles.length}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Search */}
            <div className="pb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* File List */}
            <ScrollArea className="flex-1 border rounded-lg">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : filteredDriveFiles.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>No documents found</p>
                </div>
              ) : (
                <div className="p-4 space-y-2">
                  {filteredDriveFiles.map((file) => {
                    const Icon = MIME_TYPE_ICONS[file.mimeType] || FileText;
                    const isSelected = selectedFiles.includes(file.id);
                    const isAlreadyAdded = myDocuments.some(
                      (doc) => doc.googleDocId === file.id
                    );

                    return (
                      <div
                        key={file.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                          isSelected
                            ? "bg-blue-50 border-blue-300"
                            : "hover:bg-gray-50"
                        } ${isAlreadyAdded ? "opacity-50" : ""}`}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => {
                            if (isAlreadyAdded) return;
                            if (checked) {
                              selectFile(file.id);
                            } else {
                              deselectFile(file.id);
                            }
                          }}
                          disabled={isAlreadyAdded}
                        />
                        <Icon className="h-5 w-5 text-blue-600 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {file.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {MIME_TYPE_LABELS[file.mimeType] || "Document"} •{" "}
                            {new Date(file.modifiedTime).toLocaleDateString()}
                          </div>
                        </div>
                        {isAlreadyAdded && (
                          <Badge variant="secondary">Already added</Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>

          <AlertDialogFooter className="pt-4">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmitDocuments}
              disabled={selectedFiles.length === 0 || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Add {selectedFiles.length > 0 && `(${selectedFiles.length})`}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the document and all its embeddings. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
