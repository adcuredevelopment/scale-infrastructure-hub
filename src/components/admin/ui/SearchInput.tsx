import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export function SearchInput({ className, ...props }: Props) {
  return (
    <div className={cn("relative w-full", className)}>
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
        style={{ color: "var(--ad-text-faint)" }}
      />
      <input
        {...props}
        className="admin-input w-full h-10 pl-9 pr-3 text-[13px]"
      />
    </div>
  );
}
