import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props { children: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh", background: "#080808", color: "#fff",
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", fontFamily: "Inter, sans-serif", padding: "2rem", textAlign: "center"
        }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 8, fontFamily: "Poppins, sans-serif" }}>Something went wrong</h1>
          <p style={{ color: "#666", fontSize: "0.9rem", marginBottom: "1.5rem", maxWidth: 400 }}>
            An unexpected error occurred. Please try refreshing the page.
          </p>
          <pre style={{ color: "#e74c3c", fontSize: "0.75rem", background: "rgba(231,76,60,0.05)", border: "1px solid rgba(231,76,60,0.15)", borderRadius: 8, padding: "0.75rem 1rem", maxWidth: 500, overflow: "auto", marginBottom: "1.5rem", textAlign: "left" }}>
            {this.state.error?.message}
          </pre>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.replace("/"); }}
            style={{ background: "#C9A84C", color: "#000", border: "none", borderRadius: 8, padding: "10px 24px", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer" }}
          >
            Go Home
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
