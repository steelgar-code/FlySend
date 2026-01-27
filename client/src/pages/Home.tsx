import { Link } from "wouter";
import { useTemplates } from "@/hooks/use-templates";
import { TemplateCard } from "@/components/TemplateCard";
import { Plus, Search, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function Home() {
  const { data: templates, isLoading, isError } = useTemplates();
  const [search, setSearch] = useState("");

  const filteredTemplates = templates?.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase()) || 
    t.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pb-20 sm:pb-8">
      {/* Header with Search */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src="/icon-192.png" alt="FlySend WA" className="w-10 h-10 rounded-lg" />
              <div>
                <h1 className="text-2xl font-bold font-display text-foreground">
                  FlySend WA
                </h1>
                <p className="text-sm text-muted-foreground hidden sm:block">
                  Send repeated WhatsApp messages faster.
                </p>
              </div>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search templates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-secondary/50 border-transparent focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-sm"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-muted-foreground font-medium">Loading templates...</p>
          </div>
        ) : isError ? (
          <div className="text-center py-12">
            <div className="bg-destructive/10 text-destructive rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold">Something went wrong</h3>
            <p className="text-muted-foreground mt-2">Could not load templates.</p>
          </div>
        ) : filteredTemplates?.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-secondary rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <Plus className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold font-display text-foreground">No templates yet</h3>
            <p className="text-muted-foreground mt-2 max-w-sm mx-auto mb-8">
              Create your first message template to get started. Use variables like {"{{name}}"} for dynamic content.
            </p>
            <Link href="/create" className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create Template
            </Link>
          </div>
        ) : (
          <AnimatePresence>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates?.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          </AnimatePresence>
        )}
      </main>

      {/* Mobile FAB */}
      <Link href="/create">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg shadow-primary/30 flex items-center justify-center z-50 sm:hidden"
        >
          <Plus className="w-6 h-6" />
        </motion.button>
      </Link>
    </div>
  );
}
