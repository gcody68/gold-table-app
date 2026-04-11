import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdmin } from "@/contexts/AdminContext";
import { toast } from "sonner";
import { Lock } from "lucide-react";

type Props = { open: boolean; onClose: () => void };

export default function AdminLoginModal({ open, onClose }: Props) {
  const [password, setPassword] = useState("");
  const { login } = useAdmin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(password)) {
      toast.success("Welcome, Admin!");
      onClose();
    } else {
      toast.error("Invalid password");
    }
    setPassword("");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-serif text-gold flex items-center gap-2">
            <Lock className="w-5 h-5" /> Admin Login
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter admin password"
            className="bg-secondary border-border"
            autoFocus
          />
          <Button type="submit" className="w-full gradient-gold text-primary-foreground font-semibold">
            Login
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
