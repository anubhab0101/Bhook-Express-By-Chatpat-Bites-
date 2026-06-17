import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ChefHat } from "lucide-react";
import { signInWithCustomToken } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";

export default function LoginPage() {
  const { user, signInWithGoogle, signInWithEmail } = useAuth();
  const { settings } = useSettings();
  const [, navigate] = useLocation();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) navigate("/menu");
  }, [user, navigate]);

  function readableAuthError(err: unknown, fallback: string) {
    const message = err instanceof Error ? err.message : String(err || "");
    if (message.includes("Cloud Firestore API") || message.includes("firestore.googleapis.com")) {
      return "Database is not ready. Please ask the restaurant to finish setup, then try again.";
    }
    return message || fallback;
  }

  async function sendOtp() {
    setError("");
    if (name.trim().length < 2) { setError("Enter your name"); return; }
    if (phone.length < 10) { setError("Enter a valid 10-digit phone number"); return; }
    setLoading(true);
    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      if (!response.ok) throw new Error((await response.json()).error || "Failed to send OTP");
      setStep("otp");
    } catch (e: any) {
      setError(readableAuthError(e, "Failed to send code"));
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp() {
    setError("");
    if (otp.length < 7) { setError("Enter the 7-digit code"); return; }
    setLoading(true);
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });
      if (!response.ok) throw new Error((await response.json()).error || "Invalid OTP");
      const data = await response.json();
      await signInWithCustomToken(auth, data.customToken);
    } catch (e: any) {
      setError(readableAuthError(e, "Invalid code. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  async function googleLogin() {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (e: any) {
      setError(readableAuthError(e, "Google login failed"));
    } finally {
      setLoading(false);
    }
  }

  async function emailLogin() {
    setError("");
    if (!email || password.length < 6) {
      setError("Enter email and at least 6 character password");
      return;
    }
    setLoading(true);
    try {
      await signInWithEmail(email, password, name);
    } catch (e: any) {
      setError(readableAuthError(e, "Email login failed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-card border border-border rounded-3xl shadow-xl p-8"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <ChefHat className="w-7 h-7 text-amber-500" />
          </div>
          <h1 className="text-2xl font-extrabold text-foreground">{settings.name || "Restaurant"}</h1>
          <p className="text-muted-foreground text-sm mt-1">Sign in before ordering</p>
        </div>

        {error && <div className="bg-destructive/10 text-destructive text-sm px-3 py-2 rounded-lg mb-4">{error}</div>}

        {step === "phone" ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">Full Name</label>
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">Phone Number</label>
              <div className="flex">
                <span className="flex items-center px-3 bg-muted border border-r-0 border-border rounded-l-lg text-sm text-muted-foreground">+91</span>
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="flex-1 border border-border rounded-r-lg px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <button
              onClick={sendOtp}
              disabled={loading || phone.length < 10 || name.trim().length < 2}
              className="w-full bg-amber-500 text-white py-3 rounded-xl font-bold hover:bg-amber-600 disabled:opacity-60 transition-colors"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
            <div className="relative flex items-center gap-3 my-2">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <button
              onClick={googleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 border border-border py-3 rounded-xl font-semibold text-foreground hover:bg-muted transition-colors disabled:opacity-60"
            >
              Continue with Google
            </button>

            <div className="space-y-3 pt-2">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={emailLogin}
                disabled={loading || !email || password.length < 6}
                className="w-full border border-border py-3 rounded-xl font-semibold text-foreground hover:bg-muted transition-colors disabled:opacity-60"
              >
                Continue with Email
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">Enter Code</label>
              <p className="text-xs text-muted-foreground mb-3">Sent to +91{phone}</p>
              <input
                type="text"
                placeholder="0000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 7))}
                className="w-full text-center text-2xl font-bold tracking-[0.32em] border border-border rounded-xl px-3 py-3 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button
              onClick={verifyOtp}
              disabled={loading || otp.length < 7}
              className="w-full bg-amber-500 text-white py-3 rounded-xl font-bold hover:bg-amber-600 disabled:opacity-60 transition-colors"
            >
              {loading ? "Verifying..." : "Verify Code"}
            </button>
            <button onClick={() => { setStep("phone"); setOtp(""); }} className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors">
              Change phone number
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
