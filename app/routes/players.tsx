import { createClient } from "~/utils/supabase.server";
import type { Route } from "./+types/players";

export async function loader({ request }: Route.LoaderArgs) {
  const { searchParams } = new URL(request.url);
  const season = searchParams.get("season");

  const { supabase } = createClient(request);

  if (season && !isNaN(Number(season))) {
    const { data: players } = await supabase
      .rpc("get_player_stats_by_season", { season_id: Number(season) })
      .order("win_percentage", { ascending: false });

    return { players };
  } else {
    const { data: players } = await supabase
      .from("player_win_loss_draw_view")
      .select()
      .order("win_percentage", { ascending: false });

    return { players };
  }
}

export default function Players({ loaderData }: Route.ComponentProps) {
  const { players } = loaderData;

  return (
    <main className="pt-16 p-4 container mx-auto">
      <span className="block pb-8 pl-4">
        Only players with at least 10 games played are shown.
      </span>
      <div className="overflow-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Games</th>
              <th>Wins</th>
              <th>Losses</th>
              <th>Draws</th>
              <th>Win %</th>
            </tr>
          </thead>
          <tbody>
            {players?.map((player) => (
              <tr key={player.id}>
                <td>{player.name}</td>
                <td>{player.games_played}</td>
                <td>{player.wins}</td>
                <td>{player.losses}</td>
                <td>{player.draws}</td>
                <td>{player.win_percentage}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
