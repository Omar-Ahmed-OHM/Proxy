import { ENDPOINTS, httpClient } from "@/lib/http";
import type { CreateNoteInput, Note, UpdateNoteInput } from "../types";

export function getNotes(signal?: AbortSignal) {
  return httpClient.get<Note[]>(ENDPOINTS.notes.list, { signal });
}

export function getNote(id: string, signal?: AbortSignal) {
  return httpClient.get<Note>(ENDPOINTS.notes.byId(id), { signal });
}

export function createNote(input: CreateNoteInput) {
  return httpClient.post<Note, CreateNoteInput>(ENDPOINTS.notes.list, input);
}

export function updateNote({ id, ...input }: UpdateNoteInput) {
  return httpClient.patch<Note>(ENDPOINTS.notes.byId(id), input);
}

export function deleteNote(id: string) {
  return httpClient.delete(ENDPOINTS.notes.byId(id));
}
