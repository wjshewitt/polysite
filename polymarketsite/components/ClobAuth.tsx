"use client";

import { useState } from "react";
import { usePolymarketStore } from "@/store/usePolymarketStore";
import { clobService } from "@/services/clob";
import { LogIn, LogOut, Key, Wallet } from "lucide-react";

export function ClobAuth() {
  const clobAuth = usePolymarketStore((state) => state.clobAuth);
  const setClobAuth = usePolymarketStore((state) => state.setClobAuth);
  const clearClobData = usePolymarketStore((state) => state.clearClobData);

  const [showAuthForm, setShowAuthForm] = useState(false);
  const [authMethod, setAuthMethod] = useState<"privateKey" | "apiKey">("privateKey");
  const [privateKey, setPrivateKey] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [apiPassphrase, setApiPassphrase] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuthWithPrivateKey = async () => {
    if (!privateKey) {
      setError("Private key is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call backend API to derive credentials securely
      const response = await fetch("/api/clob/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "derive",
          privateKey,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to authenticate");
      }

      // Initialize CLOB client with derived credentials
      const authResult = await clobService.authenticate({
        chainId: 137,
        apiKey: data.credentials.apiKey,
        apiSecret: data.credentials.apiSecret,
        apiPassphrase: data.credentials.apiPassphrase,
      });

      if (authResult.isAuthenticated) {
        setClobAuth({
          isAuthenticated: true,
          address: data.address,
          apiKey: data.credentials.apiKey,
          error: null,
        });
        setShowAuthForm(false);
        setPrivateKey("");
      } else {
        setError(authResult.error || "Authentication failed");
      }
    } catch (err) {
      console.error("Authentication error:", err);
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleAuthWithApiKey = async () => {
    if (!apiKey || !apiSecret || !apiPassphrase) {
      setError("All API credential fields are required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Validate credentials through backend
      const response = await fetch("/api/clob/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "validate",
          apiKey,
          apiSecret,
          apiPassphrase,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.valid) {
        throw new Error(data.error || "Invalid credentials");
      }

      // Initialize CLOB client with provided credentials
      const authResult = await clobService.authenticate({
        chainId: 137,
        apiKey,
        apiSecret,
        apiPassphrase,
      });

      if (authResult.isAuthenticated) {
        setClobAuth({
          isAuthenticated: true,
          address: authResult.address,
          apiKey: apiKey,
          error: null,
        });
        setShowAuthForm(false);
        setApiKey("");
        setApiSecret("");
        setApiPassphrase("");
      } else {
        setError(authResult.error || "Authentication failed");
      }
    } catch (err) {
      console.error("Authentication error:", err);
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    clobService.disconnect();
    clearClobData();
    setShowAuthForm(false);
  };

  if (clobAuth.isAuthenticated) {
    return (
      <div className="bg-card border border-buy px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-buy rounded-full animate-pulse" />
            <div>
              <div className="font-mono text-xs text-buy font-semibold">
                AUTHENTICATED
              </div>
              {clobAuth.address && (
                <div className="font-mono text-xs text-muted-foreground">
                  {clobAuth.address.slice(0, 6)}...{clobAuth.address.slice(-4)}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={handleDisconnect}
            className="flex items-center gap-2 px-3 py-1 font-mono text-xs bg-sell text-destructive-foreground hover:bg-sell/90 transition-colors"
          >
            <LogOut className="w-3 h-3" />
            DISCONNECT
          </button>
        </div>
      </div>
    );
  }

  if (!showAuthForm) {
    return (
      <div className="bg-card border border-border px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-muted-foreground rounded-full" />
            <div className="font-mono text-xs text-muted-foreground">
              Read-only mode • Connect to trade
            </div>
          </div>
          <button
            onClick={() => setShowAuthForm(true)}
            className="flex items-center gap-2 px-3 py-1 font-mono text-xs bg-primary text-primary-foreground hover:bg-primary/80 transition-colors"
          >
            <LogIn className="w-3 h-3" />
            CONNECT
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-neutral p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-mono text-sm font-bold text-foreground">
          CONNECT TO CLOB
        </h3>
        <button
          onClick={() => {
            setShowAuthForm(false);
            setError(null);
          }}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Auth Method Selector */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setAuthMethod("privateKey")}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 font-mono text-xs border transition-colors ${
            authMethod === "privateKey"
              ? "border-neutral text-neutral bg-neutral/10"
              : "border-border text-muted-foreground hover:border-muted-foreground"
          }`}
        >
          <Wallet className="w-4 h-4" />
          PRIVATE KEY
        </button>
        <button
          onClick={() => setAuthMethod("apiKey")}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 font-mono text-xs border transition-colors ${
            authMethod === "apiKey"
              ? "border-neutral text-neutral bg-neutral/10"
              : "border-border text-muted-foreground hover:border-muted-foreground"
          }`}
        >
          <Key className="w-4 h-4" />
          API KEY
        </button>
      </div>

      {/* Private Key Form */}
      {authMethod === "privateKey" && (
        <div className="space-y-3">
          <div>
            <label className="block font-mono text-xs text-muted-foreground mb-2">
              Private Key
            </label>
            <input
              type="password"
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              placeholder="0x..."
              className="w-full px-3 py-2 bg-background border border-border text-foreground font-mono text-xs focus:border-neutral focus:outline-none"
            />
          </div>
          <div className="bg-sell/10 border border-sell px-3 py-2">
            <p className="font-mono text-xs text-sell">
              ⚠️ Never share your private key. It will be processed securely on the server.
            </p>
          </div>
          <button
            onClick={handleAuthWithPrivateKey}
            disabled={loading || !privateKey}
            className="w-full px-4 py-2 font-mono text-xs bg-primary text-primary-foreground hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "AUTHENTICATING..." : "CONNECT WALLET"}
          </button>
        </div>
      )}

      {/* API Key Form */}
      {authMethod === "apiKey" && (
        <div className="space-y-3">
          <div>
            <label className="block font-mono text-xs text-muted-foreground mb-2">
              API Key
            </label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Your API key"
              className="w-full px-3 py-2 bg-background border border-border text-foreground font-mono text-xs focus:border-neutral focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-mono text-xs text-muted-foreground mb-2">
              API Secret
            </label>
            <input
              type="password"
              value={apiSecret}
              onChange={(e) => setApiSecret(e.target.value)}
              placeholder="Your API secret"
              className="w-full px-3 py-2 bg-background border border-border text-foreground font-mono text-xs focus:border-neutral focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-mono text-xs text-muted-foreground mb-2">
              API Passphrase
            </label>
            <input
              type="password"
              value={apiPassphrase}
              onChange={(e) => setApiPassphrase(e.target.value)}
              placeholder="Your API passphrase"
              className="w-full px-3 py-2 bg-background border border-border text-foreground font-mono text-xs focus:border-neutral focus:outline-none"
            />
          </div>
          <button
            onClick={handleAuthWithApiKey}
            disabled={loading || !apiKey || !apiSecret || !apiPassphrase}
            className="w-full px-4 py-2 font-mono text-xs bg-primary text-primary-foreground hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "AUTHENTICATING..." : "CONNECT WITH API KEY"}
          </button>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-3 px-3 py-2 bg-sell/10 border border-sell">
          <p className="font-mono text-xs text-sell">{error}</p>
        </div>
      )}

      {/* Info */}
      <div className="mt-4 pt-4 border-t border-border">
        <p className="font-mono text-xs text-muted-foreground leading-relaxed">
          Authentication is required to view and manage your orders. Your credentials are processed securely and never stored in the browser.
        </p>
      </div>
    </div>
  );
}
