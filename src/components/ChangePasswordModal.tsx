import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";

type Props = { open: boolean; onClose: () => void };

export default function ChangePasswordModal({ open, onClose }: Props) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setCurrent("");
    setNext("");
    setConfirm("");
    setLoading(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!current.trim() || !next.trim() || !confirm.trim()) return;
    if (next !== confirm) {
      toast.error("New passwords do not match");
      return;
    }
    if (next.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: next });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated successfully");
      handleClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-card border-border max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-serif text-gold flex items-center gap-2">
            <KeyRound className="w-5 h-5" />
            Change Password
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label className="text-muted-foreground text-xs">New Password</Label>
            <Input
              type="password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              placeholder="Min. 6 characters"
              className="bg-secondary border-border"
              autoFocus
            />
          </div>
          <div className="space-y-1">
            <Label className="text-muted-foreground text-xs">Confirm New Password</Label>
            <Input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Re-enter new password"
              className="bg-secondary border-border"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full gradient-gold text-primary-foreground font-semibold"
          >
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
