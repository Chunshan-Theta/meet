import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form, FormInput, FormItem, FormLabel } from "@/components/ui/form";

export default function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  async function login(formData: FormData) {
    "use server";

    try {
      await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirectTo: "/dashboard",
      });
    } catch (error) {
      if (error instanceof AuthError) {
        console.error("Login error:", error);
        redirect(`/login?error=${encodeURIComponent("帳號或密碼錯誤")}`);
      }

      throw error;
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center p-4">
      <Card className="w-full space-y-4">
        <h1 className="text-xl font-semibold">登入</h1>
        <Form action={login}>
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormInput name="email" type="email" required />
          </FormItem>
          <FormItem>
            <FormLabel>Password</FormLabel>
            <FormInput name="password" type="password" required />
          </FormItem>
          {searchParams.error ? <p className="text-sm text-red-600">{searchParams.error}</p> : null}
          <Button type="submit" className="w-full">
            Sign In
          </Button>
        </Form>
        <p className="text-xs text-slate-500">測試帳號: teacher@example.com / teacher123</p>
      </Card>
    </main>
  );
}
