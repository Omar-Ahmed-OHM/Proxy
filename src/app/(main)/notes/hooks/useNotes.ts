"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createNote, deleteNote, getNote, getNotes, updateNote } from "../api/notes.api";

export const noteKeys = {
  all: ["notes"] as const,
  detail: (id: string) => ["notes", id] as const,
};

export function useNotes() {
  return useQuery({ queryKey: noteKeys.all, queryFn: ({ signal }) => getNotes(signal) });
}

export function useNote(id: string) {
  return useQuery({
    queryKey: noteKeys.detail(id),
    queryFn: ({ signal }) => getNote(id, signal),
    enabled: Boolean(id),
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createNote,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: noteKeys.all }),
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateNote,
    onSuccess: (note) => {
      queryClient.setQueryData(noteKeys.detail(note.id), note);
      return queryClient.invalidateQueries({ queryKey: noteKeys.all });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteNote,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: noteKeys.all }),
  });
}
