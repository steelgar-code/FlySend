import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUpdateTemplate, useTemplate, type InsertTemplate } from "@/hooks/use-templates";

const insertTemplateSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  info: z.string(),
  time: z.string(),
});
import { useLocation, useRoute } from "wouter";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

export default function EditTemplate() {
  const [, params] = useRoute("/edit/:id");
  const id = parseInt(params?.id || "0");
  const [, setLocation] = useLocation();
  
  const { data: template, isLoading } = useTemplate(id);
  const updateMutation = useUpdateTemplate();

  const form = useForm<InsertTemplate>({
    resolver: zodResolver(insertTemplateSchema),
    defaultValues: {
      title: "",
      content: "",
      info: "",
      time: "",
    },
  });

  // Reset form when data loads
  useEffect(() => {
    if (template) {
      form.reset({
        title: template.title,
        content: template.content,
        info: template.info,
        time: template.time,
      });
    }
  }, [template, form]);

  const onSubmit = async (data: InsertTemplate) => {
    await updateMutation.mutateAsync({ id, ...data });
    setLocation("/");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold">Template not found</h1>
        <Link href="/" className="text-primary hover:underline">Go Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </Link>
            <h1 className="text-xl font-bold font-display">Edit Template</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">Template Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Order Confirmation" 
                      className="input-field text-lg font-medium" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">Message Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Hi {{name}}..."
                      className="input-field min-h-[200px] resize-none text-base leading-relaxed font-mono"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Variables: Use {"{{variable_name}}"} to create placeholders.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-8 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="info"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">Info</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., For returning customers"
                        className="input-field"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Optional detail shown with the template.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">Time</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Weekdays at 9:00"
                        className="input-field"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Optional time information for regular messages.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border/50 sm:relative sm:border-0 sm:bg-transparent sm:p-0">
              <div className="max-w-2xl mx-auto">
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="w-full btn-primary h-auto text-lg"
                >
                  {updateMutation.isPending ? (
                    "Saving..."
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Update Template
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="h-20 sm:hidden" />
          </form>
        </Form>
      </main>
    </div>
  );
}
