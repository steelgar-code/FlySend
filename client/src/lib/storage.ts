import type { LocalTemplate } from "./template-types";

export const STORAGE_KEY = "whatsapp-templates";
export const STORAGE_ERROR_EVENT = "flysend:storage-error";

export class StorageError extends Error {
  readonly operation: "read" | "write" | "reset";
  readonly rawData: string | null;

  constructor(
    operation: "read" | "write" | "reset",
    message: string,
    rawData: string | null = null,
  ) {
    super(message);
    this.name = "StorageError";
    this.operation = operation;
    this.rawData = rawData;
  }
}

const defaultTemplates: LocalTemplate[] = [
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

function emitStorageError(error: StorageError) {
  window.dispatchEvent(new CustomEvent(STORAGE_ERROR_EVENT, { detail: error }));
}

function normalizeTemplates(parsed: unknown): LocalTemplate[] {
  if (!Array.isArray(parsed)) {
    throw new StorageError("read", "Saved template data is not in a supported format.");
  }

  return parsed.map((template, index) => {
    if (!template || typeof template !== "object") {
      throw new StorageError("read", `Saved template ${index + 1} is invalid.`);
    }

    const value = template as Partial<LocalTemplate>;
    if (typeof value.id !== "number" || typeof value.title !== "string" || typeof value.content !== "string") {
      throw new StorageError("read", `Saved template ${index + 1} is missing required data.`);
    }

    return {
      ...value,
      info: typeof value.info === "string" ? value.info : "",
      time: typeof value.time === "string" ? value.time : "",
      order: typeof value.order === "number" ? value.order : index,
      createdAt: typeof value.createdAt === "string" ? value.createdAt : new Date().toISOString(),
    } as LocalTemplate;
  });
}

export function getTemplatesFromStorage(): LocalTemplate[] {
  let stored: string | null;

  try {
    stored = localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    const storageError = new StorageError(
      "read",
      "FlySend could not access browser storage. Your templates have not been changed.",
    );
    emitStorageError(storageError);
    throw storageError;
  }

  if (stored === null) {
    const defaults = defaultTemplates.map((template) => ({ ...template }));
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
    } catch (error) {
      const storageError = new StorageError(
        "write",
        "FlySend could not initialize browser storage. Your templates cannot be saved in this browser.",
      );
      emitStorageError(storageError);
      throw storageError;
    }
    return defaults;
  }

  try {
    const parsed = JSON.parse(stored) as unknown;
    const normalized = normalizeTemplates(parsed);

    // Preserve the existing data shape and migrate optional fields in place.
    if (JSON.stringify(parsed) !== JSON.stringify(normalized)) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      } catch {
        // A read is still safe; retry the migration on a later successful write.
      }
    }

    return normalized;
  } catch (error) {
    const storageError =
      error instanceof StorageError
        ? error
        : new StorageError(
            "read",
            "FlySend could not read its saved templates. The stored data may be corrupted.",
            stored,
          );
    emitStorageError(storageError);
    throw storageError;
  }
}

export function saveTemplatesToStorage(templates: LocalTemplate[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  } catch (error) {
    const storageError = new StorageError(
      "write",
      "FlySend could not save your changes. Browser storage may be full or unavailable.",
    );
    emitStorageError(storageError);
    throw storageError;
  }
}

export function getRawStorageData(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function resetTemplatesStorage(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  } catch {
    const storageError = new StorageError(
      "reset",
      "FlySend could not reset browser storage. Storage is unavailable.",
    );
    emitStorageError(storageError);
    throw storageError;
  }
}

export function downloadStorageData(): void {
  const raw = getRawStorageData();
  const payload =
    raw ??
    JSON.stringify(
      {
        application: "FlySend WA",
        storageKey: STORAGE_KEY,
        error: "Browser storage could not be read.",
        exportedAt: new Date().toISOString(),
      },
      null,
      2,
    );

  const blob = new Blob([payload], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `flysend-storage-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
