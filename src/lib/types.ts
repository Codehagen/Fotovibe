export const UserRole = {
  USER: "user",
  PHOTOGRAPHER: "photographer",
  EDITOR: "editor",
  ADMIN: "admin",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface CreateUserInput {
  id: string;
  email: string | null;
  name: string | null;
  avatar?: string | null;
  role: UserRole;
}
