"use client";

import { useEffect, useState } from "react";
import { useChatStore } from "../../store/chatStore";
import { useDocumentStore } from "../../store/documentStore";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Badge } from "../../components/ui/badge";
import { Send, FileText, Loader2, ExternalLink, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "../../lib/utils";

export default function DashboardPage() {
  const [question, setQuestion] = useState("");
  const { messages, isTyping, sendMessage, fetchSessions, sessions } =
    useChatStore();
  const { myDocuments, fetchMyDocuments } = useDocumentStore();

  useEffect(() => {
    fetchMyDocuments();
    fetchSessions();
  }, [fetchMyDocuments, fetchSessions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isTyping) return;

    try {
      await sendMessage(question);
      setQuestion("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const processedDocs = myDocuments.filter((doc) => doc.isProcessed);
  const hasDocuments = processedDocs.length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Chat Area */}
      <div className="lg:col-span-2 space-y-6">
        {/* Welcome Card */}
        {messages.length === 0 && (
          <Card className="bg-linear-to-br from-blue-50 to-purple-50 border-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="h-6 w-6 text-blue-600" />
                <span>Welcome to RAG Chatbot!</span>
              </CardTitle>
              <CardDescription className="text-base">
                {hasDocuments ? (
                  <>
                    You have <strong>{processedDocs.length} document(s)</strong>{" "}
                    ready. Start asking questions about your Google Docs,
                    Sheets, and Slides!
                  </>
                ) : (
                  <>
                    Get started by adding documents from your Google Drive.{" "}
                    <Link
                      href="/dashboard/documents"
                      className="text-blue-600 hover:underline"
                    >
                      Add documents →
                    </Link>
                  </>
                )}
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Messages */}
        <Card
          className="flex flex-col"
          style={{ height: "calc(100vh - 350px)" }}
        >
          <CardHeader className="border-b">
            <CardTitle>Chat</CardTitle>
          </CardHeader>
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    message.role === "USER" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "ASSISTANT" && (
                    <div className="shrink-0 h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "rounded-lg px-4 py-3 max-w-[80%]",
                      message.role === "USER"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-900"
                    )}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-300 space-y-2">
                        <div className="text-xs font-semibold text-gray-600">
                          Sources:
                        </div>
                        {message.sources.map((source, idx) => (
                          <div
                            key={idx}
                            className="text-xs bg-white rounded p-2 shadow-sm"
                          >
                            <div className="font-medium text-gray-900">
                              {source.documentTitle}
                            </div>
                            <div className="text-gray-600 mt-1 line-clamp-2">
                              {source.chunkText}
                            </div>
                            {source.similarity && (
                              <Badge variant="secondary" className="mt-1">
                                {(source.similarity * 100).toFixed(0)}% match
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {message.role === "USER" && (
                    <div className="shrink-0 h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold">
                      U
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-3 justify-start">
                  <div className="shrink-0 h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-gray-100 rounded-lg px-4 py-3">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={
                  hasDocuments
                    ? "Ask a question about your documents..."
                    : "Add documents first to start chatting..."
                }
                disabled={isTyping || !hasDocuments}
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={isTyping || !hasDocuments || !question.trim()}
              >
                {isTyping ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Documents Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>My Documents</span>
              <Link href="/dashboard/documents">
                <Button variant="ghost" size="sm">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {processedDocs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No documents yet</p>
                <Link href="/dashboard/documents">
                  <Button variant="link" size="sm" className="mt-2">
                    Add documents
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {processedDocs.slice(0, 5).map((doc) => (
                  <div
                    key={doc.id}
                    className="p-2 rounded hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {doc.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {doc.chunkCount} chunks • {doc.type}
                        </div>
                      </div>
                      {doc.isProcessed && (
                        <Badge variant="secondary" className="shrink-0">
                          Ready
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
                {processedDocs.length > 5 && (
                  <div className="text-center pt-2">
                    <Link href="/dashboard/documents">
                      <Button variant="link" size="sm">
                        View all {processedDocs.length} documents
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chat History */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Conversations</CardTitle>
          </CardHeader>
          <CardContent>
            {sessions.length === 0 ? (
              <div className="text-center py-4 text-gray-500 text-sm">
                No conversations yet
              </div>
            ) : (
              <div className="space-y-2">
                {sessions.slice(0, 5).map((session) => (
                  <button
                    key={session.id}
                    className="w-full text-left p-2 rounded hover:bg-gray-50 transition-colors"
                    onClick={() => {
                      // Load session history
                    }}
                  >
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {session.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      {session.messageCount} messages
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
