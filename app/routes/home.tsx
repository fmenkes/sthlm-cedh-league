import { Link } from "react-router";
import type { Route } from "./+types/home";
import { createClient } from "~/utils/supabase.server";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function loader({ context, request }: Route.LoaderArgs) {
  const { supabase } = createClient(request);

  const { data: leagues } = await supabase.from("leagues").select();

  return { message: context.VALUE_FROM_NETLIFY, leagues };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { leagues } = loaderData;

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1 className="text-4xl mb-4">Leagues</h1>
      {(leagues || []).map((league) => (
        <div key={league.id}>
          <Link to={`/leagues/${league.id}`} className="underline text-blue-600 visited:text-purple-600">{league.name}</Link>
        </div>
      ))}
    </main>
  );
}
