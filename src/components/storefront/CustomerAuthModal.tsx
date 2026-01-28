import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useStorefront } from "@/contexts/StorefrontContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Mail, Phone, Loader2 } from "lucide-react";

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
        title: "OTP Sent",
        description: `A verification code has been sent to your ${authType}`,
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
          description: "You have been signed in successfully",
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === "input" ? "Sign In" : "Enter Verification Code"}
          </DialogTitle>
        </DialogHeader>

        {step === "input" ? (
          <Tabs
            value={authType}
            onValueChange={(v) => setAuthType(v as "email" | "phone")}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </TabsTrigger>
              <TabsTrigger value="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone
              </TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button
                className="w-full"
                onClick={handleSendOTP}
                disabled={isLoading || !email}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send OTP
              </Button>
            </TabsContent>

            <TabsContent value="phone" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <Button
                className="w-full"
                onClick={handleSendOTP}
                disabled={isLoading || !phone}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send OTP
              </Button>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground text-center">
              We sent a 6-digit code to{" "}
              <span className="font-medium">
                {authType === "email" ? email : phone}
              </span>
            </p>

            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(value) => setOtp(value)}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <div className="space-y-2">
              <Button
                className="w-full"
                onClick={handleVerifyOTP}
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify & Sign In
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setStep("input")}
              >
                Change {authType}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Didn't receive the code?{" "}
              <button
                className="text-primary hover:underline"
                onClick={handleSendOTP}
                disabled={isLoading}
              >
                Resend
              </button>
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
