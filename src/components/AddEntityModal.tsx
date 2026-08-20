import { useEffect, useState } from "react";
import { useStore } from "../store";
import { DATA_TYPES, type DataType } from "../types";

interface DraftAttr {
  key: string;
  name: string;
  kind: "type" | "ref";
  dataType: DataType;
  refEntityId: string;
}

const mkAttr = (): DraftAttr => ({
  key: Math.random().toString(36).slice(2),
  name: "",
  kind: "type",
  dataType: "string",
  refEntityId: "",
});

export default function AddEntityModal() {
  const open = useStore((s) => s.addEntityOpen);
  const setOpen = useStore((s) => s.setAddEntityOpen);
  const entities = useStore((s) => s.entities);
  const addEntity = useStore((s) => s.addEntity);

  const [name, setName] = useState("");
  const [attrs, setAttrs] = useState<DraftAttr[]>([mkAttr()]);

  const close = () => {
    setOpen(false);
    setName("");
    setAttrs([mkAttr()]);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const submit = () => {
    if (!name.trim()) return;
    const cleaned = attrs.filter((a) => a.name.trim());
    addEntity(
      name.trim(),
      cleaned.map((a) => ({
        name: a.name.trim(),
        dataType: a.kind === "type" ? a.dataType : null,
        refEntityId: a.kind === "ref" ? a.refEntityId || null : null,
      }))
    );
    close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 overflow-y-auto" style={{ background: "rgba(10,10,14,0.45)" }} onClick={close}>
      <div
        className="w-full max-w-[520px] rounded-2xl mt-8 sm:mt-0 max-h-[86vh] flex flex-col"
        style={{ background: "var(--bg-surface)", boxShadow: "var(--shadow-pill)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-[15px] font-semibold" style={{ color: "var(--text-primary)" }}>
            Add entity
          </h2>
          <button onClick={close} style={{ color: "var(--text-tertiary)" }}>
            ✕
          </button>
        </div>

        <div className="px-5 py-4 overflow-y-auto space-y-4">
          <div>
            <label className="text-[12px] font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Entity name
            </label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. billingAccount"
              className="w-full rounded-lg border px-3 py-2 text-[13.5px] outline-none"
              style={{ borderColor: "var(--border-strong)", background: "var(--bg-surface-2)", color: "var(--text-primary)" }}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[12px] font-medium" style={{ color: "var(--text-secondary)" }}>
                Attributes
              </label>
              <button
                className="text-[12px] font-medium"
                style={{ color: "var(--accent-blue-fg)" }}
                onClick={() => setAttrs((a) => [...a, mkAttr()])}
              >
                + Add attribute
              </button>
            </div>
            <div className="space-y-2">
              {attrs.map((a, i) => (
                <div key={a.key} className="flex items-center gap-1.5">
                  <input
                    value={a.name}
                    onChange={(e) =>
                      setAttrs((list) => list.map((x, xi) => (xi === i ? { ...x, name: e.target.value } : x)))
                    }
                    placeholder="fieldName"
                    className="flex-1 min-w-0 rounded-lg border px-2.5 py-1.5 text-[13px] outline-none"
                    style={{ borderColor: "var(--border-strong)", background: "var(--bg-surface-2)", color: "var(--text-primary)" }}
                  />
                  <select
                    value={a.kind === "ref" ? "ref" : a.dataType}
                    onChange={(e) =>
                      setAttrs((list) =>
                        list.map((x, xi) => {
                          if (xi !== i) return x;
                          if (e.target.value === "ref") return { ...x, kind: "ref", refEntityId: entities[0]?.id ?? "" };
                          return { ...x, kind: "type", dataType: e.target.value as DataType };
                        })
                      )
                    }
                    className="rounded-lg border px-2 py-1.5 text-[12.5px] outline-none w-[112px]"
                    style={{ borderColor: "var(--border-strong)", background: "var(--bg-surface-2)", color: "var(--text-primary)" }}
                  >
                    {DATA_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                    <option value="ref">reference…</option>
                  </select>
                  {a.kind === "ref" && (
                    <select
                      value={a.refEntityId}
                      onChange={(e) =>
                        setAttrs((list) => list.map((x, xi) => (xi === i ? { ...x, refEntityId: e.target.value } : x)))
                      }
                      className="rounded-lg border px-2 py-1.5 text-[12.5px] outline-none w-[120px]"
                      style={{ borderColor: "var(--border-strong)", background: "var(--bg-surface-2)", color: "var(--text-primary)" }}
                    >
                      {entities.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.name}
                        </option>
                      ))}
                    </select>
                  )}
                  <button
                    className="w-7 h-7 shrink-0 flex items-center justify-center rounded-lg"
                    style={{ color: "var(--text-tertiary)" }}
                    onClick={() => setAttrs((list) => list.filter((_, xi) => xi !== i))}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t" style={{ borderColor: "var(--border)" }}>
          <button
            className="px-4 py-2 rounded-lg text-[13px] font-medium"
            style={{ color: "var(--text-secondary)" }}
            onClick={close}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded-lg text-[13px] font-semibold text-white disabled:opacity-40"
            style={{ background: "var(--accent-blue)" }}
            disabled={!name.trim()}
            onClick={submit}
          >
            Create entity
          </button>
        </div>
      </div>
    </div>
  );
}
