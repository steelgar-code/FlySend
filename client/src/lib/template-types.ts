export interface LocalTemplate {
  id: number;
  title: string;
  content: string;
  info: string;
  time: string;
  order: number;
  createdAt: string;
}

export type InsertTemplate = Pick<LocalTemplate, "title" | "content" | "info" | "time">;
