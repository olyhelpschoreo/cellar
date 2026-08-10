// Backup / restore. The whole collection (plants + events, photos included as
// data URLs) serializes to a single JSON file the user can save and re-import —
// real insurance for a local-first app, and a way to move to a new device.

import { todayISO } from "./care";
import type { CellarSnapshot } from "./store";

const APP = "cellar";
const VERSION = 1;

interface BackupFile {
  app: typeof APP;
  version: number;
  exportedAt: string;
  data: CellarSnapshot;
}

export function buildBackup(snapshot: CellarSnapshot): BackupFile {
  return {
    app: APP,
    version: VERSION,
    exportedAt: new Date().toISOString(),
    data: { plants: snapshot.plants, events: snapshot.events },
  };
}

export function backupFilename(): string {
  return `cellar-backup-${todayISO()}.json`;
}

/** Serialize + trigger a download of the whole collection. */
export function downloadBackup(snapshot: CellarSnapshot): void {
  const blob = new Blob([JSON.stringify(buildBackup(snapshot), null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = backupFilename();
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * Parse a backup file's text into a snapshot. Accepts both the wrapped export
 * shape ({app, version, data}) and a bare {plants, events}. Throws a friendly
 * message on anything that isn't a Cellar backup.
 */
export function parseBackup(text: string): CellarSnapshot {
  let obj: unknown;
  try {
    obj = JSON.parse(text);
  } catch {
    throw new Error("That file isn't valid JSON.");
  }
  const record = obj as { data?: unknown; plants?: unknown; events?: unknown };
  const data = (record?.data ?? record) as { plants?: unknown; events?: unknown };
  if (!data || !Array.isArray(data.plants) || !Array.isArray(data.events)) {
    throw new Error("This doesn't look like a Cellar backup.");
  }
  return { plants: data.plants, events: data.events };
}
