import { createClient } from "~/utils/supabase.server";
import type { Route } from "./+types/player";
import { UNKNOWN_DECK_IMAGE_URL } from "~/constants";

export async function loader({ params, request }: Route.LoaderArgs) {
  const { supabase } = createClient(request);

  const { data: player } = await supabase
    .from("player")
    .select(
      `
      id,
      name
    `
    )
    .eq("id", parseInt(params.playerId))
    .single();

  const { data: decks } = await supabase
    .rpc("get_player_deck_stats", {
      p_player_id: parseInt(params.playerId),
    })
    .order("games_played", { ascending: false });

  if (!player) {
    throw new Response("Player not found", {
      status: 404,
    });
  }

  return { player, decks };
}

export default function Player({ loaderData }: Route.ComponentProps) {
  const { player, decks } = loaderData;

  console.log(decks);

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1 className="text-4xl mb-4">{player.name}</h1>
      <h2 className="text-2xl mb-4">Deck Stats</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {decks && decks.length > 0 ? (
          decks.map((deck: any) => (
            <div
              className="card bg-base-200 shadow-sm h-48 relative"
              key={deck.nickname || "unknown-deck"}
            >
              {deck.commander_art_crop && deck.partner_art_crop ? (
                <div className="absolute inset-0 flex">
                  <img
                    className="object-top object-cover h-full w-1/2 rounded-l-md"
                    style={{ filter: "brightness(50%)" }}
                    src={deck.commander_art_crop}
                  />
                  <img
                    className="object-top object-cover h-full w-1/2 rounded-r-md"
                    style={{ filter: "brightness(50%)" }}
                    src={deck.partner_art_crop}
                  />
                </div>
              ) : deck.commander_art_crop ? (
                <div className="absolute inset-0 flex">
                  <img
                    className="object-top object-cover h-full w-full rounded-md"
                    style={{ filter: "brightness(50%)" }}
                    src={deck.commander_art_crop || ""}
                  />
                </div>
              ) : (
                <div className="absolute inset-0 flex">
                  <img
                    className="object-top object-cover h-full w-full rounded-md"
                    style={{ filter: "brightness(50%)" }}
                    src={UNKNOWN_DECK_IMAGE_URL}
                  />
                </div>
              )}
              <div
                className={`card-body z-10 relative text-white flex flex-col justify-between`}
              >
                <h2 className="card-title">{deck.nickname || "Unknown deck"}</h2>
                <div className="flex flex-col">
                  <span>Games Played: {deck.games_played}</span>
                  <span>
                    Record: {deck.wins} / {deck.losses} / {deck.draws}
                  </span>
                  <span>
                    Win Percentage:{" "}
                    {deck.games_played > 0
                      ? ((deck.wins / deck.games_played) * 100).toFixed(2)
                      : "0"}
                    %
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No deck stats available for this player.</p>
        )}
      </div>
    </main>
  );
}
