import { useState } from "react";
import { useStore } from "../store";
import { colorById } from "../lib/colors";

export default function TableView() {
  const entities = useStore((s) => s.entities);
  const selectedEntityId = useStore((s) => s.selectedEntityId);
  const selectEntity = useStore((s) => s.selectEntity);
  const [openEntity, setOpenEntity] = useState<string | null>(selectedEntityId);
  const leftPanelOpen = useStore((s) => s.leftPanelOpen);

  return (
    <div
      className={`absolute inset-0 pt-20 pb-6 px-4 sm:px-8 overflow-y-auto transition-[padding] ${leftPanelOpen ? "sm:pl-[404px]" : ""}`}
      style={{ background: "var(--bg-canvas)" }}
    >
      <div className="max-w-[1000px] mx-auto space-y-3">
        {entities.map((e) => {
          const color = colorById(e.color);
          const isOpen = openEntity === e.id;
          return (
            <div
              key={e.id}
              className="rounded-2xl border overflow-hidden"
              style={{ background: "var(--bg-surface)", borderColor: "var(--border)", boxShadow: "var(--shadow-card)" }}
            >
              <button
                className="w-full flex items-center justify-between px-4 sm:px-5 py-3.5"
                onClick={() => {
                  setOpenEntity(isOpen ? null : e.id);
                  selectEntity(e.id);
                }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color.dot }} />
                  <span className="font-semibold text-[14px] truncate" style={{ color: "var(--text-primary)" }}>
                    {e.name}
                  </span>
                  {e.status === "draft" && (
                    <span className="text-[11px] font-medium shrink-0" style={{ color: "#c8811a" }}>
                      Draft
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                    {e.attributes.length} attrs · {e.version}
                  </span>
                  <span
                    className="transition-transform"
                    style={{ color: "var(--text-tertiary)", transform: isOpen ? "rotate(180deg)" : "none" }}
                  >
                    <Chevron />
                  </span>
                </div>
              </button>

              {isOpen && (
                <div className="overflow-x-auto border-t" style={{ borderColor: "var(--border)" }}>
                  <table className="w-full text-[13px] min-w-[420px]">
                    <thead>
                      <tr style={{ color: "var(--text-tertiary)" }}>
                        <th className="text-left font-medium px-4 sm:px-5 py-2">Attribute</th>
                        <th className="text-left font-medium px-4 sm:px-5 py-2">Type / Reference</th>
                      </tr>
                    </thead>
                    <tbody>
                      {e.attributes.map((a) => {
                        const ref = a.refEntityId ? entities.find((t) => t.id === a.refEntityId) : null;
                        const refColor = ref ? colorById(ref.color) : null;
                        return (
                          <tr key={a.id} className="border-t" style={{ borderColor: "var(--border)" }}>
                            <td className="px-4 sm:px-5 py-2" style={{ color: "var(--text-primary)" }}>
                              {a.name}
                            </td>
                            <td className="px-4 sm:px-5 py-2">
                              {ref && refColor ? (
                                <button
                                  className="text-[11px] font-mono px-2 py-[3px] rounded-md"
                                  style={{ background: refColor.badgeBg, color: refColor.badgeText }}
                                  onClick={() => selectEntity(ref.id)}
                                >
                                  {ref.name}
                                </button>
                              ) : (
                                <span className="font-mono text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                                  {a.dataType}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Chevron() {
  return (
    <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
