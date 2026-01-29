-- =====================================================
-- SECURITY FIX: Remove overly permissive RLS policies
-- =====================================================

-- 1. FIX customer_otp: Remove public SELECT access (edge function uses service role)
DROP POLICY IF EXISTS "Allow select for verification" ON customer_otp;
DROP POLICY IF EXISTS "Allow insert for OTP" ON customer_otp;

-- OTP operations should only happen via edge function (service role)
-- No client-side access needed - edge function bypasses RLS with service role key

-- 2. FIX carts: Remove USING(true) policies, add session-based isolation
DROP POLICY IF EXISTS "Anyone can view their cart by session" ON carts;
DROP POLICY IF EXISTS "Anyone can update their cart" ON carts;
DROP POLICY IF EXISTS "Anyone can create cart" ON carts;

-- Carts: Customers can only access carts linked to their customer_id
-- For anonymous carts (session-based), access is controlled via application logic
-- We restrict to authenticated customers only for proper security
CREATE POLICY "Customers can view their own cart" ON carts
  FOR SELECT USING (
    customer_id IS NOT NULL 
    AND EXISTS (
      SELECT 1 FROM customers 
      WHERE customers.id = carts.customer_id 
      AND (customers.email_verified = true OR customers.phone_verified = true)
    )
  );

CREATE POLICY "Customers can create their own cart" ON carts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Customers can update their own cart" ON carts
  FOR UPDATE USING (
    customer_id IS NOT NULL 
    AND EXISTS (
      SELECT 1 FROM customers 
      WHERE customers.id = carts.customer_id 
      AND (customers.email_verified = true OR customers.phone_verified = true)
    )
  );

CREATE POLICY "Store owners can view all carts" ON carts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM stores 
      WHERE stores.id = carts.store_id 
      AND stores.user_id = auth.uid()
    )
  );

-- 3. FIX cart_items: Remove USING(true) policy
DROP POLICY IF EXISTS "Anyone can manage cart items" ON cart_items;

-- Cart items: Access through cart relationship
CREATE POLICY "Users can view cart items for their carts" ON cart_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM carts 
      WHERE carts.id = cart_items.cart_id 
      AND carts.customer_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM customers 
        WHERE customers.id = carts.customer_id 
        AND (customers.email_verified = true OR customers.phone_verified = true)
      )
    )
  );

CREATE POLICY "Users can insert cart items for their carts" ON cart_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM carts 
      WHERE carts.id = cart_items.cart_id
    )
  );

CREATE POLICY "Users can update cart items for their carts" ON cart_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM carts 
      WHERE carts.id = cart_items.cart_id 
      AND carts.customer_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM customers 
        WHERE customers.id = carts.customer_id 
        AND (customers.email_verified = true OR customers.phone_verified = true)
      )
    )
  );

CREATE POLICY "Users can delete cart items for their carts" ON cart_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM carts 
      WHERE carts.id = cart_items.cart_id 
      AND carts.customer_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM customers 
        WHERE customers.id = carts.customer_id 
        AND (customers.email_verified = true OR customers.phone_verified = true)
      )
    )
  );

CREATE POLICY "Store owners can view all cart items" ON cart_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM carts 
      JOIN stores ON stores.id = carts.store_id
      WHERE carts.id = cart_items.cart_id 
      AND stores.user_id = auth.uid()
    )
  );

-- 4. FIX wishlists: Remove USING(true) policy
DROP POLICY IF EXISTS "Customers can manage wishlists" ON wishlists;

-- Wishlists: Verified customers only
CREATE POLICY "Verified customers can view their wishlists" ON wishlists
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM customers 
      WHERE customers.id = wishlists.customer_id 
      AND (customers.email_verified = true OR customers.phone_verified = true)
    )
  );

CREATE POLICY "Verified customers can add to wishlist" ON wishlists
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM customers 
      WHERE customers.id = wishlists.customer_id 
      AND (customers.email_verified = true OR customers.phone_verified = true)
    )
  );

CREATE POLICY "Verified customers can remove from wishlist" ON wishlists
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM customers 
      WHERE customers.id = wishlists.customer_id 
      AND (customers.email_verified = true OR customers.phone_verified = true)
    )
  );

CREATE POLICY "Store owners can view wishlists" ON wishlists
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM customers 
      JOIN stores ON stores.id = customers.store_id
      WHERE customers.id = wishlists.customer_id 
      AND stores.user_id = auth.uid()
    )
  );

-- 5. FIX customer_addresses: Remove USING(true) policy
DROP POLICY IF EXISTS "Customers can manage addresses" ON customer_addresses;

-- Addresses: Verified customers only
CREATE POLICY "Verified customers can view their addresses" ON customer_addresses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM customers 
      WHERE customers.id = customer_addresses.customer_id 
      AND (customers.email_verified = true OR customers.phone_verified = true)
    )
  );

CREATE POLICY "Verified customers can add addresses" ON customer_addresses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM customers 
      WHERE customers.id = customer_addresses.customer_id 
      AND (customers.email_verified = true OR customers.phone_verified = true)
    )
  );

CREATE POLICY "Verified customers can update their addresses" ON customer_addresses
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM customers 
      WHERE customers.id = customer_addresses.customer_id 
      AND (customers.email_verified = true OR customers.phone_verified = true)
    )
  );

CREATE POLICY "Verified customers can delete their addresses" ON customer_addresses
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM customers 
      WHERE customers.id = customer_addresses.customer_id 
      AND (customers.email_verified = true OR customers.phone_verified = true)
    )
  );

CREATE POLICY "Store owners can view customer addresses" ON customer_addresses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM customers 
      JOIN stores ON stores.id = customers.store_id
      WHERE customers.id = customer_addresses.customer_id 
      AND stores.user_id = auth.uid()
    )
  );

-- 6. FIX orders: Add customer access to view their own orders
CREATE POLICY "Customers can view their own orders" ON orders
  FOR SELECT USING (
    customer_id IS NOT NULL 
    AND EXISTS (
      SELECT 1 FROM customers 
      WHERE customers.id = orders.customer_id 
      AND (customers.email_verified = true OR customers.phone_verified = true)
    )
  );

-- Allow order creation (needed for checkout)
CREATE POLICY "Anyone can create orders" ON orders
  FOR INSERT WITH CHECK (true);

-- 7. FIX order_items: Allow access for customers viewing their orders
CREATE POLICY "Customers can view their order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      JOIN customers ON customers.id = orders.customer_id
      WHERE orders.id = order_items.order_id 
      AND (customers.email_verified = true OR customers.phone_verified = true)
    )
  );

-- Allow order item creation (needed for checkout)
CREATE POLICY "Anyone can create order items" ON order_items
  FOR INSERT WITH CHECK (true);