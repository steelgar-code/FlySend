import { Link } from "wouter";
import { MessageCircle, Edit2, Trash2, ArrowRight, ChevronDown, ChevronUp, GripVertical, Clock } from "lucide-react";
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
import { useDeleteTemplate, type LocalTemplate } from "@/hooks/use-templates";
import { useState } from "react";
import { motion } from "framer-motion";

interface TemplateCardProps {
  template: LocalTemplate;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMove: (direction: "up" | "down") => void;
  onDragStart: () => void;
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  onDrop: () => void;
  isDragging: boolean;
}

export function TemplateCard({
  template,
  canMoveUp,
  canMoveDown,
  onMove,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging,
}: TemplateCardProps) {
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
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={`group relative bg-card rounded-2xl p-6 border border-border/50 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300 ${
        isDragging ? "opacity-50 ring-2 ring-primary/30" : ""
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="min-w-0 pr-3">
          <div className="flex items-start gap-2">
            <GripVertical
              aria-hidden="true"
              className="w-4 h-4 mt-1 shrink-0 text-muted-foreground/50 cursor-grab active:cursor-grabbing"
            />
            <div className="min-w-0">
              <h3 className="text-xl font-bold font-display text-foreground group-hover:text-primary transition-colors">
                {template.title}
              </h3>
              {template.info && (
                <p className="text-xs text-muted-foreground mt-1 truncate">{template.info}</p>
              )}
              {template.time && (
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 shrink-0" />
                  <span className="truncate">{template.time}</span>
                </p>
              )}
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
          </div>
        </div>
        
        <div className="flex items-center gap-1 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            aria-label={`Move ${template.title} up`}
            disabled={!canMoveUp}
            onClick={() => onMove("up")}
            className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            type="button"
            aria-label={`Move ${template.title} down`}
            disabled={!canMoveDown}
            onClick={() => onMove("down")}
            className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
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
