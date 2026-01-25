import { useState, useMemo } from "react";
import { useRoute, Link } from "wouter";
import { useTemplate } from "@/hooks/use-templates";
import { VariableInput } from "@/components/VariableInput";
import { ArrowLeft, Send, Copy, Check, Loader2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function SendTemplate() {
  const [, params] = useRoute("/send/:id");
  const id = parseInt(params?.id || "0");
  const { data: template, isLoading } = useTemplate(id);
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  // Store variable values: { "name": "John", "id": "123" }
  const [values, setValues] = useState<Record<string, string>>({});

  // Parse variables from template content
  const variables = useMemo(() => {
    if (!template) return [];
    // Match {{text}} globally
    const matches = template.content.match(/{{(.*?)}}/g) || [];
    // Remove brackets and get unique values
    return Array.from(new Set(matches.map(m => m.replace(/{{|}}/g, ""))));
  }, [template]);

  // Generate final message by replacing variables with values
  const finalMessage = useMemo(() => {
    if (!template) return "";
    let msg = template.content;
    variables.forEach(v => {
      // Replace all occurrences of {{v}} with value or placeholder
      const regex = new RegExp(`{{${v}}}`, 'g');
      msg = msg.replace(regex, values[v] || `[${v}]`);
    });
    return msg;
  }, [template, variables, values]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(finalMessage);
      setCopied(true);
      toast({ description: "Message copied to clipboard" });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({ variant: "destructive", description: "Failed to copy" });
    }
  };

  const handleWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(finalMessage)}`;
    window.open(url, "_blank");
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
            <div className="overflow-hidden">
              <h1 className="text-xl font-bold font-display truncate">{template.title}</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 pb-32">
        <div className="grid gap-8">
          {/* Variable Inputs */}
          {variables.length > 0 && (
            <div className="space-y-6">
              <div className="space-y-4">
                {variables.map((variable, idx) => (
                  <VariableInput
                    key={variable}
                    index={idx}
                    name={variable}
                    value={values[variable] || ""}
                    onChange={(val) => setValues(prev => ({ ...prev, [variable]: val }))}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Preview Card */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Preview</h3>
            <div className="bg-white dark:bg-slate-900 border border-border rounded-xl p-6 shadow-sm relative overflow-hidden">
              {/* Decorative "WhatsApp" background pattern hint could go here */}
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <MessageCircle className="w-24 h-24" />
              </div>
              
              <div className="relative z-10 whitespace-pre-wrap font-sans text-lg leading-relaxed">
                {finalMessage.split(/(\[.*?\])/g).map((part, i) => (
                  part.startsWith("[") && part.endsWith("]") ? (
                    <span key={i} className="bg-primary/10 text-primary px-1 rounded font-medium mx-0.5">
                      {part}
                    </span>
                  ) : (
                    <span key={i}>{part}</span>
                  )
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky Action Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border/50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="max-w-2xl mx-auto flex gap-3">
          <Button
            variant="secondary"
            className="flex-1 h-14 text-base rounded-xl border border-border/50"
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <Check className="w-5 h-5 mr-2 text-green-600" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-5 h-5 mr-2" />
                Copy
              </>
            )}
          </Button>

          <Button
            className="flex-[2] h-14 text-base rounded-xl btn-primary"
            onClick={handleWhatsApp}
          >
            <Send className="w-5 h-5 mr-2" />
            Send to WhatsApp
          </Button>
        </div>
      </div>
    </div>
  );
}
