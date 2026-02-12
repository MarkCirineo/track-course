import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/password-input";
import bcrypt from "bcrypt";

export const metadata = {
  title: "Sign up",
  description: "Create an account",
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (session?.user) redirect("/courses");
  const { error } = await searchParams;

  return (
    <main className="container mx-auto flex max-w-sm flex-col gap-6 px-4 py-16">
      <h1 className="text-2xl font-semibold">Sign up</h1>
      {error === "EmailAlreadyExists" && (
        <p className="text-sm text-destructive">
          An account with this email already exists. Try logging in.
        </p>
      )}
      <form
        className="flex flex-col gap-4"
        action={async (formData) => {
          "use server";
          const email = (formData.get("email") as string)?.trim()?.toLowerCase();
          const password = formData.get("password") as string;
          const name = (formData.get("name") as string)?.trim() || null;
          if (!email || !password) return;
          const existing = await db.user.findUnique({ where: { email } });
          if (existing) {
            redirect("/signup?error=EmailAlreadyExists");
          }
          const hashed = await bcrypt.hash(password, 10);
          await db.user.create({
            data: { email, name, password: hashed },
          });
          redirect("/login?signedUp=1");
        }}
      >
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-sm font-medium">
            Name (optional)
          </label>
          <Input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Your name"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="new-password"
            required
            minLength={8}
          />
          <p className="text-xs text-muted-foreground">At least 8 characters</p>
        </div>
        <Button type="submit">Sign up</Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Log in
        </Link>
      </p>
    </main>
  );
}
