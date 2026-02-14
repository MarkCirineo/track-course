import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/password-input";

export const metadata = {
  title: "Log in",
  description: "Log in to Trackman Course Map",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const session = await auth();
  if (session?.user) redirect((await searchParams).callbackUrl ?? "/courses");

  const { callbackUrl, error } = await searchParams;

  return (
    <main className="container mx-auto flex max-w-sm flex-col gap-6 px-4 py-16">
      <h1 className="text-2xl font-semibold">Log in</h1>
      {error === "CredentialsSignin" && (
        <p className="text-sm text-destructive">Invalid email or password. Please try again.</p>
      )}
      <form
        className="flex flex-col gap-4"
        action={async (formData) => {
          "use server";
          await signIn("credentials", {
            email: formData.get("email") as string,
            password: formData.get("password") as string,
            redirectTo: callbackUrl ?? "/courses",
          });
        }}
      >
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
          <PasswordInput id="password" name="password" autoComplete="current-password" required />
        </div>
        <Button type="submit">Log in</Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </main>
  );
}
