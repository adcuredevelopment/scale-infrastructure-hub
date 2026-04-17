import { useSearchParams } from "react-router-dom";
import { CheckCircle, ExternalLink, UserCheck, Clock, ArrowRight, Mail, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const PORTAL_URL = "https://portal.adcure.agency/login?from_url=https%3A%2F%2Fportal.adcure.agency%2F";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const plan = searchParams.get("plan");
  const product = searchParams.get("product");
  const isShopOrder = !!product;

  if (isShopOrder) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-5 py-12">
        <div className="max-w-lg w-full text-center space-y-8">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-primary" />
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-display font-bold">
              Thank You for Your Order!
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg">
              Your order for <span className="text-foreground font-semibold">{product}</span> was successful.
            </p>
          </div>

          <div className="glass rounded-xl p-6 sm:p-8 space-y-6 text-left">
            <h2 className="text-lg font-display font-semibold text-center">What's Next?</h2>

            <div className="space-y-5">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm text-foreground">Confirmation email</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    You'll receive a payment confirmation email shortly. Check your spam folder if you don't see it.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                  <Package className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm text-foreground">Delivery within 1 hour</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Our team will send the access details directly to your email within 1 hour during business hours.
                  </p>
                </div>
              </div>
            </div>

            <Link to="/" className="block">
              <Button className="w-full min-h-[52px] text-base glow-primary-sm hover:scale-[1.02] active:scale-[0.97] transition-all duration-200">
                Back to Homepage
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          <p className="text-xs text-muted-foreground">
            Having trouble? Contact us at{" "}
            <a href="mailto:support@adcure.agency" className="text-primary hover:underline">
              support@adcure.agency
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-5 py-12">
      <div className="max-w-lg w-full text-center space-y-8">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <CheckCircle className="w-10 h-10 text-primary" />
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-display font-bold">
            Thank You for Subscribing!
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            Your <span className="text-foreground font-semibold">{plan || "your plan"}</span> subscription payment was successful.
          </p>
        </div>

        <div className="glass rounded-xl p-6 sm:p-8 space-y-6 text-left">
          <h2 className="text-lg font-display font-semibold text-center">What's Next?</h2>

          <div className="space-y-5">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                <UserCheck className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm text-foreground">Create your account</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Click the button below to sign up on our platform. Use the same email you used for payment.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                <Clock className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm text-foreground">Wait for admin approval</p>
                <p className="text-sm text-muted-foreground mt-1">
                  After signing up, an admin will review and approve your account. You'll receive a confirmation email once approved.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                <ArrowRight className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm text-foreground">Start scaling</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Once approved, log in and start using your ad accounts, structures, and all premium features.
                </p>
              </div>
            </div>
          </div>

          <a href={PORTAL_URL} target="_blank" rel="noopener noreferrer" className="block">
            <Button className="w-full min-h-[52px] text-base glow-primary-sm hover:scale-[1.02] active:scale-[0.97] transition-all duration-200">
              Sign Up on Our Platform
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </a>
        </div>

        <p className="text-xs text-muted-foreground">
          Having trouble? Contact us at{" "}
          <a href="mailto:support@adcure.agency" className="text-primary hover:underline">
            support@adcure.agency
          </a>
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;
