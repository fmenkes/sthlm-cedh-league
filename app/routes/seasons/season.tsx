import { createClient } from "~/utils/supabase.server";
import type { Route } from "./+types/season";

export function meta({ data }: Route.MetaArgs) {
  return [
    { title: data.season.name },
    { name: "description", content: "STHLM CEDH LEAGUE" },
  ];
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const { searchParams } = new URL(request.url);
  const useStakeMethod = searchParams.get("scoringMethod") === "stake";

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
        draw,
        played_at,
        winner ( id, name ),
        game_player (
          player ( id, name ),
          seat
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

  const standings: { [key: number]: { name: string; score: number } } = {};

  if (useStakeMethod) {
    for (const game of season.game) {
      let stake = 0;
      for (const player of game.game_player) {
        if (!standings[player.player.id]) {
          standings[player.player.id] = {
            name: player.player.name!,
            score: 1000,
          };
        }

        const stakeShare = Math.round(standings[player.player.id].score * 0.08);

        stake += stakeShare;

        standings[player.player.id].score -= stakeShare;
      }

      if (game.winner) {
        standings[game.winner.id].score += stake;
      } else {
        for (const player of game.game_player) {
          standings[player.player.id].score += Math.round(
            stake / game.game_player.length
          );
        }
      }
    }
  } else {
    for (const game of season.game) {
      for (const player of game.game_player) {
        if (!standings[player.player.id]) {
          standings[player.player.id] = {
            name: player.player.name!,
            score: 100,
          };
        }

        if (game.winner?.id === player.player.id) {
          standings[player.player.id].score += 3;
        } else {
          standings[player.player.id].score -= 1;
        }
      }
    }
  }

  return { season, standings };
}

export default function Season({ loaderData }: Route.ComponentProps) {
  const { season, standings } = loaderData;

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1 className="text-4xl mb-4">{season.name}</h1>
      <span>
        {season.starts_at} - {season.ends_at}
      </span>
      <h2 className="text-2xl mt-4">Standings</h2>
      <ul className="mb-2">
        {Object.entries(standings)
          .sort(
            ([id_a, player_a], [id_b, player_b]) =>
              player_b.score - player_a.score
          )
          .map(([id, player]) => (
            <li key={id}>
              {player.name}: {player.score}
            </li>
          ))}
      </ul>
      {season.game.map((game) => (
        <div key={game.id} className="mt-4">
          <h2 className="text-2xl mb-2">{game.played_at}</h2>
          <ul className="mb-2">
            {game.game_player
              .sort((a, b) => (a.seat ?? 0) - (b.seat ?? 0))
              .map((gamePlayer) => (
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
