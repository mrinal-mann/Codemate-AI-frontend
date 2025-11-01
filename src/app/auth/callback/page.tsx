"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "../../../store/authStore";
import { Loader2 } from "lucide-react";
import { ApiError } from "../../../types/index";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      const errorParam = searchParams.get("error");

      if (errorParam) {
        setError("Authentication cancelled or failed");
        setTimeout(() => router.push("/"), 3000);
        return;
      }

      if (!code) {
        setError("No authorization code received");
        setTimeout(() => router.push("/"), 3000);
        return;
      }

      try {
        await login(code);
        router.push("/dashboard");
      } catch (error) {
        const apiError = error as ApiError;
        setError(apiError.detail || apiError.error || "Authentication failed");
        setTimeout(() => router.push("/"), 3000);
      }
    };

    handleCallback();
  }, [searchParams, login, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-blue-50 to-purple-50">
      <div className="text-center space-y-4">
        {error ? (
          <>
            <div className="text-red-600 text-xl font-semibold">{error}</div>
            <p className="text-gray-600">Redirecting to home...</p>
          </>
        ) : (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
            <h2 className="text-2xl font-semibold text-gray-900">
              Authenticating...
            </h2>
            <p className="text-gray-600">Please wait while we sign you in</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-blue-50 to-purple-50">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
            <h2 className="text-2xl font-semibold text-gray-900">Loading...</h2>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
