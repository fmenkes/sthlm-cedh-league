import { redirect, type LoaderFunctionArgs } from "react-router";
import { createClient } from "~/utils/supabase.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const requestUrl = new URL(request.url);
  const hash = requestUrl.searchParams.get("token_hash");
  const { supabase, headers } = createClient(request);

  if (hash) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: hash,
      type: 'email',
    })
    if (!error) {
      return redirect("/", { headers });
    }
  }
  

  return redirect("/auth/error", { headers });
}