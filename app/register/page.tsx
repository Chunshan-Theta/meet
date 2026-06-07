import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form, FormInput, FormItem, FormLabel } from "@/components/ui/form";
import { Select } from "@/components/ui/select";

const RegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["TEACHER", "TA", "STUDENT"]).default("STUDENT"),
});

export default function RegisterPage({ searchParams }: { searchParams: { error?: string } }) {
  async function register(formData: FormData) {
    "use server";

    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      role: String(formData.get("role") ?? "STUDENT"),
    };

    const parsed = RegisterSchema.safeParse(payload);
    if (!parsed.success) {
      redirect(`/register?error=${encodeURIComponent("輸入格式錯誤")}`);
    }

    const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (existing) {
      redirect(`/register?error=${encodeURIComponent("Email 已被使用")}`);
    }

    const hashed = await bcrypt.hash(parsed.data.password, 10);
    await prisma.user.create({
      data: {
        email: parsed.data.email,
        name: parsed.data.name,
        password: hashed,
        role: parsed.data.role,
      },
    });

    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center p-4">
      <Card className="w-full space-y-4">
        <h1 className="text-xl font-semibold">註冊</h1>
        <Form action={register}>
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormInput name="name" required />
          </FormItem>
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormInput name="email" type="email" required />
          </FormItem>
          <FormItem>
            <FormLabel>Password</FormLabel>
            <FormInput name="password" type="password" required />
          </FormItem>
          <FormItem>
            <FormLabel>身份</FormLabel>
            <Select name="role" defaultValue="STUDENT">
              <option value="STUDENT">學生 (STUDENT)</option>
              <option value="TA">助教 (TA)</option>
              <option value="TEACHER">老師 (TEACHER)</option>
            </Select>
          </FormItem>
          {searchParams.error ? <p className="text-sm text-red-600">{searchParams.error}</p> : null}
          <Button type="submit" className="w-full">
            Register
          </Button>
        </Form>
      </Card>
    </main>
  );
}
