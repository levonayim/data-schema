export type DataType =
  | "string"
  | "integer"
  | "decimal"
  | "boolean"
  | "date"
  | "datetime"
  | "text"
  | "uuid"
  | "json";

export const DATA_TYPES: DataType[] = [
  "string",
  "integer",
  "decimal",
  "boolean",
  "date",
  "datetime",
  "text",
  "uuid",
  "json",
];

export interface Attribute {
  id: string;
  name: string;
  /** primitive data type, mutually exclusive with refEntityId */
  dataType: DataType | null;
  /** if set, this attribute is a relationship/reference to another entity */
  refEntityId: string | null;
}

export type EntityStatus = "published" | "draft";

export interface EntityNode {
  id: string;
  name: string;
  color: string;
  status: EntityStatus;
  version: string;
  x: number;
  y: number;
  collapsed: boolean;
  attributes: Attribute[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  ts: number;
}

export type ViewMode = "canvas" | "table";
export type Theme = "light" | "dark";
export type LeftPanelMode = "file" | "assist" | null;

export interface Collaborator {
  id: string;
  initials: string;
  color: string;
}
