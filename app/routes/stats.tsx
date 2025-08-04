import { createClient } from "~/utils/supabase.server";
import type { Route } from "./+types/stats";

export async function loader({ request }: Route.LoaderArgs) {
  const { supabase } = createClient(request);

  const { data: seatStats } = await supabase
    .from("seat_win_percentage_view")
    .select()
    .order("win_percentage", { ascending: false });

  return { seatStats };
}

export default function Players({ loaderData }: Route.ComponentProps) {
  const { seatStats } = loaderData;

  return (
    <main className="pt-16 p-4 container mx-auto overflow-auto">
      <h1 className="text-4xl mb-4">Winrate by seat</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Seat</th>
            <th>Wins</th>
            <th>Win %</th>
          </tr>
        </thead>
        <tbody>
          {seatStats?.map((seat) => (
            <tr key={seat.seat}>
              <td>{seat.seat}</td>
              <td>{seat.wins}</td>
              <td>{seat.win_percentage}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
