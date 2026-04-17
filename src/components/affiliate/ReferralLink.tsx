import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface Props {
  affiliateCode: string;
  referralCount?: number;
  totalEarned?: number;
}

export function ReferralLink({ affiliateCode, referralCount = 0, totalEarned = 0 }: Props) {
  const [copied, setCopied] = useState(false);
  const link = `${window.location.origin}/?ref=${affiliateCode}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="aff-card p-5 md:p-6">
      <h3 className="aff-syne font-semibold text-[14px] text-[#f1f5f9]">Your Referral Link</h3>
      <p className="text-[12px] text-[#64748b] mt-1">
        Share this link to earn commissions on every referral
      </p>

      <div className="mt-4 flex flex-col sm:flex-row items-stretch gap-2">
        <div className="flex-1 min-w-0 aff-mono text-[12px] text-[#94a3b8] px-3.5 py-2.5 truncate"
             style={{ background: "#0a0a0d", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 7 }}>
          {link}
        </div>
        <button onClick={handleCopy} className="aff-btn-copy shrink-0 justify-center">
          {copied ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy</>}
        </button>
      </div>

      <div className="mt-4 flex items-center gap-3 text-[11px] text-[#64748b]">
        <span><span className="aff-mono text-[#94a3b8]">{referralCount}</span> Referrals total</span>
        <span className="text-[#334155]">•</span>
        <span><span className="aff-mono text-[#94a3b8]">€{totalEarned.toFixed(2)}</span> Total earned</span>
      </div>
    </div>
  );
}
