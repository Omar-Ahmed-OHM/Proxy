export interface Note {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export type CreateNoteInput = Pick<Note, "title" | "content"> & Partial<Pick<Note, "pinned" | "tags">>;

export type UpdateNoteInput = Pick<Note, "id"> & Partial<Omit<Note, "id" | "createdAt" | "updatedAt">>;
