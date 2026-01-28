import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Package, Home } from "lucide-react";

export default function OrderSuccess() {
  const { slug, orderId } = useParams<{ slug: string; orderId: string }>();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="pt-8 pb-8">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>

          <h1 className="text-2xl font-bold text-green-600">
            Order Placed Successfully!
          </h1>

          <p className="mt-2 text-muted-foreground">
            Thank you for your order. We'll send you a confirmation email shortly.
          </p>

          <div className="mt-6 rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground">Order ID</p>
            <p className="font-mono text-lg font-semibold">
              #{orderId?.slice(0, 8).toUpperCase()}
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate(`/store/${slug}`)}
            >
              <Home className="mr-2 h-4 w-4" />
              Continue Shopping
            </Button>
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            For any queries, please contact our customer support.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
