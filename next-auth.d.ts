import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: "TEACHER" | "TA" | "STUDENT";
    };
  }

  interface User {
    role: "TEACHER" | "TA" | "STUDENT";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "TEACHER" | "TA" | "STUDENT";
  }
}
