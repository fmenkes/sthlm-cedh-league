import { createClient } from "~/utils/supabase.server";
import type { Route } from "./+types/season";

export async function loader({ params, request }: Route.LoaderArgs) {
  const { supabase } = createClient(request);

  const { data: season } = await supabase
    .from("season")
    .select(
      `
      id,
      name,
      starts_at,
      ends_at,
      game ( 
        id,
        played_at,
        winner ( id, name ),
        game_player (
          player ( id, name )
        )
      )
    `
    )
    .eq("id", parseInt(params.seasonId))
    .single();

  if (!season) {
    throw new Response("Season not found", {
      status: 404,
    });
  }

  return { season };
}

export default function Season({ loaderData }: Route.ComponentProps) {
  const { season } = loaderData;

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1 className="text-4xl mb-4">{season.name}</h1>
      <span>
        {season.starts_at} - {season.ends_at}
      </span>
      {season.game.map((game) => (
        <div key={game.id} className="mt-4">
          <h2 className="text-2xl mb-2">{game.played_at}</h2>
          <ul className="mb-2">
            {game.game_player.map((gamePlayer) => (
              <li key={gamePlayer.player.id}>
                {gamePlayer.player.id === game.winner?.id && "🏆 "}
                {gamePlayer.player.name}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </main>
  );
}
