import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const plan = searchParams.get("plan") || "your plan";
  const [redirecting, setRedirecting] = useState(false);

  const handleRedirect = () => {
    setRedirecting(true);
    window.location.href = "https://portal.adcure.agency/signup";
  };

  useEffect(() => {
    // Auto-redirect after 5 seconds
    const timer = setTimeout(() => {
      handleRedirect();
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-primary" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-display font-bold">Payment Successful!</h1>
          <p className="text-muted-foreground">
            Your <span className="text-foreground font-medium">{plan}</span> subscription is now active.
          </p>
        </div>

        <div className="glass rounded-xl p-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            You'll be redirected to create your account in a few seconds...
          </p>
          <Button
            onClick={handleRedirect}
            disabled={redirecting}
            className="w-full min-h-[48px]"
          >
            {redirecting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Redirecting...
              </>
            ) : (
              <>
                Go to Portal Sign Up
                <ExternalLink className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Having trouble? Contact us at support@adcure.agency
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;
