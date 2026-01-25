import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertTemplate, type Template } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useTemplates() {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: [api.templates.list.path],
    queryFn: async () => {
      const res = await fetch(api.templates.list.path, { credentials: "include" });
      if (!res.ok) {
        toast({
          variant: "destructive",
          title: "Error fetching templates",
          description: "Could not load your templates. Please try again."
        });
        throw new Error("Failed to fetch templates");
      }
      return api.templates.list.responses[200].parse(await res.json());
    },
  });
}

export function useTemplate(id: number) {
  return useQuery({
    queryKey: [api.templates.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.templates.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch template");
      return api.templates.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateTemplate() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertTemplate) => {
      const validated = api.templates.create.input.parse(data);
      const res = await fetch(api.templates.create.path, {
        method: api.templates.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.templates.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create template");
      }
      return api.templates.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.templates.list.path] });
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
      const validated = api.templates.update.input.parse(updates);
      const url = buildUrl(api.templates.update.path, { id });
      
      const res = await fetch(url, {
        method: api.templates.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.templates.update.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        if (res.status === 404) throw new Error("Template not found");
        throw new Error("Failed to update template");
      }
      return api.templates.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.templates.list.path] });
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

export function useDeleteTemplate() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.templates.delete.path, { id });
      const res = await fetch(url, { 
        method: api.templates.delete.method, 
        credentials: "include" 
      });
      
      if (res.status === 404) throw new Error("Template not found");
      if (!res.ok) throw new Error("Failed to delete template");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.templates.list.path] });
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
