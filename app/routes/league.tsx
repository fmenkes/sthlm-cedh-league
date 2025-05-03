import { createClient } from "~/utils/supabase.server";
import type { Route } from "./+types/league";

export async function loader({ params, request }: Route.LoaderArgs) {
  const { supabase } = createClient(request);

  const { data: league } = await supabase
    .from("leagues")
    .select()
    .eq("id", parseInt(params.leagueId))
    .single();

  if (!league) {
    throw new Response("League not found", {
      status: 404,
    });
  }

  return { league };
}

export default function League({ loaderData }: Route.ComponentProps) {
  const { league } = loaderData;

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1 className="text-4xl mb-4">{league.name}</h1>
      <span>{league.starts_at} - {league.ends_at}</span>
    </main>
  );
}
