import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  limitOptions?: number[];
}

const btnStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", justifyContent: "center",
  width: 32, height: 32, borderRadius: 6, border: "1px solid rgba(255,255,255,0.08)",
  background: "transparent", color: "#888", cursor: "pointer", transition: "all 0.15s",
};
const btnActive: React.CSSProperties = {
  ...btnStyle, background: "rgba(201,168,76,0.15)", borderColor: "rgba(201,168,76,0.3)", color: "#C9A84C", fontWeight: 600,
};
const btnDisabled: React.CSSProperties = { ...btnStyle, opacity: 0.3, cursor: "not-allowed" };

export function Pagination({ page, totalPages, total, limit, onPageChange, onLimitChange, limitOptions = [5, 10, 20, 50] }: PaginationProps) {
  if (total === 0) return null;

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 0", flexWrap: "wrap", gap: 12 }}>
      <div style={{ fontSize: "0.78rem", color: "#555" }}>
        Showing {start}–{end} of {total}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {onLimitChange && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: "0.72rem", color: "#555" }}>Rows:</span>
            <select
              value={limit}
              onChange={e => onLimitChange(parseInt(e.target.value))}
              style={{ background: "#080808", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "4px 8px", color: "#ccc", fontSize: "0.78rem", cursor: "pointer", outline: "none" }}
            >
              {limitOptions.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <button
            disabled={page === 1}
            onClick={() => onPageChange(1)}
            style={page === 1 ? btnDisabled : btnStyle}
            title="First page"
          >
            <ChevronsLeft size={14} />
          </button>
          <button
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
            style={page === 1 ? btnDisabled : btnStyle}
            title="Previous page"
          >
            <ChevronLeft size={14} />
          </button>
          {pages.map((p, i) =>
            p === "..." ? (
              <span key={`e${i}`} style={{ ...btnStyle, border: "none", cursor: "default", color: "#555" }}>…</span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p as number)}
                style={p === page ? btnActive : btnStyle}
              >
                {p}
              </button>
            )
          )}
          <button
            disabled={page === totalPages}
            onClick={() => onPageChange(page + 1)}
            style={page === totalPages ? btnDisabled : btnStyle}
            title="Next page"
          >
            <ChevronRight size={14} />
          </button>
          <button
            disabled={page === totalPages}
            onClick={() => onPageChange(totalPages)}
            style={page === totalPages ? btnDisabled : btnStyle}
            title="Last page"
          >
            <ChevronsRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
