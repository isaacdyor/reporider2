import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { api } from "@/trpc/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!data.user) {
      return NextResponse.redirect(`${origin}/auth/auth-code-error`);
    }

    let user = await api.users.getCurrent();
    if (!user) {
      user = await api.users.create({
        email: data.user.email!,
        name: data.user.user_metadata.name as string,
        id: "unnecessary",
      });
    }

    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host"); // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === "development";
      let url: string;
      if (isLocalEnv || !forwardedHost) {
        url = `${origin}`;
      } else {
        url = `https://${forwardedHost}`;
      }
      if (!user?.githubInstallationId) {
        return NextResponse.redirect(`${url}/github/callback`);
      }
      return NextResponse.redirect(`${url}`);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
