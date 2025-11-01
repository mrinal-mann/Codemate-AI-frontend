/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { FileText, MessageSquare, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { apiClient } from "../lib/api";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, fetchUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      await fetchUser();
      setIsLoading(false);
    };
    checkAuth();
  }, [fetchUser]);

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleGoogleLogin = async () => {
    try {
      const { auth_url } = await apiClient.getGoogleAuthUrl();
      window.location.href = auth_url;
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">RAG Chatbot</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
              Chat with Your
              <span className="text-blue-600"> Google Docs</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Transform your Google Docs, Sheets, and Slides into an intelligent knowledge base. 
              Get instant answers powered by AI.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6"
              onClick={handleGoogleLogin}
            >
              <img 
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                alt="Google" 
                className="w-5 h-5 mr-2"
              />
              Sign in with Google
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mt-20">
            <Card className="border-2 hover:border-blue-500 transition-colors">
              <CardHeader>
                <FileText className="h-10 w-10 text-blue-600 mb-2" />
                <CardTitle>Multi-Format Support</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Works with Google Docs, Sheets, and Slides seamlessly
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-purple-500 transition-colors">
              <CardHeader>
                <MessageSquare className="h-10 w-10 text-purple-600 mb-2" />
                <CardTitle>AI-Powered Chat</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Ask questions in natural language, get instant answers with citations
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-green-500 transition-colors">
              <CardHeader>
                <Sparkles className="h-10 w-10 text-green-600 mb-2" />
                <CardTitle>Smart Summaries</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Generate summaries across multiple documents automatically
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Features List */}
          <div className="mt-16 max-w-2xl mx-auto">
            <h3 className="text-2xl font-semibold mb-6">Why Choose RAG Chatbot?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              {[
                "Secure OAuth 2.0 authentication",
                "Real-time document processing",
                "Context-aware responses",
                "Source citations included",
                "Multi-document queries",
                "Free to get started"
              ].map((feature, idx) => (
                <div key={idx} className="flex items-start space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-20 border-t">
        <div className="text-center text-gray-600">
          <p>© 2025 RAG Chatbot. Powered by Google Gemini AI.</p>
        </div>
      </footer>
    </div>
  );
}