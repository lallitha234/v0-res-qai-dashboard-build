"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Shield, Phone, ArrowRight, Lock, RefreshCw, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

type AuthStep = "phone" | "otp" | "success"

export default function LoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<AuthStep>("phone")
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer <= 0) return
    const interval = setInterval(() => setResendTimer((t) => t - 1), 1000)
    return () => clearInterval(interval)
  }, [resendTimer])

  const handlePhoneSubmit = useCallback(() => {
    setError("")
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError("Please enter a valid 10-digit Indian phone number")
      return
    }
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setStep("otp")
      setResendTimer(30)
    }, 1200)
  }, [phone])

  const handleOtpChange = useCallback(
    (index: number, value: string) => {
      if (value.length > 1) return
      const newOtp = [...otp]
      newOtp[index] = value
      setOtp(newOtp)
      setError("")

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`)
        nextInput?.focus()
      }
    },
    [otp]
  )

  const handleOtpKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent) => {
      if (e.key === "Backspace" && !otp[index] && index > 0) {
        const prevInput = document.getElementById(`otp-${index - 1}`)
        prevInput?.focus()
      }
    },
    [otp]
  )

  const handleOtpSubmit = useCallback(() => {
    setError("")
    const otpStr = otp.join("")
    if (otpStr.length !== 6) {
      setError("Please enter the complete 6-digit OTP")
      return
    }
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      if (otpStr === "123456" || otpStr.length === 6) {
        setStep("success")
        setTimeout(() => router.push("/dashboard"), 1500)
      } else {
        setError("Invalid OTP. Please try again.")
      }
    }, 1500)
  }, [otp, router])

  const handleResend = useCallback(() => {
    if (resendTimer > 0) return
    setResendTimer(30)
    setOtp(["", "", "", "", "", ""])
    setError("")
  }, [resendTimer])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Background grid */}
      <div className="fixed inset-0 opacity-[0.03]">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="auth-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#auth-grid)" />
        </svg>
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/20">
            <Shield className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">ResQAI</h1>
            <p className="text-xs text-muted-foreground">Disaster Response AI</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8">
          {/* Phone Step */}
          {step === "phone" && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-lg font-semibold text-foreground">Welcome Back</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Enter your phone number to access the command center
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="phone" className="block text-xs font-medium text-muted-foreground mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <span className="absolute left-9 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      +91
                    </span>
                    <input
                      id="phone"
                      type="tel"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value.replace(/\D/g, ""))
                        setError("")
                      }}
                      onKeyDown={(e) => e.key === "Enter" && handlePhoneSubmit()}
                      placeholder="9876543210"
                      className="w-full pl-[4.5rem] pr-4 py-3 rounded-xl bg-secondary text-sm text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground"
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-xs text-destructive font-medium">{error}</p>
                )}

                <button
                  onClick={handlePhoneSubmit}
                  disabled={loading || phone.length < 10}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all",
                    loading || phone.length < 10
                      ? "bg-primary/30 text-primary/60 cursor-not-allowed"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Send OTP <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* OTP Step */}
          {step === "otp" && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-lg font-semibold text-foreground">Verify OTP</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Enter the 6-digit code sent to +91 {phone}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value.replace(/\D/g, ""))}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className={cn(
                        "w-12 h-14 text-center text-lg font-bold rounded-xl border bg-secondary text-foreground focus:outline-none focus:ring-2 transition-all",
                        digit ? "border-primary/50 focus:ring-primary/50" : "border-border focus:ring-primary/30"
                      )}
                    />
                  ))}
                </div>

                {error && (
                  <p className="text-xs text-destructive font-medium text-center">{error}</p>
                )}

                <button
                  onClick={handleOtpSubmit}
                  disabled={loading || otp.join("").length < 6}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all",
                    loading || otp.join("").length < 6
                      ? "bg-primary/30 text-primary/60 cursor-not-allowed"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Lock className="w-4 h-4" /> Verify & Login
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-xs">
                  <button
                    onClick={() => {
                      setStep("phone")
                      setOtp(["", "", "", "", "", ""])
                      setError("")
                    }}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Change Number
                  </button>
                  <button
                    onClick={handleResend}
                    disabled={resendTimer > 0}
                    className={cn(
                      "transition-colors",
                      resendTimer > 0
                        ? "text-muted-foreground cursor-not-allowed"
                        : "text-primary hover:text-primary/80"
                    )}
                  >
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Success Step */}
          {step === "success" && (
            <div className="space-y-4 text-center py-4">
              <div className="flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-success" />
                </div>
              </div>
              <h2 className="text-lg font-semibold text-foreground">Login Successful</h2>
              <p className="text-sm text-muted-foreground">
                Redirecting to Command Center...
              </p>
              <div className="flex justify-center">
                <RefreshCw className="w-5 h-5 text-primary animate-spin" />
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-[10px] text-muted-foreground mt-6">
          National Disaster Response Authority - Authorized Personnel Only
        </p>
      </div>
    </div>
  )
}
