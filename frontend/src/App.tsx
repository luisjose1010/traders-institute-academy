import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import StudentDashboard from "@/pages/StudentDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import CourseDetail from "@/pages/CourseDetail";
import ResetPassword from "@/pages/ResetPassword";
import { useAuth } from "@/hooks/useAuth";

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component, requireRole }: { component: () => React.ReactElement; requireRole?: "admin" | "student" }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Redirect to="/" />;
  if (requireRole && user?.role !== requireRole) return <Redirect to="/dashboard" />;
  return <Component />;
}

function Router() {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/dashboard/course/:id">
        {() => {
          if (!isAuthenticated) return <Redirect to="/" />;
          if (isAdmin) return <Redirect to="/dashboard" />;
          return <CourseDetail />;
        }}
      </Route>
      <Route path="/dashboard">
        {() => {
          if (!isAuthenticated) return <Redirect to="/" />;
          if (isAdmin) return <ProtectedRoute component={AdminDashboard} requireRole="admin" />;
          return <ProtectedRoute component={StudentDashboard} requireRole="student" />;
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
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
