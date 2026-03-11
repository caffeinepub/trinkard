import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useSaveCallerUserProfile } from "../hooks/useQueries";
import { toast } from "sonner";

interface ProfileSetupModalProps {
  open: boolean;
}

export function ProfileSetupModal({ open }: ProfileSetupModalProps) {
  const [name, setName] = useState("");
  const saveMutation = useSaveCallerUserProfile();

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    saveMutation.mutate(
      { name: name.trim() },
      {
        onSuccess: () => {
          toast.success("Profile created successfully");
        },
        onError: (error) => {
          toast.error(`Failed to create profile: ${error.message}`);
        },
      }
    );
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Welcome to Trinkard!</DialogTitle>
          <DialogDescription>
            Please tell us your name to get started with your music journey.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="name">Your Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="mt-2"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSubmit();
              }
            }}
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={saveMutation.isPending}
            className="w-full"
          >
            {saveMutation.isPending ? "Creating Profile..." : "Get Started"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
