export type OrderStatus =
  | "NOT_STARTED"
  | "STARTED"
  | "IN_EDITING"
  | "IN_REVIEW"
  | "COMPLETED"
  | "CANCELLED";

export interface Order {
  id: string;
  customerName: string;
  shootDate: string;
  location: string;
  status: OrderStatus;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
  PHOTOGRAPHER = "PHOTOGRAPHER",
  EDITOR = "EDITOR",
}

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface CreateUserInput {
  id: string;
  email: string | null;
  name: string | null;
  avatar?: string | null;
  role: UserRole;
}

export interface Order {
  id: string;
  photographerId: string;
  editorId?: string;
  workspaceId: string;
  orderDate: string;
  scheduledDate: string;
  location: string;
  status: OrderStatus;
  requirements?: string;
  photoCount?: number;
  videoCount?: number;
  deliveryDate?: string;
}
