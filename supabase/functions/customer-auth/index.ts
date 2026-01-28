import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.93.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface SendOTPRequest {
  action: "send_otp";
  store_id: string;
  otp_type: "email" | "phone";
  email?: string;
  phone?: string;
}

interface VerifyOTPRequest {
  action: "verify_otp";
  store_id: string;
  otp_type: "email" | "phone";
  otp_code: string;
  customer_id?: string;
  email?: string;
  phone?: string;
}

type RequestBody = SendOTPRequest | VerifyOTPRequest;

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: RequestBody = await req.json();
    const { action, store_id, otp_type } = body;

    if (action === "send_otp") {
      const { email, phone } = body as SendOTPRequest;
      const identifier = otp_type === "email" ? email : phone;

      if (!identifier) {
        return new Response(
          JSON.stringify({ error: `${otp_type} is required` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check if customer exists or create new one
      let customerId: string | null = null;
      
      const existingCustomerQuery = supabase
        .from("customers")
        .select("id")
        .eq("store_id", store_id);

      if (otp_type === "email") {
        existingCustomerQuery.eq("email", email);
      } else {
        existingCustomerQuery.eq("phone", phone);
      }

      const { data: existingCustomer } = await existingCustomerQuery.maybeSingle();

      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        // Create new customer
        const { data: newCustomer, error: createError } = await supabase
          .from("customers")
          .insert({
            store_id,
            email: otp_type === "email" ? email : null,
            phone: otp_type === "phone" ? phone : null,
          })
          .select("id")
          .single();

        if (createError) {
          console.error("Error creating customer:", createError);
          return new Response(
            JSON.stringify({ error: "Failed to create customer" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        customerId = newCustomer.id;
      }

      // Generate OTP
      const otpCode = generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Delete old OTPs for this customer/identifier
      await supabase
        .from("customer_otp")
        .delete()
        .eq("store_id", store_id)
        .eq("otp_type", otp_type)
        .or(`customer_id.eq.${customerId},${otp_type}.eq.${identifier}`);

      // Store OTP
      const { error: otpError } = await supabase.from("customer_otp").insert({
        store_id,
        customer_id: customerId,
        otp_type,
        otp_code: otpCode,
        email: otp_type === "email" ? email : null,
        phone: otp_type === "phone" ? phone : null,
        expires_at: expiresAt.toISOString(),
      });

      if (otpError) {
        console.error("Error storing OTP:", otpError);
        return new Response(
          JSON.stringify({ error: "Failed to generate OTP" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // In production, send OTP via email/SMS service
      // For now, we'll log it (in development) and return success
      console.log(`[DEV] OTP for ${identifier}: ${otpCode}`);

      // TODO: Integrate with email service (Resend) for email OTP
      // TODO: Integrate with SMS service (Twilio) for phone OTP

      return new Response(
        JSON.stringify({
          success: true,
          message: `OTP sent to ${otp_type}`,
          customer_id: customerId,
          // Remove this in production - only for testing
          dev_otp: Deno.env.get("DENO_ENV") === "development" ? otpCode : undefined,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "verify_otp") {
      const { otp_code, customer_id, email, phone } = body as VerifyOTPRequest;
      const identifier = otp_type === "email" ? email : phone;

      if (!otp_code || otp_code.length !== 6) {
        return new Response(
          JSON.stringify({ error: "Invalid OTP format" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Find OTP record
      let otpQuery = supabase
        .from("customer_otp")
        .select("*")
        .eq("store_id", store_id)
        .eq("otp_type", otp_type)
        .eq("otp_code", otp_code)
        .eq("verified", false);

      if (customer_id) {
        otpQuery = otpQuery.eq("customer_id", customer_id);
      } else if (identifier) {
        otpQuery = otpQuery.eq(otp_type, identifier);
      }

      const { data: otpRecord, error: otpFetchError } = await otpQuery.maybeSingle();

      if (otpFetchError || !otpRecord) {
        return new Response(
          JSON.stringify({ error: "Invalid or expired OTP" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check expiry
      if (new Date(otpRecord.expires_at) < new Date()) {
        return new Response(
          JSON.stringify({ error: "OTP has expired" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Mark OTP as verified
      await supabase
        .from("customer_otp")
        .update({ verified: true })
        .eq("id", otpRecord.id);

      // Update customer verification status
      const updateData =
        otp_type === "email"
          ? { email_verified: true }
          : { phone_verified: true };

      await supabase
        .from("customers")
        .update(updateData)
        .eq("id", otpRecord.customer_id);

      // Fetch customer data
      const { data: customer } = await supabase
        .from("customers")
        .select("*")
        .eq("id", otpRecord.customer_id)
        .single();

      return new Response(
        JSON.stringify({
          success: true,
          message: "OTP verified successfully",
          customer,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in customer-auth function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
