import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useStorefront } from "@/contexts/StorefrontContext";
import { formatCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ChevronLeft,
  CreditCard,
  Truck,
  Tag,
  Plus,
  Check,
  Loader2,
  MapPin,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Address {
  id: string;
  label: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

export default function Checkout() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const {
    customer,
    setIsAuthOpen,
    cartItems,
    cartTotal,
    currency,
    storeId,
  } = useStorefront();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "stripe">("cod");
  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<{
    id: string;
    code: string;
    type: string;
    value: number;
    amount: number;
  } | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderNotes, setOrderNotes] = useState("");
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);

  // New address form
  const [newAddress, setNewAddress] = useState({
    label: "Home",
    full_name: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "India",
  });

  useEffect(() => {
    if (!customer) {
      setIsAuthOpen(true);
    } else {
      fetchAddresses();
    }
  }, [customer]);

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate(`/store/${slug}`);
    }
  }, [cartItems, navigate, slug]);

  const fetchAddresses = async () => {
    if (!customer) return;

    const { data } = await supabase
      .from("customer_addresses")
      .select("*")
      .eq("customer_id", customer.id)
      .order("is_default", { ascending: false });

    if (data) {
      setAddresses(data);
      const defaultAddr = data.find((a) => a.is_default);
      if (defaultAddr) {
        setSelectedAddress(defaultAddr.id);
      } else if (data.length > 0) {
        setSelectedAddress(data[0].id);
      }
    }
  };

  const handleAddAddress = async () => {
    if (!customer) return;

    const { data, error } = await supabase
      .from("customer_addresses")
      .insert({
        customer_id: customer.id,
        ...newAddress,
        is_default: addresses.length === 0,
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add address",
        variant: "destructive",
      });
      return;
    }

    if (data) {
      setAddresses([...addresses, data]);
      setSelectedAddress(data.id);
      setIsAddressDialogOpen(false);
      setNewAddress({
        label: "Home",
        full_name: "",
        phone: "",
        address_line1: "",
        address_line2: "",
        city: "",
        state: "",
        postal_code: "",
        country: "India",
      });
      toast({
        title: "Address Added",
        description: "Your address has been saved",
      });
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode || !storeId) return;

    setIsApplyingCoupon(true);
    try {
      const { data, error } = await supabase
        .from("discounts")
        .select("*")
        .eq("store_id", storeId)
        .eq("code", couponCode.toUpperCase())
        .eq("status", "active")
        .maybeSingle();

      if (error || !data) {
        toast({
          title: "Invalid Coupon",
          description: "This coupon code is not valid",
          variant: "destructive",
        });
        return;
      }

      // Check min order amount
      if (data.min_order_amount && cartTotal < data.min_order_amount) {
        toast({
          title: "Minimum Order Required",
          description: `Minimum order amount is ${formatCurrency(
            data.min_order_amount,
            currency
          )}`,
          variant: "destructive",
        });
        return;
      }

      // Calculate discount
      let discountAmount =
        data.discount_type === "percentage"
          ? (cartTotal * data.discount_value) / 100
          : data.discount_value;

      // Apply max discount limit
      if (data.max_discount_amount && discountAmount > data.max_discount_amount) {
        discountAmount = data.max_discount_amount;
      }

      setAppliedDiscount({
        id: data.id,
        code: data.code,
        type: data.discount_type,
        value: data.discount_value,
        amount: discountAmount,
      });

      toast({
        title: "Coupon Applied!",
        description: `You saved ${formatCurrency(discountAmount, currency)}`,
      });
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to apply coupon",
        variant: "destructive",
      });
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!customer || !selectedAddress || !storeId) return;

    setIsPlacingOrder(true);
    try {
      const address = addresses.find((a) => a.id === selectedAddress);
      if (!address) throw new Error("Address not found");

      const shippingFee = cartTotal >= 500 ? 0 : 50;
      const discountAmount = appliedDiscount?.amount || 0;
      const total = cartTotal + shippingFee - discountAmount;

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          store_id: storeId,
          customer_id: customer.id,
          customer_email: customer.email || "",
          customer_name: address.full_name,
          customer_phone: address.phone,
          shipping_address: {
            address_line1: address.address_line1,
            address_line2: address.address_line2,
            city: address.city,
            state: address.state,
            postal_code: address.postal_code,
            country: address.country,
          },
          subtotal: cartTotal,
          shipping_fee: shippingFee,
          discount_id: appliedDiscount?.id || null,
          discount_amount: discountAmount,
          total,
          currency,
          payment_method: paymentMethod,
          payment_status: paymentMethod === "cod" ? "pending" : "pending",
          status: "pending",
          notes: orderNotes || null,
        })
        .select()
        .single();

      if (orderError || !order) throw orderError;

      // Create order items
      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product?.name || "Product",
        quantity: item.quantity,
        price: item.product?.price || 0,
      }));

      await supabase.from("order_items").insert(orderItems);

      // Clear cart
      const { data: cart } = await supabase
        .from("carts")
        .select("id")
        .eq("customer_id", customer.id)
        .maybeSingle();

      if (cart) {
        await supabase.from("cart_items").delete().eq("cart_id", cart.id);
      }

      // Update discount usage
      if (appliedDiscount) {
        await supabase
          .from("discounts")
          .update({ used_count: (appliedDiscount as any).used_count + 1 })
          .eq("id", appliedDiscount.id);
      }

      toast({
        title: "Order Placed Successfully!",
        description: `Your order #${order.id.slice(0, 8)} has been placed`,
      });

      navigate(`/store/${slug}/order-success/${order.id}`);
    } catch (error) {
      console.error("Order error:", error);
      toast({
        title: "Order Failed",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const shippingFee = cartTotal >= 500 ? 0 : 50;
  const discountAmount = appliedDiscount?.amount || 0;
  const finalTotal = cartTotal + shippingFee - discountAmount;

  if (!customer) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="border-b bg-background">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate(`/store/${slug}`)}
            className="flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Store
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-2xl font-bold">Checkout</h1>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Forms */}
          <div className="space-y-6 lg:col-span-2">
            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                {addresses.length === 0 ? (
                  <div className="text-center py-8">
                    <MapPin className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 text-muted-foreground">
                      No addresses saved
                    </p>
                  </div>
                ) : (
                  <RadioGroup
                    value={selectedAddress || ""}
                    onValueChange={setSelectedAddress}
                    className="space-y-3"
                  >
                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        className="flex items-start space-x-3 rounded-lg border p-4"
                      >
                        <RadioGroupItem value={address.id} id={address.id} />
                        <Label
                          htmlFor={address.id}
                          className="flex-1 cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{address.label}</span>
                            {address.is_default && (
                              <span className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {address.full_name} • {address.phone}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {address.address_line1}
                            {address.address_line2 && `, ${address.address_line2}`}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {address.city}, {address.state} {address.postal_code}
                          </p>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                <Dialog
                  open={isAddressDialogOpen}
                  onOpenChange={setIsAddressDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" className="mt-4 w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      Add New Address
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add New Address</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Full Name</Label>
                          <Input
                            value={newAddress.full_name}
                            onChange={(e) =>
                              setNewAddress({
                                ...newAddress,
                                full_name: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Phone</Label>
                          <Input
                            value={newAddress.phone}
                            onChange={(e) =>
                              setNewAddress({
                                ...newAddress,
                                phone: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Address Line 1</Label>
                        <Input
                          value={newAddress.address_line1}
                          onChange={(e) =>
                            setNewAddress({
                              ...newAddress,
                              address_line1: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Address Line 2 (Optional)</Label>
                        <Input
                          value={newAddress.address_line2}
                          onChange={(e) =>
                            setNewAddress({
                              ...newAddress,
                              address_line2: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-3">
                        <div className="space-y-2">
                          <Label>City</Label>
                          <Input
                            value={newAddress.city}
                            onChange={(e) =>
                              setNewAddress({
                                ...newAddress,
                                city: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>State</Label>
                          <Input
                            value={newAddress.state}
                            onChange={(e) =>
                              setNewAddress({
                                ...newAddress,
                                state: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Postal Code</Label>
                          <Input
                            value={newAddress.postal_code}
                            onChange={(e) =>
                              setNewAddress({
                                ...newAddress,
                                postal_code: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <Button className="w-full" onClick={handleAddAddress}>
                        Save Address
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(v) => setPaymentMethod(v as "cod" | "stripe")}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-3 rounded-lg border p-4">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Truck className="h-5 w-5" />
                        <span className="font-medium">Cash on Delivery</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Pay when you receive your order
                      </p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 rounded-lg border p-4">
                    <RadioGroupItem value="stripe" id="stripe" />
                    <Label htmlFor="stripe" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        <span className="font-medium">Pay Online</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Credit/Debit Card, UPI, Net Banking
                      </p>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Order Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Order Notes (Optional)</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Any special instructions for your order..."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Summary */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>
                  {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                        {item.product?.images?.[0] ? (
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Truck className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium line-clamp-1">
                          {item.product?.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium">
                        {formatCurrency(
                          (item.product?.price || 0) * item.quantity,
                          currency
                        )}
                      </p>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Coupon */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    disabled={!!appliedDiscount}
                  />
                  {appliedDiscount ? (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setAppliedDiscount(null);
                        setCouponCode("");
                      }}
                    >
                      Remove
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={handleApplyCoupon}
                      disabled={isApplyingCoupon || !couponCode}
                    >
                      {isApplyingCoupon ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Apply"
                      )}
                    </Button>
                  )}
                </div>

                {appliedDiscount && (
                  <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-green-700">
                    <Tag className="h-4 w-4" />
                    <span className="text-sm">
                      Coupon {appliedDiscount.code} applied!
                    </span>
                    <Check className="ml-auto h-4 w-4" />
                  </div>
                )}

                <Separator />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatCurrency(cartTotal, currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>
                      {shippingFee === 0 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        formatCurrency(shippingFee, currency)
                      )}
                    </span>
                  </div>
                  {appliedDiscount && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>-{formatCurrency(discountAmount, currency)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>{formatCurrency(finalTotal, currency)}</span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder || !selectedAddress}
                >
                  {isPlacingOrder ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : null}
                  {paymentMethod === "cod" ? "Place Order" : "Pay Now"}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  By placing this order, you agree to our Terms of Service
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
