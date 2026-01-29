-- =====================================================
-- SECURITY FIX: Harden SECURITY DEFINER function and fix RLS policies
-- =====================================================

-- 1. FIX handle_new_user: Add defensive checks and revoke public access
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Defensive check: ensure called from trigger context
  IF TG_OP != 'INSERT' OR TG_TABLE_NAME != 'users' THEN
    RAISE EXCEPTION 'Function must be called from auth.users INSERT trigger';
  END IF;
  
  -- Prevent duplicate profiles
  IF EXISTS (SELECT 1 FROM public.profiles WHERE user_id = NEW.id) THEN
    RETURN NEW;  -- Profile already exists, skip
  END IF;
  
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add documentation comment
COMMENT ON FUNCTION public.handle_new_user() IS 
  'SECURITY DEFINER function - only safe when called from auth.users trigger. Do not expose via RPC.';

-- Revoke execute permissions from public roles to prevent RPC calls
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;

-- 2. FIX RLS policies with overly permissive WITH CHECK (true) for INSERT
-- These are necessary for checkout to work, but we add store validation

-- Fix carts insert policy - validate store exists
DROP POLICY IF EXISTS "Customers can create their own cart" ON carts;
CREATE POLICY "Customers can create cart for valid store" ON carts
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = carts.store_id)
  );

-- Fix cart_items insert policy - validate cart exists in same store
DROP POLICY IF EXISTS "Users can insert cart items for their carts" ON cart_items;
CREATE POLICY "Users can insert items to valid carts" ON cart_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM carts 
      JOIN products ON products.id = cart_items.product_id
      WHERE carts.id = cart_items.cart_id 
      AND products.store_id = carts.store_id
      AND products.status = 'published'
    )
  );

-- Fix orders insert policy - validate store and basic data
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
CREATE POLICY "Users can create orders for valid stores" ON orders
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = orders.store_id)
    AND customer_email IS NOT NULL 
    AND customer_email != ''
  );

-- Fix order_items insert policy - validate order exists and product matches
DROP POLICY IF EXISTS "Anyone can create order items" ON order_items;
CREATE POLICY "Users can create order items for valid orders" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id
    )
    AND product_name IS NOT NULL 
    AND product_name != ''
    AND price >= 0
    AND quantity >= 1
  );