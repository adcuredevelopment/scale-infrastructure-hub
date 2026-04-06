import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";

interface Props {
  affiliateCode: string;
}

export function ReferralLink({ affiliateCode }: Props) {
  const [copied, setCopied] = useState(false);
  const link = `${window.location.origin}/?ref=${affiliateCode}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass rounded-xl p-5 md:p-6">
      <h3 className="font-display font-semibold text-sm mb-3">Your Referral Link</h3>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="flex-1 bg-secondary/50 rounded-lg px-4 py-2.5 text-xs sm:text-sm text-muted-foreground truncate font-mono min-w-0">
          {link}
        </div>
        <Button size="icon" variant="outline" onClick={handleCopy} className="shrink-0 self-end sm:self-auto">
          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}
