import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  getTemplatesFromStorage,
  saveTemplatesToStorage,
  STORAGE_KEY,
} from "@/lib/storage";
import type { InsertTemplate, LocalTemplate } from "@/lib/template-types";

export type { InsertTemplate, LocalTemplate };
export { STORAGE_KEY };

export function singleLine(value: string): string {
  return value.replace(/\r?\n/g, " ").trim();
}

const EXPORT_HEADER =
  "# FlySend WA Templates\n# Plain text export - each template is imported as a new template\n\n";

export function serializeTemplates(templates: LocalTemplate[]): string {
  return (
    EXPORT_HEADER +
    templates
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((template) => {
        const metadata = [
          "[TEMPLATE]",
          `Title: ${singleLine(template.title)}`,
          template.info ? `Info: ${singleLine(template.info)}` : "",
          template.time ? `Time: ${singleLine(template.time)}` : "",
          "Content:",
        ].filter(Boolean);
        const content = template.content
          .replace(/\r\n/g, "\n")
          .split("\n")
          .map((line) => (line === "[/TEMPLATE]" ? "\\[/TEMPLATE]" : line))
          .join("\n");
        return `${metadata.join("\n")}\n${content}\n[/TEMPLATE]`;
      })
      .join("\n\n")
  );
}

export function parseTemplates(text: string): InsertTemplate[] {
  const blocks = Array.from(
    text.matchAll(/^\[TEMPLATE\]\r?\n([\s\S]*?)^\[\/TEMPLATE\]\s*$/gm),
  );
  if (blocks.length === 0) {
    throw new Error("No template blocks found. Choose a FlySend WA text export.");
  }
  return blocks.map((match, index) => {
    const block = match[1].replace(/^\r?\n/, "");
    const contentMarker = block.match(/(?:^|\r?\n)Content:\r?\n/);
    if (!contentMarker || contentMarker.index === undefined) {
      throw new Error(`Template ${index + 1} is missing its Content section.`);
    }
    const metadata = block.slice(0, contentMarker.index);
    const contentStart = contentMarker.index + contentMarker[0].length;
    const content = block
      .slice(contentStart)
      .replace(/\\\[\/TEMPLATE\]/g, "[/TEMPLATE]")
      .replace(/\r\n/g, "\n")
      .replace(/\n$/, "");
    const title = metadata.match(/(?:^|\r?\n)Title:\s*(.*)/)?.[1]?.trim();
    if (!title) {
      throw new Error(`Template ${index + 1} is missing a Title.`);
    }
    return {
      title,
      content,
      info: metadata.match(/(?:^|\r?\n)Info:\s*(.*)/)?.[1]?.trim() || "",
      time: metadata.match(/(?:^|\r?\n)Time:\s*(.*)/)?.[1]?.trim() || "",
    };
  });
}

function getNextId(templates: LocalTemplate[]): number {
  if (templates.length === 0) return 1;
  return Math.max(...templates.map((t) => t.id)) + 1;
}

export function useTemplates() {
  return useQuery({
    queryKey: ["templates"],
    queryFn: () => getTemplatesFromStorage().sort((a, b) => a.order - b.order),
    staleTime: 0,
    retry: false,
  });
}

export function useTemplate(id: number) {
  return useQuery({
    queryKey: ["templates", id],
    queryFn: () => {
      const templates = getTemplatesFromStorage();
      return templates.find((t) => t.id === id) || null;
    },
    enabled: !!id,
    retry: false,
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
        order: templates.length === 0 ? 0 : Math.max(...templates.map((t) => t.order)) + 1,
        createdAt: new Date().toISOString(),
      };
      saveTemplatesToStorage([...templates, newTemplate]);
      return newTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      toast({ title: "Template created", description: "Your new message template is ready to use." });
    },
    onError: (err) => toast({ variant: "destructive", title: "Error", description: err.message }),
  });
}

export function useImportTemplates() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (text: string) => {
      const importedTemplates = parseTemplates(text);
      const templates = getTemplatesFromStorage();
      const nextOrder = templates.length === 0 ? 0 : Math.max(...templates.map((t) => t.order)) + 1;
      const firstId = getNextId(templates);
      const newTemplates: LocalTemplate[] = importedTemplates.map((template, index) => ({
        ...template,
        id: firstId + index,
        order: nextOrder + index,
        createdAt: new Date().toISOString(),
      }));
      saveTemplatesToStorage([...templates, ...newTemplates]);
      return newTemplates.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      toast({
        title: "Templates imported",
        description: `${count} ${count === 1 ? "template was" : "templates were"} added to your list.`,
      });
    },
    onError: (err) => toast({ variant: "destructive", title: "Import failed", description: err.message }),
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
      const updated = { ...templates[index], ...updates };
      const next = [...templates];
      next[index] = updated;
      saveTemplatesToStorage(next);
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      toast({ title: "Template updated", description: "Changes have been saved successfully." });
    },
    onError: (err) => toast({ variant: "destructive", title: "Error", description: err.message }),
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
      const sourceIndex = orderedTemplates.findIndex((t) => t.id === sourceId);
      const targetIndex = orderedTemplates.findIndex((t) => t.id === targetId);
      if (sourceIndex === -1 || targetIndex === -1) throw new Error("Template not found");

      const [source] = orderedTemplates.splice(sourceIndex, 1);
      const nextTargetIndex = orderedTemplates.findIndex((t) => t.id === targetId);
      orderedTemplates.splice(position === "after" ? nextTargetIndex + 1 : nextTargetIndex, 0, source);

      const reordered = orderedTemplates.map((template, index) => ({ ...template, order: index }));
      saveTemplatesToStorage(reordered);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["templates"] }),
    onError: (err) => toast({ variant: "destructive", title: "Could not reorder templates", description: err.message }),
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
      toast({ title: "Template deleted", description: "The template has been removed." });
    },
    onError: (err) => toast({ variant: "destructive", title: "Error", description: err.message }),
  });
}
