import { Template } from "@shared/schema";
import { Link } from "wouter";
import { MessageCircle, Edit2, Trash2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useDeleteTemplate } from "@/hooks/use-templates";
import { useState } from "react";
import { motion } from "framer-motion";

interface TemplateCardProps {
  template: Template;
}

export function TemplateCard({ template }: TemplateCardProps) {
  const deleteMutation = useDeleteTemplate();
  const [isDeleting, setIsDeleting] = useState(false);

  // Extract variables to show a preview count
  const variables = (template.content.match(/{{(.*?)}}/g) || []).length;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync(template.id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group relative bg-card rounded-2xl p-6 border border-border/50 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold font-display text-foreground group-hover:text-primary transition-colors">
            {template.title}
          </h3>
          <p className="text-xs font-medium text-muted-foreground mt-1 flex items-center gap-1">
            {variables > 0 ? (
              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                {variables} {variables === 1 ? 'variable' : 'variables'}
              </span>
            ) : (
              <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                Static message
              </span>
            )}
          </p>
        </div>
        
        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <Link href={`/edit/${template.id}`} className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors">
            <Edit2 className="w-4 h-4" />
          </Link>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-lg transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-display">Delete Template?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete "{template.title}". This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <p className="text-muted-foreground line-clamp-3 mb-6 text-sm leading-relaxed">
        {template.content}
      </p>

      <Link href={`/send/${template.id}`} className="block">
        <Button className="w-full rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground font-semibold shadow-none hover:shadow-lg hover:shadow-primary/20 transition-all duration-200 group-hover:scale-[1.02]">
          <MessageCircle className="w-4 h-4 mr-2" />
          Use Template
          <ArrowRight className="w-4 h-4 ml-auto opacity-50 group-hover:opacity-100" />
        </Button>
      </Link>
    </motion.div>
  );
}
