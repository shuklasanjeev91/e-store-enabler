import { useState } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useStorefront } from "@/contexts/StorefrontContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Mail, Phone, Loader2, ShieldCheck, ArrowLeft } from "lucide-react";

export default function CustomerAuthModal() {
  const { isAuthOpen, setIsAuthOpen, setCustomer, storeId } = useStorefront();
  const [authType, setAuthType] = useState<"email" | "phone">("email");
  const [step, setStep] = useState<"input" | "otp">("input");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tempCustomerId, setTempCustomerId] = useState<string | null>(null);

  const resetForm = () => {
    setStep("input");
    setEmail("");
    setPhone("");
    setOtp("");
    setTempCustomerId(null);
  };

  const handleClose = () => {
    setIsAuthOpen(false);
    resetForm();
  };

  const handleSendOTP = async () => {
    if (!storeId) return;

    const identifier = authType === "email" ? email : phone;
    if (!identifier) {
      toast({
        title: "Error",
        description: `Please enter your ${authType}`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await supabase.functions.invoke("customer-auth", {
        body: {
          action: "send_otp",
          store_id: storeId,
          otp_type: authType,
          ...(authType === "email" ? { email } : { phone }),
        },
      });

      if (response.error) throw response.error;

      if (response.data?.customer_id) {
        setTempCustomerId(response.data.customer_id);
      }

      toast({
        title: "Code Sent!",
        description: `Check your ${authType} for the verification code`,
      });
      setStep("otp");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send OTP",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!storeId || otp.length !== 6) return;

    setIsLoading(true);
    try {
      const response = await supabase.functions.invoke("customer-auth", {
        body: {
          action: "verify_otp",
          store_id: storeId,
          otp_type: authType,
          otp_code: otp,
          customer_id: tempCustomerId,
          ...(authType === "email" ? { email } : { phone }),
        },
      });

      if (response.error) throw response.error;

      if (response.data?.customer) {
        setCustomer(response.data.customer);
        toast({
          title: "Welcome!",
          description: "You're now signed in",
        });
        handleClose();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Invalid OTP",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isAuthOpen} onOpenChange={setIsAuthOpen}>
      <DialogContent className="sm:max-w-[400px] p-0 gap-0 overflow-hidden rounded-2xl">
        {/* Header */}
        <div className="px-6 pt-8 pb-2 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <ShieldCheck className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-xl font-semibold">
            {step === "input" ? "Welcome" : "Verify Your Identity"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {step === "input"
              ? "Sign in to access your orders and wishlist"
              : `Enter the 6-digit code sent to ${authType === "email" ? email : phone}`}
          </p>
        </div>

        <div className="px-6 pb-8 pt-4">
          {step === "input" ? (
            <div className="space-y-5">
              {/* Auth type toggle */}
              <div className="flex rounded-xl bg-muted/50 p-1">
                <button
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${
                    authType === "email"
                      ? "bg-white shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setAuthType("email")}
                >
                  <Mail className="h-4 w-4" />
                  Email
                </button>
                <button
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${
                    authType === "phone"
                      ? "bg-white shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setAuthType("phone")}
                >
                  <Phone className="h-4 w-4" />
                  Phone
                </button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="auth-input" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {authType === "email" ? "Email Address" : "Phone Number"}
                </Label>
                <Input
                  id="auth-input"
                  type={authType === "email" ? "email" : "tel"}
                  placeholder={authType === "email" ? "you@example.com" : "+91 9876543210"}
                  value={authType === "email" ? email : phone}
                  onChange={(e) =>
                    authType === "email" ? setEmail(e.target.value) : setPhone(e.target.value)
                  }
                  className="h-12 rounded-xl"
                />
              </div>

              <Button
                className="w-full h-12 rounded-xl text-sm font-semibold"
                onClick={handleSendOTP}
                disabled={isLoading || !(authType === "email" ? email : phone)}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Continue
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => setOtp(value)}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} className="h-12 w-12 rounded-xl text-lg" />
                    <InputOTPSlot index={1} className="h-12 w-12 rounded-xl text-lg" />
                    <InputOTPSlot index={2} className="h-12 w-12 rounded-xl text-lg" />
                    <InputOTPSlot index={3} className="h-12 w-12 rounded-xl text-lg" />
                    <InputOTPSlot index={4} className="h-12 w-12 rounded-xl text-lg" />
                    <InputOTPSlot index={5} className="h-12 w-12 rounded-xl text-lg" />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button
                className="w-full h-12 rounded-xl text-sm font-semibold"
                onClick={handleVerifyOTP}
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify & Sign In
              </Button>

              <div className="flex items-center justify-between text-xs">
                <button
                  className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setStep("input")}
                >
                  <ArrowLeft className="h-3 w-3" />
                  Change {authType}
                </button>
                <button
                  className="text-primary hover:underline"
                  onClick={handleSendOTP}
                  disabled={isLoading}
                >
                  Resend Code
                </button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
