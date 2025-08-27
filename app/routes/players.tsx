import { createClient } from "~/utils/supabase.server";
import type { Route } from "./+types/players";
import { NavLink, useNavigation } from "react-router";
import { useRef } from "react";

export async function loader({ request }: Route.LoaderArgs) {
  const { searchParams } = new URL(request.url);
  const season = searchParams.get("season");

  const { supabase } = createClient(request);

  let players = null;

  const seasonIsValid = season && !isNaN(Number(season));

  if (seasonIsValid) {
    const { data } = await supabase
      .rpc("get_player_stats_by_season", { season_id: Number(season) })
      .order("win_percentage", { ascending: false });

    players = data;
  } else {
    const { data } = await supabase
      .from("player_win_loss_draw_view")
      .select()
      .order("win_percentage", { ascending: false });

    players = data;
  }

  const { data: seasons } = await supabase.from("season").select();

  return {
    players,
    seasons,
    currentSeason: seasonIsValid
      ? seasons?.find((s) => s.id === parseInt(season, 10) || null)
      : null,
  };
}

const DEFAULT_IMG_URL =
  "https://cards.scryfall.io/art_crop/front/c/7/c78c2713-39e7-4a6e-a132-027099a89665.jpg?1695757243";

export default function Players({ loaderData }: Route.ComponentProps) {
  const { players, seasons, currentSeason } = loaderData;
  const popoverRef = useRef<HTMLUListElement>(null);
  console.log("Players data:", players);

  return (
    <main className="pt-4 md:pt-16 p-4 container mx-auto">
      <div className="flex gap-2 flex-col md:flex-row justify-between items-end mb-4">
        <div />
        <button
          className="btn"
          popoverTarget="popover-season"
          style={{ anchorName: "--season-anchor" } as React.CSSProperties}
        >
          {currentSeason ? currentSeason.name : "All seasons"}
        </button>

        <ul
          ref={popoverRef}
          className="dropdown dropdown-end menu w-52 rounded-box bg-base-100 shadow-sm"
          popover="auto"
          id="popover-season"
          style={{ positionAnchor: "--season-anchor" } as React.CSSProperties}
        >
          <li key="all-seasons">
            <NavLink
              to="/players"
              className="no-underline whitespace-nowrap"
              onClick={() => popoverRef.current?.hidePopover()}
            >
              All seasons
            </NavLink>
          </li>
          {seasons?.map((season) => (
            <li key={season.id}>
              <NavLink
                to={`?season=${season.id}`}
                className="no-underline whitespace-nowrap"
                onClick={() => popoverRef.current?.hidePopover()}
              >
                {season.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
      <div className="overflow-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {players?.map((player) => (
            <div
              className="card bg-base-200 shadow-sm h-48 relative"
              key={player.id}
            >
              {player.commander_art_crop && player.partner_art_crop ? (
                <div className="absolute inset-0 flex">
                  <img
                    className="object-top object-cover h-full w-1/2 rounded-l-md"
                    style={{ filter: "brightness(50%)" }}
                    src={player.commander_art_crop}
                  />
                  <img
                    className="object-top object-cover h-full w-1/2 rounded-r-md"
                    style={{ filter: "brightness(50%)" }}
                    src={player.partner_art_crop}
                  />
                </div>
              ) : player.commander_art_crop ? (
                <div className="absolute inset-0 flex">
                  <img
                    className="object-top object-cover h-full w-full rounded-md"
                    style={{ filter: "brightness(50%)" }}
                    src={player.commander_art_crop}
                  />
                </div>
              ) : (
                <div className="absolute inset-0 flex">
                  <img
                    className="object-top object-cover h-full w-full rounded-md"
                    style={{ filter: "brightness(50%)" }}
                    src={DEFAULT_IMG_URL}
                  />
                </div>
              )}
              <div
                className={`card-body z-10 relative text-white flex flex-col justify-between`}
              >
                <h2 className="card-title">{player.name}</h2>
                <div className="flex flex-row justify-between items-center text-lg">
                  <span>
                    {player.wins} / {player.losses} / {player.draws}
                  </span>
                  <span>{player.win_percentage}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
