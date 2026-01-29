import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.93.2";

// ==========================================
// CORS CONFIGURATION - Restrict to allowed origins
// ==========================================
const ALLOWED_ORIGINS = [
  "https://ignite-shop-easy.lovable.app",
  "https://id-preview--ced711d0-f92e-475b-8942-ddd7a8cf855a.lovable.app",
  "http://localhost:5173",
  "http://localhost:8080",
];

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.some(allowed => 
    origin === allowed || origin.endsWith('.lovable.app')
  ) ? origin : ALLOWED_ORIGINS[0];
  
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
    "Access-Control-Allow-Credentials": "true",
  };
}

// ==========================================
// INPUT VALIDATION UTILITIES
// ==========================================

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;
const OTP_REGEX = /^\d{6}$/;

function isValidUUID(value: unknown): value is string {
  return typeof value === "string" && UUID_REGEX.test(value);
}

function isValidEmail(value: unknown): value is string {
  return typeof value === "string" && value.length <= 255 && EMAIL_REGEX.test(value);
}

function isValidPhone(value: unknown): value is string {
  return typeof value === "string" && value.length <= 20 && PHONE_REGEX.test(value);
}

function isValidOTP(value: unknown): value is string {
  return typeof value === "string" && OTP_REGEX.test(value);
}

function isValidOTPType(value: unknown): value is "email" | "phone" {
  return value === "email" || value === "phone";
}

function isValidAction(value: unknown): value is "send_otp" | "verify_otp" {
  return value === "send_otp" || value === "verify_otp";
}

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

function createErrorResponse(message: string, status: number, corsHeaders: Record<string, string>): Response {
  return new Response(
    JSON.stringify({ error: message }),
    { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

const handler = async (req: Request): Promise<Response> => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);
  
  // Validate origin for non-OPTIONS requests
  const isValidOrigin = origin && (
    ALLOWED_ORIGINS.includes(origin) || 
    origin.endsWith('.lovable.app')
  );
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    if (!isValidOrigin && origin) {
      return new Response("Forbidden", { status: 403 });
    }
    return new Response("ok", { headers: corsHeaders });
  }

  // Reject requests from invalid origins (except when no origin - e.g., server-side calls)
  if (origin && !isValidOrigin) {
    return new Response(
      JSON.stringify({ error: "Invalid origin" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return createErrorResponse("Invalid JSON body", 400, corsHeaders);
    }

    // Validate body is an object
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return createErrorResponse("Request body must be an object", 400, corsHeaders);
    }

    const requestBody = body as Record<string, unknown>;

    // Validate action
    if (!isValidAction(requestBody.action)) {
      return createErrorResponse("Invalid action. Must be 'send_otp' or 'verify_otp'", 400, corsHeaders);
    }

    // Validate store_id
    if (!isValidUUID(requestBody.store_id)) {
      return createErrorResponse("Invalid store_id format", 400, corsHeaders);
    }

    // Validate otp_type
    if (!isValidOTPType(requestBody.otp_type)) {
      return createErrorResponse("Invalid otp_type. Must be 'email' or 'phone'", 400, corsHeaders);
    }

    const action = requestBody.action as "send_otp" | "verify_otp";
    const store_id = requestBody.store_id as string;
    const otp_type = requestBody.otp_type as "email" | "phone";

    // ==========================================
    // SEND OTP HANDLER
    // ==========================================
    if (action === "send_otp") {
      const email = requestBody.email as string | undefined;
      const phone = requestBody.phone as string | undefined;
      
      // Validate email or phone based on otp_type
      if (otp_type === "email") {
        if (!isValidEmail(email)) {
          return createErrorResponse("Invalid email format", 400, corsHeaders);
        }
      } else {
        if (!isValidPhone(phone)) {
          return createErrorResponse("Invalid phone format. Use E.164 format (e.g., +1234567890)", 400, corsHeaders);
        }
      }

      const identifier = otp_type === "email" ? email : phone;

      // Rate limiting: Check for recent OTP requests (max 1 per 60 seconds)
      const { data: recentOtps } = await supabase
        .from("customer_otp")
        .select("created_at")
        .eq("store_id", store_id)
        .eq(otp_type, identifier)
        .gte("created_at", new Date(Date.now() - 60000).toISOString())
        .order("created_at", { ascending: false })
        .limit(1);

      if (recentOtps && recentOtps.length > 0) {
        return createErrorResponse("Please wait 60 seconds before requesting another OTP", 429, corsHeaders);
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
          return createErrorResponse("Failed to create customer", 500, corsHeaders);
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
        return createErrorResponse("Failed to generate OTP", 500, corsHeaders);
      }

      // In production, send OTP via email/SMS service
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

    // ==========================================
    // VERIFY OTP HANDLER
    // ==========================================
    if (action === "verify_otp") {
      const otp_code = requestBody.otp_code as string;
      const customer_id = requestBody.customer_id as string | undefined;
      const email = requestBody.email as string | undefined;
      const phone = requestBody.phone as string | undefined;
      
      // Validate OTP format
      if (!isValidOTP(otp_code)) {
        return createErrorResponse("Invalid OTP format. Must be 6 digits", 400, corsHeaders);
      }

      // Validate optional fields
      if (customer_id !== undefined && !isValidUUID(customer_id)) {
        return createErrorResponse("Invalid customer_id format", 400, corsHeaders);
      }
      
      if (otp_type === "email" && email !== undefined && !isValidEmail(email)) {
        return createErrorResponse("Invalid email format", 400, corsHeaders);
      }
      
      if (otp_type === "phone" && phone !== undefined && !isValidPhone(phone)) {
        return createErrorResponse("Invalid phone format", 400, corsHeaders);
      }

      const identifier = otp_type === "email" ? email : phone;

      // Brute force protection: Check for too many recent OTP attempts
      const { data: recentAttempts } = await supabase
        .from("customer_otp")
        .select("id")
        .eq("store_id", store_id)
        .eq(otp_type, identifier)
        .gte("created_at", new Date(Date.now() - 600000).toISOString())
        .limit(6);

      if (recentAttempts && recentAttempts.length >= 5) {
        return createErrorResponse("Too many attempts. Please request a new OTP", 429, corsHeaders);
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
        return createErrorResponse("Invalid or expired OTP", 400, corsHeaders);
      }

      // Check expiry
      if (new Date(otpRecord.expires_at) < new Date()) {
        return createErrorResponse("OTP has expired", 400, corsHeaders);
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

    return createErrorResponse("Invalid action", 400, corsHeaders);
  } catch (error: unknown) {
    console.error("Error in customer-auth function:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return createErrorResponse(message, 500, corsHeaders);
  }
};

serve(handler);
