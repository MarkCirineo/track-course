import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/account/bookmarks");
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <nav className="mb-6 flex gap-4 border-b pb-4">
        <Link href="/account/bookmarks" className="text-muted-foreground hover:text-foreground">
          Bookmarks
        </Link>
        <Link href="/account/played" className="text-muted-foreground hover:text-foreground">
          Played
        </Link>
        <Link href="/account/favorites" className="text-muted-foreground hover:text-foreground">
          Favorites
        </Link>
      </nav>
      {children}
    </main>
  );
}
