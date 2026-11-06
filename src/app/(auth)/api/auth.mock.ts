import { mockApiError, mockAccounts, mockSession } from "@/app/(main)/profile/api/profile.mock";
import { ENDPOINTS, mockReply, type MockRoute } from "@/lib/http";
import { mockTimestamp } from "@/mocks/utils";
import type { LoginInput, RegisterInput } from "../types";

function objectId(): string {
  return Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
}

export const authMock: MockRoute[] = [
  {
    method: "POST",
    path: ENDPOINTS.auth.login,
    handler: ({ body }) => {
      const { email, password } = body as LoginInput;
      const account = mockAccounts.find((item) => item.user.email === email.trim().toLowerCase());
      if (!account || account.password !== password) {
        return mockApiError(401, "INVALID_CREDENTIALS", "Invalid email or password");
      }
      mockSession.account = account;
      return mockReply({ user: account.user, token: "mock-token" });
    },
  },
  {
    method: "POST",
    path: ENDPOINTS.auth.register,
    handler: ({ body }) => {
      const input = body as RegisterInput;
      const email = input.email.trim().toLowerCase();
      if (mockAccounts.some((item) => item.user.email === email)) {
        return mockApiError(409, "EMAIL_ALREADY_EXISTS", "Email already exists");
      }
      const now = mockTimestamp();
      const account = {
        user: {
          id: objectId(),
          name: input.name.trim(),
          email,
          timezone: input.timezone ?? "Africa/Cairo",
          createdAt: now,
          updatedAt: now,
        },
        password: input.password,
      };
      mockAccounts.push(account);
      mockSession.account = account;
      return mockReply({ user: account.user, token: "mock-token" }, 201);
    },
  },
];
