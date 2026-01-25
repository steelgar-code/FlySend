import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTemplateSchema, type InsertTemplate } from "@shared/schema";
import { useCreateTemplate } from "@/hooks/use-templates";
import { useLocation } from "wouter";
import { ArrowLeft, Save, HelpCircle } from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function CreateTemplate() {
  const [, setLocation] = useLocation();
  const createMutation = useCreateTemplate();

  const form = useForm<InsertTemplate>({
    resolver: zodResolver(insertTemplateSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  const onSubmit = async (data: InsertTemplate) => {
    await createMutation.mutateAsync(data);
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </Link>
            <h1 className="text-xl font-bold font-display">New Template</h1>
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
                  <FormDescription>
                    A short name to identify this template.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-base font-semibold">Message Content</FormLabel>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1 text-xs font-medium text-primary cursor-help bg-primary/10 px-2 py-1 rounded-full">
                          <HelpCircle className="w-3 h-3" />
                          How to use variables
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="max-w-xs p-4">
                        <p>Wrap text in double curly braces to create a variable placeholder.</p>
                        <p className="mt-2 font-mono text-xs bg-muted p-2 rounded">
                          Hi {"{{name}}"}, your order {"{{order_id}}"} is ready!
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  
                  <FormControl>
                    <Textarea
                      placeholder="Hi {{name}}, just following up on..."
                      className="input-field min-h-[200px] resize-none text-base leading-relaxed font-mono"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Variables will become input fields when you use this template.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border/50 sm:relative sm:border-0 sm:bg-transparent sm:p-0">
              <div className="max-w-2xl mx-auto">
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="w-full btn-primary h-auto text-lg"
                >
                  {createMutation.isPending ? (
                    "Saving..."
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Save Template
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            {/* Spacer for mobile fixed button */}
            <div className="h-20 sm:hidden" />
          </form>
        </Form>
      </main>
    </div>
  );
}
