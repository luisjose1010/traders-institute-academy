import { Suspense, lazy, type ComponentType } from "react";
import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useAuth, AuthProvider } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";

const Home = lazy(() => import("@/pages/Home"));
const StudentDashboard = lazy(() => import("@/pages/StudentDashboard"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const CourseDetail = lazy(() => import("@/pages/CourseDetail"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));

const queryClient = new QueryClient();

function PageLoader() {
  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
        <span className="text-[#555] text-sm">Loading...</span>
      </div>
    </div>
  );
}

function ProtectedRoute({ component: Component, requireRole }: { component: ComponentType<any>; requireRole?: "admin" | "student" }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Redirect to="/" />;
  if (requireRole && user?.role !== requireRole) return <Redirect to="/dashboard" />;
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  );
}

function Router() {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <Switch>
      <Route path="/">
        <Suspense fallback={<PageLoader />}>
          <Home />
        </Suspense>
      </Route>
      <Route path="/reset-password">
        <Suspense fallback={<PageLoader />}>
          <ResetPassword />
        </Suspense>
      </Route>
      <Route path="/dashboard/course/:id">
        {() => {
          if (!isAuthenticated) return <Redirect to="/" />;
          if (isAdmin) return <Redirect to="/dashboard" />;
          return (
            <Suspense fallback={<PageLoader />}>
              <CourseDetail />
            </Suspense>
          );
        }}
      </Route>
      <Route path="/dashboard">
        {() => {
          if (!isAuthenticated) return <Redirect to="/" />;
          if (isAdmin) return <ProtectedRoute component={AdminDashboard} requireRole="admin" />;
          return <ProtectedRoute component={StudentDashboard} requireRole="student" />;
        }}
      </Route>
      <Route path="/dashboard/students/:id">
        {() => {
          if (!isAuthenticated) return <Redirect to="/" />;
          if (isAdmin) return <ProtectedRoute component={AdminDashboard} requireRole="admin" />;
          return <Redirect to="/dashboard" />;
        }}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
