import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, User, Key } from "lucide-react";

export default function AdminSettings() {
  const { user } = useAuth();

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Admin account settings</p>
      </div>

      <Card className="border-border/30 bg-card/60">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-4 h-4" /> Account
          </CardTitle>
          <CardDescription>Your admin account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Email</span>
            <span className="text-sm font-medium text-foreground">{user?.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Role</span>
            <Badge variant="default" className="text-xs">Admin</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Last Sign In</span>
            <span className="text-sm text-foreground">{user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : "—"}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/30 bg-card/60">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Key className="w-4 h-4" /> Integrations
          </CardTitle>
          <CardDescription>Connected payment services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Revolut Merchant API</span>
            </div>
            <Badge className="bg-emerald-500/15 text-emerald-500 border-0 text-xs">Connected</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
