import { Button } from "@/components/ui/button";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useQueryClient } from "@tanstack/react-query";
import { LogIn, LogOut, User } from "lucide-react";
import { useGetCallerUserProfile } from "../hooks/useQueries";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Header() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: userProfile } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: unknown) {
        console.error("Login error:", error);
        if (
          error instanceof Error &&
          error.message === "User is already authenticated"
        ) {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex-1" />

        <div className="flex items-center gap-3">
          {isAuthenticated && userProfile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 px-3"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {getInitials(userProfile.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{userProfile.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleAuth}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={handleAuth}
              disabled={isLoggingIn}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6"
            >
              {isLoggingIn ? (
                "Logging in..."
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Log in
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
