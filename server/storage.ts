
import { db } from "./db";
import {
  templates,
  type Template,
  type CreateTemplateRequest,
  type UpdateTemplateRequest
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getTemplates(): Promise<Template[]>;
  getTemplate(id: number): Promise<Template | undefined>;
  createTemplate(template: CreateTemplateRequest): Promise<Template>;
  updateTemplate(id: number, updates: UpdateTemplateRequest): Promise<Template>;
  deleteTemplate(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getTemplates(): Promise<Template[]> {
    return await db.select().from(templates).orderBy(desc(templates.createdAt));
  }

  async getTemplate(id: number): Promise<Template | undefined> {
    const [template] = await db.select().from(templates).where(eq(templates.id, id));
    return template;
  }

  async createTemplate(template: CreateTemplateRequest): Promise<Template> {
    const [newTemplate] = await db.insert(templates).values(template).returning();
    return newTemplate;
  }

  async updateTemplate(id: number, updates: UpdateTemplateRequest): Promise<Template> {
    const [updated] = await db.update(templates)
      .set(updates)
      .where(eq(templates.id, id))
      .returning();
    return updated;
  }

  async deleteTemplate(id: number): Promise<void> {
    await db.delete(templates).where(eq(templates.id, id));
  }
}

export const storage = new DatabaseStorage();
