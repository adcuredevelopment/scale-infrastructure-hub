import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const EU_COUNTRIES = [
  { code: "NL", name: "Netherlands" },
  { code: "BE", name: "Belgium" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
  { code: "PT", name: "Portugal" },
  { code: "AT", name: "Austria" },
  { code: "IE", name: "Ireland" },
  { code: "FI", name: "Finland" },
  { code: "SE", name: "Sweden" },
  { code: "DK", name: "Denmark" },
  { code: "PL", name: "Poland" },
  { code: "CZ", name: "Czech Republic" },
  { code: "RO", name: "Romania" },
  { code: "HU", name: "Hungary" },
  { code: "GR", name: "Greece" },
  { code: "BG", name: "Bulgaria" },
  { code: "HR", name: "Croatia" },
  { code: "SK", name: "Slovakia" },
  { code: "SI", name: "Slovenia" },
  { code: "LT", name: "Lithuania" },
  { code: "LV", name: "Latvia" },
  { code: "EE", name: "Estonia" },
  { code: "LU", name: "Luxembourg" },
  { code: "MT", name: "Malta" },
  { code: "CY", name: "Cyprus" },
  { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" },
  { code: "OTHER", name: "Other" },
];

export interface ShopCheckoutProduct {
  name: string;
  amount: number; // excl. BTW, in EUR
}

interface ShopCheckoutDialogProps {
  product: ShopCheckoutProduct | null;
  onOpenChange: (open: boolean) => void;
}

export const ShopCheckoutDialog = ({ product, onOpenChange }: ShopCheckoutDialogProps) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("NL");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setFirstName("");
      setLastName("");
      setEmail("");
      setCountry("NL");
      setErrors({});
    }
  }, [product]);

  const isNL = country === "NL";
  const taxRate = 0.21;
  const subtotal = product?.amount ?? 0;
  const taxAmount = isNL ? subtotal * taxRate : 0;
  const totalAmount = subtotal + taxAmount;

  const handleSubmit = async () => {
    if (!product) return;

    const newErrors: Record<string, string> = {};
    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!lastName.trim()) newErrors.lastName = "Last name is required";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Valid email is required";
    }
    if (!country) newErrors.country = "Country is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const res = await fetch(`${supabaseUrl}/functions/v1/revolut-create-shop-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: supabaseKey,
        },
        body: JSON.stringify({
          productName: product.name,
          email: email.trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          country,
          affiliateCode: (() => {
            try {
              const stored = localStorage.getItem("adcure_ref");
              if (!stored) return undefined;
              const { code, ts } = JSON.parse(stored);
              if (Date.now() - ts > 30 * 24 * 60 * 60 * 1000) {
                localStorage.removeItem("adcure_ref");
                return undefined;
              }
              return code;
            } catch {
              return undefined;
            }
          })(),
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "Failed to create order");

      if (data?.checkout_url) {
        onOpenChange(false);
        window.location.href = data.checkout_url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (err: any) {
      console.error("Shop checkout error:", err);
      toast.error("Unable to start checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={!!product} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="font-display">Complete your order</DialogTitle>
          <DialogDescription>
            Enter your details for {product?.name}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="shop-firstname">First Name</Label>
              <Input
                id="shop-firstname"
                placeholder="John"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  setErrors((p) => ({ ...p, firstName: "" }));
                }}
              />
              {errors.firstName && <p className="text-xs text-destructive">{errors.firstName}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="shop-lastname">Last Name</Label>
              <Input
                id="shop-lastname"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  setErrors((p) => ({ ...p, lastName: "" }));
                }}
              />
              {errors.lastName && <p className="text-xs text-destructive">{errors.lastName}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="shop-email">Email Address</Label>
            <Input
              id="shop-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((p) => ({ ...p, email: "" }));
              }}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="shop-country">Country</Label>
            <Select value={country} onValueChange={(val) => setCountry(val)}>
              <SelectTrigger id="shop-country">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {EU_COUNTRIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.country && <p className="text-xs text-destructive">{errors.country}</p>}
          </div>

          {product && (
            <div className="rounded-lg bg-muted/50 border border-border/30 p-3 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{product.name}</span>
                <span className="text-foreground">€{subtotal.toFixed(2)}</span>
              </div>
              {isNL && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">BTW (21%)</span>
                  <span className="text-foreground">€{taxAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-border/30 pt-1.5 flex justify-between text-sm font-semibold">
                <span className="text-foreground">Total</span>
                <span className="text-primary">€{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          )}

          <Button onClick={handleSubmit} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              "Continue to Payment"
            )}
          </Button>

          <p className="text-[10px] text-muted-foreground text-center">
            One-time payment • Delivered within 1 hour after confirmation
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
