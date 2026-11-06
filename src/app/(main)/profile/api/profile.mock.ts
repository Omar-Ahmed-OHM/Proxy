import { ENDPOINTS, mockReply, type MockResponse, type MockRoute } from "@/lib/http";
import { mockTimestamp } from "@/mocks/utils";
import type { ChangePasswordInput, MockAccount, MockSession, UpdateProfileInput } from "../types";

export const mockAccounts: MockAccount[] = [
  {
    user: {
      id: "665f1c2a9b1e8a0012345678",
      name: "Ahmed Mohamed",
      email: "ahmed@proxy.app",
      timezone: "Africa/Cairo",
      createdAt: mockTimestamp(-60 * 24 * 90),
      updatedAt: mockTimestamp(-60 * 24 * 3),
    },
    password: "password123",
  },
];

export const mockSession: MockSession = { account: mockAccounts[0] };

export function mockApiError(status: number, code: string, message: string): MockResponse {
  return { status, data: { error: { code, message } } };
}

function requireAccount(): MockAccount | MockResponse {
  return mockSession.account ?? mockApiError(401, "UNAUTHORIZED", "Authentication required");
}

function isAccount(value: MockAccount | MockResponse): value is MockAccount {
  return "user" in value;
}

export const profileMock: MockRoute[] = [
  {
    method: "GET",
    path: ENDPOINTS.users.me,
    handler: () => {
      const account = requireAccount();
      return isAccount(account) ? mockReply({ user: account.user }) : account;
    },
  },
  {
    method: "PATCH",
    path: ENDPOINTS.users.me,
    handler: ({ body }) => {
      const account = requireAccount();
      if (!isAccount(account)) return account;
      const input = body as UpdateProfileInput;
      account.user = {
        ...account.user,
        ...(input.name !== undefined && { name: input.name.trim() }),
        ...(input.timezone !== undefined && { timezone: input.timezone }),
        updatedAt: mockTimestamp(),
      };
      return mockReply({ user: account.user });
    },
  },
  {
    method: "PUT",
    path: ENDPOINTS.users.password,
    handler: ({ body }) => {
      const account = requireAccount();
      if (!isAccount(account)) return account;
      const input = body as ChangePasswordInput;
      if (input.currentPassword !== account.password) {
        return mockApiError(400, "INVALID_PASSWORD", "Current password is incorrect");
      }
      account.password = input.newPassword;
      return mockReply(null, 204);
    },
  },
  {
    method: "DELETE",
    path: ENDPOINTS.users.me,
    handler: () => {
      const account = requireAccount();
      if (!isAccount(account)) return account;
      mockAccounts.splice(mockAccounts.indexOf(account), 1);
      mockSession.account = null;
      return mockReply(null, 204);
    },
  },
];
