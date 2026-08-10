import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

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

const STORAGE_KEY = "whatsapp-templates";

function getTemplatesFromStorage(): LocalTemplate[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      const defaults: LocalTemplate[] = [
        {
          id: 1,
          title: "Order Ready",
          content: "Hi {{name}}, your order #{{orderId}} is ready for pickup!",
          info: "",
          time: "",
          order: 0,
          createdAt: new Date().toISOString(),
        },
        {
          id: 2,
          title: "Meeting Reminder",
          content: "Hello {{name}}, reminder for our meeting at {{time}} today. See you there!",
          info: "",
          time: "",
          order: 1,
          createdAt: new Date().toISOString(),
        },
        {
          id: 3,
          title: "Late Running",
          content: "Hey {{name}}, I'm running about {{minutes}} minutes late. Sorry!",
          info: "",
          time: "",
          order: 2,
          createdAt: new Date().toISOString(),
        },
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
      return defaults;
    }

    const parsed = JSON.parse(stored) as Partial<LocalTemplate>[];
    const normalized = parsed.map((template, index) => ({
      ...template,
      info: typeof template.info === "string" ? template.info : "",
      time: typeof template.time === "string" ? template.time : "",
      order: typeof template.order === "number" ? template.order : index,
    })) as LocalTemplate[];

    // Persist the new optional fields/order for templates saved by older versions.
    if (JSON.stringify(parsed) !== JSON.stringify(normalized)) {
      saveTemplatesToStorage(normalized);
    }
    return normalized;
  } catch {
    return [];
  }
}

function saveTemplatesToStorage(templates: LocalTemplate[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

function getNextId(templates: LocalTemplate[]): number {
  if (templates.length === 0) return 1;
  return Math.max(...templates.map((t) => t.id)) + 1;
}

export function useTemplates() {
  return useQuery({
    queryKey: ["templates"],
    queryFn: async () => {
      return getTemplatesFromStorage().sort((a, b) => a.order - b.order);
    },
    staleTime: 0,
  });
}

export function useTemplate(id: number) {
  return useQuery({
    queryKey: ["templates", id],
    queryFn: async () => {
      const templates = getTemplatesFromStorage();
      return templates.find((t) => t.id === id) || null;
    },
    enabled: !!id,
  });
}

export function useCreateTemplate() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertTemplate) => {
      const templates = getTemplatesFromStorage();
      const newTemplate: LocalTemplate = {
        id: getNextId(templates),
        title: data.title,
        content: data.content,
        info: data.info,
        time: data.time,
        order: templates.length === 0
          ? 0
          : Math.max(...templates.map((template) => template.order)) + 1,
        createdAt: new Date().toISOString(),
      };
      templates.push(newTemplate);
      saveTemplatesToStorage(templates);
      return newTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      toast({
        title: "Template created",
        description: "Your new message template is ready to use.",
      });
    },
    onError: (err) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message,
      });
    },
  });
}

export function useUpdateTemplate() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertTemplate>) => {
      const templates = getTemplatesFromStorage();
      const index = templates.findIndex((t) => t.id === id);
      if (index === -1) throw new Error("Template not found");

      templates[index] = { ...templates[index], ...updates };
      saveTemplatesToStorage(templates);
      return templates[index];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      toast({
        title: "Template updated",
        description: "Changes have been saved successfully.",
      });
    },
    onError: (err) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message,
      });
    },
  });
}

export function useReorderTemplates() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      sourceId,
      targetId,
      position = "before",
    }: {
      sourceId: number;
      targetId: number;
      position?: "before" | "after";
    }) => {
      const templates = getTemplatesFromStorage();
      const orderedTemplates = [...templates].sort((a, b) => a.order - b.order);
      const sourceIndex = orderedTemplates.findIndex((template) => template.id === sourceId);
      const targetIndex = orderedTemplates.findIndex((template) => template.id === targetId);
      if (sourceIndex === -1 || targetIndex === -1) throw new Error("Template not found");

      const [source] = orderedTemplates.splice(sourceIndex, 1);
      const nextTargetIndex = orderedTemplates.findIndex((template) => template.id === targetId);
      orderedTemplates.splice(position === "after" ? nextTargetIndex + 1 : nextTargetIndex, 0, source);
      orderedTemplates.forEach((template, index) => {
        template.order = index;
      });
      saveTemplatesToStorage(orderedTemplates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
    onError: (err) => {
      toast({
        variant: "destructive",
        title: "Could not reorder templates",
        description: err.message,
      });
    },
  });
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const templates = getTemplatesFromStorage();
      const filtered = templates.filter((t) => t.id !== id);
      if (filtered.length === templates.length) throw new Error("Template not found");
      saveTemplatesToStorage(filtered);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      toast({
        title: "Template deleted",
        description: "The template has been removed.",
      });
    },
    onError: (err) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message,
      });
    },
  });
}
