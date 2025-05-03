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

  const { data: seasons } = await supabase.from("season").select();

  return { message: context.VALUE_FROM_NETLIFY, seasons };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { seasons } = loaderData;

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1 className="text-4xl mb-4">Seasons</h1>
      {(seasons || []).map((season) => (
        <div key={season.id}>
          <Link to={`/seasons/${season.id}`} className="underline text-blue-600 visited:text-purple-600">{season.name}</Link>
        </div>
      ))}
    </main>
  );
}
