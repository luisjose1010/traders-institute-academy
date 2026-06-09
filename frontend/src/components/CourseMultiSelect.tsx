import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { Search, X, Check, ChevronDown } from "lucide-react";

interface CourseItem { id: number; name: string; description: string; status: string; }

export function CourseMultiSelect({
  selectedIds,
  onChange,
  placeholder = "Search courses...",
}: {
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [filtered, setFiltered] = useState<CourseItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    api.admin.getAllCourses({ limit: 50, status: "active" }).then(d => {
      setCourses(d.items);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setFiltered(courses);
      return;
    }
    const q = query.toLowerCase();
    setFiltered(courses.filter(c =>
      c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
    ));
  }, [query, courses]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (id: number) => {
    onChange(selectedIds.includes(id) ? selectedIds.filter(i => i !== id) : [...selectedIds, id]);
  };

  const remove = (id: number) => {
    onChange(selectedIds.filter(i => i !== id));
  };

  const selectedCourses = courses.filter(c => selectedIds.includes(c.id));

  return (
    <div ref={ref} className="relative">
      {selectedCourses.length > 0 ? (
        <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-[#080808] border border-[rgba(255,255,255,0.1)] min-h-[42px]">
          {selectedCourses.map(c => (
            <span
              key={c.id}
              onClick={() => remove(c.id)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[rgba(201,168,76,0.12)] border border-[rgba(201,168,76,0.2)] text-[#C9A84C] text-sm cursor-pointer hover:bg-[rgba(201,168,76,0.2)] transition-colors"
            >
              {c.name}
              <X size={12} />
            </span>
          ))}
          <button
            onClick={() => setOpen(true)}
            className="ml-auto flex items-center gap-1 text-[#555] text-sm hover:text-[#888] transition-colors"
          >
            <ChevronDown size={14} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-[#080808] border border-[rgba(255,255,255,0.1)] text-[#555] text-sm hover:border-[rgba(255,255,255,0.15)] transition-colors"
        >
          {placeholder}
          <ChevronDown size={14} />
        </button>
      )}

      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#0f0f0f] border border-[rgba(255,255,255,0.1)] rounded-xl max-h-[280px] overflow-y-auto z-50 shadow-[0_12px_40px_rgba(0,0,0,0.5)] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
          <div className="sticky top-0 bg-[#0f0f0f] p-2 border-b border-[rgba(255,255,255,0.06)]">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" />
              <button onClick={() => setOpen(false)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#888] bg-transparent border-none cursor-pointer"><X size={14} /></button>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search courses..."
                className="w-full bg-[#080808] border border-[rgba(255,255,255,0.1)] rounded-lg pl-9 pr-8 py-2 text-sm text-white outline-none focus:border-[rgba(201,168,76,0.3)]"
                autoFocus
              />
            </div>
          </div>
          {loading ? (
            <div className="p-4 text-center text-[#555] text-sm">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="p-4 text-center text-[#555] text-sm">No courses found</div>
          ) : (
            <div className="p-1">
              {filtered.map(c => {
                const selected = selectedIds.includes(c.id);
                return (
                  <button
                    key={c.id}
                    onClick={() => toggle(c.id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm hover:bg-[rgba(255,255,255,0.04)] transition-colors"
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${selected ? "bg-[#C9A84C] border-[#C9A84C]" : "border-[rgba(255,255,255,0.2)]"}`}>
                      {selected && <Check size={10} className="text-black" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white truncate">{c.name}</div>
                      <div className="text-xs text-[#555] truncate">{c.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
