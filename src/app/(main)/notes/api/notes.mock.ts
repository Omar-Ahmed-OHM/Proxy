import { ENDPOINTS, mockError, mockReply, type MockRoute } from "@/lib/http";
import { mockId, mockTimestamp, patchById, removeById } from "@/mocks/utils";
import type { CreateNoteInput, Note, UpdateNoteInput } from "../types";

export const notesDb: Note[] = [
  { id: "note_1", title: "Sprint ideas", content: "Dark mode polish, faster search, voice shortcuts.", pinned: true, tags: ["work", "ideas"], createdAt: mockTimestamp(-4320), updatedAt: mockTimestamp(-90) },
  { id: "note_2", title: "Groceries", content: "Milk, eggs, coffee beans, spinach.", pinned: false, tags: ["personal"], createdAt: mockTimestamp(-1440), updatedAt: mockTimestamp(-600) },
  { id: "note_3", title: "Book quotes", content: "Small steps make a big difference.", pinned: false, tags: ["reading"], createdAt: mockTimestamp(-10080), updatedAt: mockTimestamp(-2880) },
];

export const notesMock: MockRoute[] = [
  { method: "GET", path: ENDPOINTS.notes.list, handler: () => mockReply(notesDb) },
  {
    method: "GET",
    path: ENDPOINTS.notes.byId(":id"),
    handler: ({ params }) => {
      const note = notesDb.find((item) => item.id === params.id);
      return note ? mockReply(note) : mockError(404, "Note not found");
    },
  },
  {
    method: "POST",
    path: ENDPOINTS.notes.list,
    handler: ({ body }) => {
      const now = mockTimestamp();
      const note: Note = { pinned: false, tags: [], ...(body as CreateNoteInput), id: mockId("note"), createdAt: now, updatedAt: now };
      notesDb.unshift(note);
      return mockReply(note, 201);
    },
  },
  {
    method: "PATCH",
    path: ENDPOINTS.notes.byId(":id"),
    handler: ({ params, body }) => {
      const note = patchById(notesDb, params.id, { ...(body as Omit<UpdateNoteInput, "id">), updatedAt: mockTimestamp() });
      return note ? mockReply(note) : mockError(404, "Note not found");
    },
  },
  {
    method: "DELETE",
    path: ENDPOINTS.notes.byId(":id"),
    handler: ({ params }) => (removeById(notesDb, params.id) ? mockReply(null, 204) : mockError(404, "Note not found")),
  },
];
