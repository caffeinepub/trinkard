import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { PlayerProvider } from "./contexts/PlayerContext";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { PlayerBar } from "./components/PlayerBar";
import { HomePage } from "./pages/HomePage";
import { SearchPage } from "./pages/SearchPage";
import { LibraryPage } from "./pages/LibraryPage";
import { PlaylistDetailPage } from "./pages/PlaylistDetailPage";
import { ProfileSetupModal } from "./components/ProfileSetupModal";
import { useGetCallerUserProfile } from "./hooks/useQueries";
import { useInternetIdentity } from "./hooks/useInternetIdentity";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});

function RootLayout() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !isLoading && isFetched && userProfile === null;

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <ProfileSetupModal open={showProfileSetup} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <div className="flex-1 overflow-y-auto px-6 pt-6 pb-24 scrollbar-hidden">
            <Outlet />
          </div>
        </main>
      </div>
      <PlayerBar />
    </div>
  );
}

// Define routes
const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const searchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/search",
  component: SearchPage,
});

const libraryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/library",
  component: LibraryPage,
});

const playlistRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/playlist/$name",
  component: PlaylistDetailPage,
});

// Create route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  searchRoute,
  libraryRoute,
  playlistRoute,
]);

// Create router
const router = createRouter({ routeTree });

// Type augmentation for TypeScript
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <PlayerProvider>
          <RouterProvider router={router} />
          <Toaster />
        </PlayerProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
