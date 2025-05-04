import { createClient } from "~/utils/supabase.server";
import type { Route } from "./+types/players";
import { useOutletContext } from "react-router";
import type { User } from "@supabase/supabase-js";

export async function loader({ request, context }: Route.LoaderArgs) {
  const { supabase } = createClient(request);

  const { data: players } = await supabase
    .from("player_win_loss_draw_view")
    .select();

  return { players };
}

export default function Players({ loaderData }: Route.ComponentProps) {
  const { players } = loaderData;
  const { user } = useOutletContext<{ user: User }>();

  return (
    <main className="pt-16 p-4 container mx-auto">
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Wins</th>
            <th>Losses</th>
            <th>Draws</th>
          </tr>
        </thead>
        <tbody>
          {players?.map((player) => (
            <tr key={player.id}>
              <td>{player.name}</td>
              <td>{player.wins}</td>
              <td>{player.losses}</td>
              <td>{player.draws}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
