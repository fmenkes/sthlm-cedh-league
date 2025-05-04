import { Link } from "react-router";
import { createClient } from "~/utils/supabase.server";
import type { Route } from "./+types/index";

export async function loader({ request }: Route.LoaderArgs) {
  const { supabase } = createClient(request);

  const { data: seasons } = await supabase.from("season").select();

  return { seasons };
}

export default function Seasons({ loaderData }: Route.ComponentProps) {
  const { seasons } = loaderData;

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1 className="text-4xl mb-4">Seasons</h1>
      {(seasons || []).map((season) => (
        <div key={season.id} className="mb-4">
          <Link
            to={`/seasons/${season.id}`}
            className="underline text-blue-600 visited:text-purple-600"
          >
            {season.name}
          </Link>
        </div>
      ))}
    </main>
  );
}
