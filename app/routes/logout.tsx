import { type LoaderFunctionArgs, redirect } from "react-router";
import { createClient } from "~/utils/supabase.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, headers } = createClient(request);

  const error = await supabase.auth.signOut();

  return redirect("/", { headers });
}
