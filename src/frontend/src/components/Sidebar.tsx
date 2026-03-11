import { Home, Search, Library, Plus, Music } from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useCreatePlaylist } from "../hooks/useQueries";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { toast } from "sonner";

export function Sidebar() {
  const location = useLocation();
  const { identity } = useInternetIdentity();
  const [playlistName, setPlaylistName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const createPlaylistMutation = useCreatePlaylist();

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Search, label: "Search", path: "/search" },
    { icon: Library, label: "Library", path: "/library" },
  ];

  const handleCreatePlaylist = () => {
    if (!identity) {
      toast.error("Please log in to create a playlist");
      return;
    }

    if (!playlistName.trim()) {
      toast.error("Please enter a playlist name");
      return;
    }

    createPlaylistMutation.mutate(playlistName, {
      onSuccess: () => {
        toast.success("Playlist created successfully");
        setPlaylistName("");
        setDialogOpen(false);
      },
      onError: (error) => {
        toast.error(`Failed to create playlist: ${error.message}`);
      },
    });
  };

  return (
    <aside className="w-64 bg-sidebar flex flex-col border-r border-sidebar-border">
      {/* Logo */}
      <div className="p-6">
        <Link to="/" className="flex items-center gap-2 group">
          <Music className="h-8 w-8 text-primary" />
          <span className="text-2xl font-display font-bold text-sidebar-foreground">
            Trinkard
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link key={item.path} to={item.path}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 h-10 px-3 text-sidebar-foreground hover:text-sidebar-primary-foreground hover:bg-sidebar-accent",
                  isActive &&
                    "bg-sidebar-accent text-sidebar-primary-foreground font-semibold"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Button>
            </Link>
          );
        })}

        {/* Create Playlist Button */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-10 px-3 text-sidebar-foreground hover:text-sidebar-primary-foreground hover:bg-sidebar-accent"
            >
              <Plus className="h-5 w-5" />
              <span>Create Playlist</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Playlist</DialogTitle>
              <DialogDescription>
                Give your playlist a name to get started.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="playlist-name">Playlist Name</Label>
              <Input
                id="playlist-name"
                value={playlistName}
                onChange={(e) => setPlaylistName(e.target.value)}
                placeholder="My Awesome Playlist"
                className="mt-2"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreatePlaylist();
                  }
                }}
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreatePlaylist}
                disabled={createPlaylistMutation.isPending}
              >
                {createPlaylistMutation.isPending ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </nav>

      {/* Footer */}
      <div className="p-4 text-xs text-muted-foreground text-center border-t border-sidebar-border">
        © 2026. Built with{" "}
        <a
          href="https://caffeine.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          caffeine.ai
        </a>
      </div>
    </aside>
  );
}
