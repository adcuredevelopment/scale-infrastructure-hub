import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";

export default function AffiliateRegister() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [kvkNumber, setKvkNumber] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [iban, setIban] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [tosAccepted, setTosAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tosAccepted) {
      toast.error("You must accept the Affiliate Terms of Service");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (!iban.trim()) {
      toast.error("IBAN is required for payouts");
      return;
    }
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: `${window.location.origin}/affiliate/dashboard`,
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      try {
        await fetch(`${supabaseUrl}/functions/v1/affiliate-register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: supabaseKey,
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
          body: JSON.stringify({
            userId: data.user.id,
            email,
            displayName,
            companyName: companyName.trim() || null,
            kvkNumber: kvkNumber.trim() || null,
            vatNumber: vatNumber.trim() || null,
            iban: iban.trim(),
            billingAddress: billingAddress.trim() || null,
            tosAcceptedAt: new Date().toISOString(),
          }),
        });
      } catch (err) {
        console.error("Affiliate registration error:", err);
      }
    }

    toast.success("Account created! Please check your email to verify your account.");
    setLoading(false);
    navigate("/affiliate/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 md:pt-40 pb-16 px-5 flex items-center justify-center">
        <div className="glass rounded-xl p-6 md:p-8 w-full max-w-lg">
          <h1 className="text-2xl font-display font-bold mb-2 text-center">Become an Affiliate</h1>
          <p className="text-sm text-muted-foreground text-center mb-6">Create your affiliate account and start earning</p>

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Account details */}
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters" required />
            </div>

            {/* Billing / payout details */}
            <div className="pt-2 border-t border-border">
              <p className="text-sm font-medium mb-3 text-foreground">Billing & Payout Details</p>
              <p className="text-xs text-muted-foreground mb-4">Required for self-billing invoices (EU Art. 224)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name <span className="text-xs text-muted-foreground">(optional)</span></Label>
                <Input id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Your company" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kvk">KVK Number <span className="text-xs text-muted-foreground">(optional)</span></Label>
                <Input id="kvk" value={kvkNumber} onChange={(e) => setKvkNumber(e.target.value)} placeholder="12345678" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vat">VAT Number <span className="text-xs text-muted-foreground">(optional)</span></Label>
                <Input id="vat" value={vatNumber} onChange={(e) => setVatNumber(e.target.value)} placeholder="NL123456789B01" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="iban">IBAN <span className="text-destructive">*</span></Label>
                <Input id="iban" value={iban} onChange={(e) => setIban(e.target.value)} placeholder="NL91ABNA0417164300" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Billing Address <span className="text-xs text-muted-foreground">(optional)</span></Label>
              <Input id="address" value={billingAddress} onChange={(e) => setBillingAddress(e.target.value)} placeholder="Street, City, Country" />
            </div>

            <div className="flex items-start space-x-3 pt-2">
              <Checkbox
                id="tos"
                checked={tosAccepted}
                onCheckedChange={(checked) => setTosAccepted(checked === true)}
                className="mt-0.5"
              />
              <Label htmlFor="tos" className="text-sm leading-snug cursor-pointer">
                I agree to the{" "}
                <a href="/affiliate/terms" target="_blank" className="text-primary hover:underline">
                  Affiliate Terms of Service
                </a>
                , including the self-billing arrangement
              </Label>
            </div>
            <Button type="submit" className="w-full min-h-[48px]" disabled={loading || !tosAccepted}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Create Account
            </Button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-4">
            Already have an account?{" "}
            <Link to="/affiliate/login" className="text-primary hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
