import { createClient } from "~/utils/supabase.server";
import type { Route } from "./+types/players";

export async function loader({ request }: Route.LoaderArgs) {
  const { supabase } = createClient(request);

  const { data: players } = await supabase
    .from("player_win_loss_draw_view")
    .select()
    .order("win_percentage", { ascending: false });

  return { players };
}

export default function Players({ loaderData }: Route.ComponentProps) {
  const { players } = loaderData;

  return (
    <main className="pt-16 p-4 container mx-auto">
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
    </main>
  );
}
