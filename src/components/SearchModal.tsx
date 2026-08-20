import { useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "../store";
import { colorById } from "../lib/colors";

interface Result {
  kind: "entity" | "attribute";
  entityId: string;
  entityName: string;
  color: string;
  attrName?: string;
  detail: string;
}

export default function SearchModal() {
  const open = useStore((s) => s.searchOpen);
  const setOpen = useStore((s) => s.setSearchOpen);
  const entities = useStore((s) => s.entities);
  const selectEntity = useStore((s) => s.selectEntity);
  const setCamera = useStore((s) => s.setCamera);
  const camera = useStore((s) => s.camera);
  const setViewMode = useStore((s) => s.setViewMode);
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 10);
    else setQ("");
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(!open);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  const results = useMemo<Result[]>(() => {
    const query = q.trim().toLowerCase();
    if (!query) return [];
    const out: Result[] = [];
    entities.forEach((e) => {
      if (e.name.toLowerCase().includes(query)) {
        out.push({ kind: "entity", entityId: e.id, entityName: e.name, color: e.color, detail: `${e.attributes.length} attributes` });
      }
      e.attributes.forEach((a) => {
        if (a.name.toLowerCase().includes(query)) {
          out.push({
            kind: "attribute",
            entityId: e.id,
            entityName: e.name,
            color: e.color,
            attrName: a.name,
            detail: a.refEntityId ? `references ${entities.find((t) => t.id === a.refEntityId)?.name ?? "?"}` : a.dataType ?? "",
          });
        }
      });
    });
    return out.slice(0, 30);
  }, [q, entities]);

  if (!open) return null;

  const jump = (entityId: string) => {
    const e = entities.find((en) => en.id === entityId);
    if (!e) return;
    setViewMode("canvas");
    selectEntity(entityId);
    setCamera({ x: -e.x * camera.scale + 400, y: -e.y * camera.scale + 220 });
    setOpen(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] p-4"
      style={{ background: "rgba(10,10,14,0.45)" }}
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-[560px] rounded-2xl overflow-hidden"
        style={{ background: "var(--bg-surface)", boxShadow: "var(--shadow-pill)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
            <circle cx="8" cy="8" r="5" stroke="var(--text-tertiary)" strokeWidth="1.4" />
            <path d="M12 12l3.5 3.5" stroke="var(--text-tertiary)" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search entities and attributes..."
            className="flex-1 bg-transparent outline-none text-[14px]"
            style={{ color: "var(--text-primary)" }}
          />
          <kbd
            className="text-[11px] px-1.5 py-0.5 rounded border"
            style={{ borderColor: "var(--border)", color: "var(--text-tertiary)" }}
          >
            Esc
          </kbd>
        </div>

        <div className="max-h-[50vh] overflow-y-auto p-2">
          {q.trim() === "" && (
            <div className="px-3 py-6 text-center text-[13px]" style={{ color: "var(--text-tertiary)" }}>
              Start typing to search across the schema
            </div>
          )}
          {q.trim() !== "" && results.length === 0 && (
            <div className="px-3 py-6 text-center text-[13px]" style={{ color: "var(--text-tertiary)" }}>
              No matches for "{q}"
            </div>
          )}
          {results.map((r, i) => {
            const c = colorById(r.color);
            return (
              <button
                key={i}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:opacity-90"
                style={{ background: "transparent" }}
                onMouseDown={() => jump(r.entityId)}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: c.dot }} />
                <span className="flex-1 min-w-0">
                  <span className="text-[13.5px] font-medium" style={{ color: "var(--text-primary)" }}>
                    {r.kind === "attribute" ? `${r.entityName}.${r.attrName}` : r.entityName}
                  </span>
                  <span className="block text-[11.5px] truncate" style={{ color: "var(--text-tertiary)" }}>
                    {r.detail}
                  </span>
                </span>
                <span
                  className="text-[10.5px] font-medium px-1.5 py-0.5 rounded shrink-0"
                  style={{ background: c.badgeBg, color: c.badgeText }}
                >
                  {r.kind}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
