
import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get(api.templates.list.path, async (req, res) => {
    const templates = await storage.getTemplates();
    res.json(templates);
  });

  app.get(api.templates.get.path, async (req, res) => {
    const template = await storage.getTemplate(Number(req.params.id));
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    res.json(template);
  });

  app.post(api.templates.create.path, async (req, res) => {
    try {
      const input = api.templates.create.input.parse(req.body);
      const template = await storage.createTemplate(input);
      res.status(201).json(template);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.templates.update.path, async (req, res) => {
    try {
      const input = api.templates.update.input.parse(req.body);
      const template = await storage.updateTemplate(Number(req.params.id), input);
      if (!template) {
        return res.status(404).json({ message: 'Template not found' });
      }
      res.json(template);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.templates.delete.path, async (req, res) => {
    await storage.deleteTemplate(Number(req.params.id));
    res.status(204).send();
  });

  // Seed data
  seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existing = await storage.getTemplates();
  if (existing.length === 0) {
    await storage.createTemplate({
      title: "Order Ready",
      content: "Hi {{name}}, your order #{{orderId}} is ready for pickup! 🛍️"
    });
    await storage.createTemplate({
      title: "Meeting Reminder",
      content: "Hello {{name}}, reminder for our meeting at {{time}} today. See you there! 📅"
    });
    await storage.createTemplate({
      title: "Late Running",
      content: "Hey {{name}}, I'm running about {{minutes}} minutes late. Sorry! 🚗"
    });
  }
}
