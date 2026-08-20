import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Attribute, ChatMessage, EntityNode, LeftPanelMode, Theme, ViewMode } from "./types";
import { SEED_ENTITIES } from "./data/seed";
import { colorForIndex } from "./lib/colors";
import { CARD_WIDTH } from "./lib/layout";
import { entityHeight } from "./lib/connections";

const nid = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 9)}`;

export interface Camera {
  x: number;
  y: number;
  scale: number;
}

interface PendingConnection {
  fromEntityId: string;
  fromAttrId: string;
  toX: number;
  toY: number;
}

interface AppState {
  entities: EntityNode[];
  theme: Theme;
  fileName: string;
  viewMode: ViewMode;
  leftPanelOpen: boolean;
  leftPanelMode: LeftPanelMode;
  selectedEntityId: string | null;
  hoveredEntityId: string | null;
  camera: Camera;
  chat: ChatMessage[];
  searchOpen: boolean;
  addEntityOpen: boolean;
  shareOpen: boolean;
  pending: PendingConnection | null;

  toggleTheme: () => void;
  setFileName: (name: string) => void;
  setViewMode: (v: ViewMode) => void;
  toggleLeftPanel: (mode?: LeftPanelMode) => void;
  closeLeftPanel: () => void;
  selectEntity: (id: string | null) => void;
  hoverEntity: (id: string | null) => void;
  moveEntity: (id: string, x: number, y: number) => void;
  toggleCollapse: (id: string) => void;
  setCamera: (c: Partial<Camera>) => void;
  zoomBy: (delta: number, pivot?: { x: number; y: number }) => void;
  zoomTo: (scale: number) => void;
  resetCamera: () => void;
  addEntity: (name: string, attributes: Omit<Attribute, "id">[]) => string;
  deleteEntity: (id: string) => void;
  addAttribute: (entityId: string, attribute: Omit<Attribute, "id">) => void;
  removeAttribute: (entityId: string, attrId: string) => void;
  connectAttribute: (entityId: string, attrId: string, targetEntityId: string) => void;
  disconnectAttribute: (entityId: string, attrId: string) => void;
  autoLayout: () => void;
  sendChat: (text: string) => void;
  setSearchOpen: (v: boolean) => void;
  setAddEntityOpen: (v: boolean) => void;
  setShareOpen: (v: boolean) => void;
  startPending: (fromEntityId: string, fromAttrId: string, toX: number, toY: number) => void;
  updatePending: (toX: number, toY: number) => void;
  endPending: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      entities: SEED_ENTITIES,
      theme: "light",
      fileName: "Originations Term Sets",
      viewMode: "canvas",
      leftPanelOpen: true,
      leftPanelMode: "file",
      selectedEntityId: SEED_ENTITIES[0]?.id ?? null,
      hoveredEntityId: null,
      camera: { x: 0, y: 0, scale: 1 },
      chat: [
        {
          id: nid("msg"),
          role: "assistant",
          text: "Hi! I can help you tidy up this schema — try asking me to connect two entities, rename a field, or find something that looks broken.",
          ts: Date.now(),
        },
      ],
      searchOpen: false,
      addEntityOpen: false,
      shareOpen: false,
      pending: null,

      toggleTheme: () => set((s) => ({ theme: s.theme === "light" ? "dark" : "light" })),
      setFileName: (name) => set({ fileName: name || "Untitled Term Set" }),
      setViewMode: (v) => set({ viewMode: v }),
      toggleLeftPanel: (mode) =>
        set((s) => {
          if (mode && mode !== s.leftPanelMode) return { leftPanelOpen: true, leftPanelMode: mode };
          return { leftPanelOpen: !s.leftPanelOpen, leftPanelMode: mode ?? s.leftPanelMode };
        }),
      closeLeftPanel: () => set({ leftPanelOpen: false }),
      selectEntity: (id) => set({ selectedEntityId: id }),
      hoverEntity: (id) => set({ hoveredEntityId: id }),
      moveEntity: (id, x, y) =>
        set((s) => ({ entities: s.entities.map((e) => (e.id === id ? { ...e, x, y } : e)) })),
      toggleCollapse: (id) =>
        set((s) => ({ entities: s.entities.map((e) => (e.id === id ? { ...e, collapsed: !e.collapsed } : e)) })),
      setCamera: (c) => set((s) => ({ camera: { ...s.camera, ...c } })),
      zoomBy: (delta, pivot) =>
        set((s) => {
          const next = Math.min(2.5, Math.max(0.1, s.camera.scale + delta));
          if (!pivot) return { camera: { ...s.camera, scale: next } };
          const ratio = next / s.camera.scale;
          const x = pivot.x - (pivot.x - s.camera.x) * ratio;
          const y = pivot.y - (pivot.y - s.camera.y) * ratio;
          return { camera: { x, y, scale: next } };
        }),
      zoomTo: (scale) => set((s) => ({ camera: { ...s.camera, scale: Math.min(2.5, Math.max(0.1, scale)) } })),
      resetCamera: () => set({ camera: { x: 0, y: 0, scale: 1 } }),

      addEntity: (name, attributes) => {
        const id = nid("ent");
        const s0 = get();
        const idx = s0.entities.length;
        const color = colorForIndex(idx).id;
        const centerX = -s0.camera.x / s0.camera.scale + 260;
        const centerY = -s0.camera.y / s0.camera.scale + 200;
        const rows = attributes.length;
        const h = 52 + rows * 36;

        const overlaps = (x: number, y: number) =>
          s0.entities.some((e) => {
            const eh = entityHeight(e);
            return x < e.x + CARD_WIDTH + 40 && x + CARD_WIDTH + 40 > e.x && y < e.y + eh + 40 && y + h + 40 > e.y;
          });

        let x = centerX;
        let y = centerY;
        for (let attempt = 0; attempt < 24 && overlaps(x, y); attempt++) {
          const angle = attempt * 2.4;
          const radius = 60 + attempt * 34;
          x = centerX + Math.cos(angle) * radius;
          y = centerY + Math.sin(angle) * radius;
        }

        const node: EntityNode = {
          id,
          name,
          color,
          status: "draft",
          version: "v1.0.0",
          x,
          y,
          collapsed: false,
          attributes: attributes.map((a) => ({ ...a, id: nid("attr") })),
        };
        set((s) => ({ entities: [...s.entities, node], selectedEntityId: id }));
        return id;
      },
      deleteEntity: (id) =>
        set((s) => ({
          entities: s.entities
            .filter((e) => e.id !== id)
            .map((e) => ({
              ...e,
              attributes: e.attributes.map((a) => (a.refEntityId === id ? { ...a, refEntityId: null } : a)),
            })),
          selectedEntityId: s.selectedEntityId === id ? null : s.selectedEntityId,
        })),
      addAttribute: (entityId, attribute) =>
        set((s) => ({
          entities: s.entities.map((e) =>
            e.id === entityId ? { ...e, attributes: [...e.attributes, { ...attribute, id: nid("attr") }] } : e
          ),
        })),
      removeAttribute: (entityId, attrId) =>
        set((s) => ({
          entities: s.entities.map((e) =>
            e.id === entityId ? { ...e, attributes: e.attributes.filter((a) => a.id !== attrId) } : e
          ),
        })),
      connectAttribute: (entityId, attrId, targetEntityId) =>
        set((s) => ({
          entities: s.entities.map((e) =>
            e.id === entityId
              ? {
                  ...e,
                  attributes: e.attributes.map((a) =>
                    a.id === attrId ? { ...a, refEntityId: targetEntityId, dataType: null } : a
                  ),
                }
              : e
          ),
        })),
      disconnectAttribute: (entityId, attrId) =>
        set((s) => ({
          entities: s.entities.map((e) =>
            e.id === entityId
              ? {
                  ...e,
                  attributes: e.attributes.map((a) =>
                    a.id === attrId ? { ...a, refEntityId: null, dataType: "string" } : a
                  ),
                }
              : e
          ),
        })),
      autoLayout: () =>
        set((s) => {
          const cols = Math.ceil(Math.sqrt(s.entities.length));
          const gapX = 420;
          const gapY = 320;
          const entities = s.entities.map((e, i) => ({
            ...e,
            x: (i % cols) * gapX,
            y: Math.floor(i / cols) * gapY,
          }));
          return { entities, camera: { x: 0, y: 0, scale: 0.8 } };
        }),
      sendChat: (text) => {
        const trimmed = text.trim();
        if (!trimmed) return;
        const userMsg: ChatMessage = { id: nid("msg"), role: "user", text: trimmed, ts: Date.now() };
        set((s) => ({ chat: [...s.chat, userMsg] }));
        window.setTimeout(() => {
          const reply: ChatMessage = {
            id: nid("msg"),
            role: "assistant",
            text: "Got it — I can't make live changes yet in this preview, but that request has been noted. Try the Add Entity or Auto Layout tools on the canvas toolbar in the meantime.",
            ts: Date.now(),
          };
          set((s) => ({ chat: [...s.chat, reply] }));
        }, 500);
      },
      setSearchOpen: (v) => set({ searchOpen: v }),
      setAddEntityOpen: (v) => set({ addEntityOpen: v }),
      setShareOpen: (v) => set({ shareOpen: v }),
      startPending: (fromEntityId, fromAttrId, toX, toY) =>
        set({ pending: { fromEntityId, fromAttrId, toX, toY } }),
      updatePending: (toX, toY) =>
        set((s) => (s.pending ? { pending: { ...s.pending, toX, toY } } : {})),
      endPending: () => set({ pending: null }),
    }),
    {
      name: "erd-mock-store",
      partialize: (s) => ({ entities: s.entities, theme: s.theme, fileName: s.fileName }),
    }
  )
);
