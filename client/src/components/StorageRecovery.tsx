import { useEffect, useState } from "react";
import {
  downloadStorageData,
  resetTemplatesStorage,
  STORAGE_ERROR_EVENT,
  type StorageError,
} from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Download, RotateCcw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export function StorageRecovery() {
  const [error, setError] = useState<StorageError | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const handler = (event: Event) => {
      setError((event as CustomEvent<StorageError>).detail);
    };
    window.addEventListener(STORAGE_ERROR_EVENT, handler);
    return () => window.removeEventListener(STORAGE_ERROR_EVENT, handler);
  }, []);

  if (!error) return null;

  const handleReset = () => {
    if (!window.confirm(
      "Reset FlySend templates? This will replace the saved template data with an empty template list and cannot be undone."
    )) return;

    try {
      resetTemplatesStorage();
      setError(null);
      queryClient.clear();
      window.location.hash = "#/";
    } catch {
      // resetTemplatesStorage reports the storage failure.
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4">
      <div role="alertdialog" aria-modal="true" aria-labelledby="storage-error-title"
        className="w-full max-w-lg rounded-2xl border border-destructive/50 bg-card p-6 shadow-2xl">
        <h2 id="storage-error-title" className="text-lg font-bold">FlySend storage needs attention</h2>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          <Button type="button" variant="secondary" onClick={downloadStorageData}>
            <Download className="w-4 h-4 mr-2" />Download Storage Data
          </Button>
          <Button type="button" variant="destructive" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-2" />Reset Templates
          </Button>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Download the stored data before resetting if you want to keep a copy.
        </p>
      </div>
    </div>
  );
}
