import { createClient } from "~/utils/supabase.server";
import type { Route } from "./+types/report";
import type { User } from "@supabase/supabase-js";
import { useFetcher, redirect, useOutletContext } from "react-router";
import { useState } from "react";
import dayjs from "dayjs";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

export async function loader({ request }: Route.LoaderArgs) {
  const { supabase } = createClient(request);

  const { data: players } = await supabase
    .from("player")
    .select()
    .order("name");

  const { data: seasons } = await supabase
    .from("season")
    .select("id, name")
    .order("starts_at", { ascending: false });

  return { players, seasons };
}

export async function action({ request }: Route.ActionArgs) {
  const data = await request.json();

  const { supabase } = createClient(request);
  const { newPlayers, existingPlayers, winner, draw, season, played_at } = data;

  if (newPlayers.length + existingPlayers.length !== 4) {
    return new Response("You must select 4 players", {
      status: 400,
    });
  }
  if (winner === null && !draw) {
    return new Response("You must select a winner or a draw", {
      status: 400,
    });
  }

  let allPlayers = existingPlayers;
  let winnerId = winner;

  if (newPlayers.length > 0) {
    const { data: newPlayerData, error: newPlayerError } = await supabase
      .from("player")
      .insert(newPlayers.map((name: string) => ({ name })))
      .select();
    if (newPlayerError) {
      return new Response(newPlayerError.message, {
        status: 500,
      });
    }
    if (typeof winner === "string") {
      winnerId = newPlayerData.find((player) => player.name === winner)?.id;
    }
    const newPlayerIds = newPlayerData.map((player) => player.id);
    allPlayers = [...existingPlayers, ...newPlayerIds];
  }

  const { data: gameData, error: gameError } = await supabase
    .from("game")
    .insert({
      winner: winnerId,
      draw,
      season,
      played_at,
    })
    .select();

  if (gameError) {
    return new Response(gameError.message, {
      status: 500,
    });
  }

  const { error } = await supabase.from("game_player").insert(
    allPlayers.map((playerId: number) => ({
      player_id: playerId,
      game_id: gameData?.[0].id,
    }))
  );

  if (error) {
    return new Response(error.message, {
      status: 500,
    });
  }

  return new Response(null, {
    status: 204,
  });
}

// scuffed but will do for now
export default function Report({ loaderData }: Route.ComponentProps) {
  const { players, seasons } = loaderData;
  const fetcher = useFetcher();
  const { user } = useOutletContext<{ user: User }>();
  const [selectedPlayers, setSelectedPlayers] = useState<{
    [key: number]: number | null;
  }>({
    0: null,
    1: null,
    2: null,
    3: null,
  });
  const [newPlayerChecked, setNewPlayerChecked] = useState<{
    [key: number]: boolean;
  }>({
    0: false,
    1: false,
    2: false,
    3: false,
  });
  const [newPlayerNames, setNewPlayerNames] = useState<{
    [key: number]: string;
  }>({
    0: "",
    1: "",
    2: "",
    3: "",
  });
  const [winner, setWinner] = useState<number | null>(null);
  const [draw, setDraw] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [season, setSeason] = useState<number>(seasons?.[0]?.id || 1);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return (
      <main className="pt-16 p-4 container mx-auto">
        <h1 className="text-4xl mb-4">
          You must be logged in to report a game
        </h1>
      </main>
    );
  }

  const clearForm = () => {
    setSelectedPlayers({
      0: null,
      1: null,
      2: null,
      3: null,
    });
    setNewPlayerChecked({
      0: false,
      1: false,
      2: false,
      3: false,
    });
    setNewPlayerNames({
      0: "",
      1: "",
      2: "",
      3: "",
    });
    setWinner(null);
    setDraw(false);
  };

  const handleSubmit = async () => {
    const newPlayers = [];
    const existingPlayers = [];
    for (const [key, checked] of Object.entries(newPlayerChecked)) {
      if (checked) {
        newPlayers.push(newPlayerNames[parseInt(key)]);
      } else {
        const player = selectedPlayers[parseInt(key)];
        if (player) {
          existingPlayers.push(selectedPlayers[parseInt(key)]);
        }
      }
    }

    if (newPlayers.length + existingPlayers.length !== 4) {
      setError("You must select 4 players");
      return;
    }

    if (winner === null && !draw) {
      setError("You must select a winner or a draw");
      return;
    }

    await fetcher.submit(
      {
        newPlayers,
        existingPlayers,
        winner: winner !== null
          ? (newPlayerNames[winner] || selectedPlayers[winner])
          : null,
        draw,
        season,
        played_at: dayjs(selectedDate).format("YYYY-MM-DD"),
      },
      {
        method: "POST",
        encType: "application/json",
      }
    );

    clearForm();
  };

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1 className="text-4xl mb-4">Report game</h1>
      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-4 md:col-span-1">
          <button
            popoverTarget="rdp-popover"
            className="input input-border w-full"
            style={{ anchorName: "--rdp" } as React.CSSProperties}
          >
            {selectedDate ? selectedDate.toLocaleDateString() : "Pick a date"}
          </button>
          <div
            popover="auto"
            id="rdp-popover"
            className="dropdown"
            style={{ positionAnchor: "--rdp" } as React.CSSProperties}
          >
            <DayPicker
              className="react-day-picker"
              mode="single"
              selected={selectedDate}
              onSelect={(date) => setSelectedDate(date ?? new Date())}
              required={false}
            />
          </div>
        </div>
        <div className="col-span-4 md:col-span-1">
          <select
            className="select w-full"
            onChange={(e) => setSeason(parseInt(e.target.value))}
            value={`${season || ""}`}
          >
            <option value="" disabled>
              Select a season
            </option>
            {seasons?.map((season) => (
              <option key={season.id} value={season.id}>
                {season.name}
              </option>
            ))}
          </select>
        </div>
        <div className="hidden md:col-span-2 md:block" />
        <h1 className="col-span-2">Player name</h1>
        <div />
        <h1>Winner?</h1>
        <div className="col-span-2">
          {newPlayerChecked[0] ? (
            <input
              className="input w-full"
              onChange={(e) => {
                setNewPlayerNames((players) => ({
                  ...players,
                  0: e.target.value,
                }));
              }}
            />
          ) : (
            <select
              className="select w-full"
              onChange={(e) =>
                setSelectedPlayers((players) => ({
                  ...players,
                  0: parseInt(e.target.value),
                }))
              }
              value={`${selectedPlayers[0] || ""}`}
            >
              <option disabled value="">
                Player 1
              </option>
              {players
                ?.filter(
                  (player) =>
                    ![
                      selectedPlayers[1],
                      selectedPlayers[2],
                      selectedPlayers[3],
                    ].includes(player.id)
                )
                .map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name}
                  </option>
                ))}
            </select>
          )}
        </div>
        <label className={`btn swap ${newPlayerChecked[0] ? "swap-active" : ""}`} onClick={() => {
          setNewPlayerChecked((players) => ({
            ...players,
            0: !players[0],
          }));
        }}>
          <span className="swap-off">New</span>
          <span className="swap-on">Existing</span>
        </label>
        <input
          type="radio"
          className="radio radio-success self-center"
          checked={winner === 0}
          onChange={() => setWinner(0)}
        />
        <div className="col-span-2">
          {newPlayerChecked[1] ? (
            <input
              className="input w-full"
              onChange={(e) => {
                setNewPlayerNames((players) => ({
                  ...players,
                  1: e.target.value,
                }));
              }}
            />
          ) : (
            <select
              className="select w-full"
              onChange={(e) =>
                setSelectedPlayers((players) => ({
                  ...players,
                  1: parseInt(e.target.value),
                }))
              }
              value={`${selectedPlayers[1] || ""}`}
            >
              <option value="" disabled>
                Player 2
              </option>
              {players
                ?.filter(
                  (player) =>
                    ![
                      selectedPlayers[0],
                      selectedPlayers[2],
                      selectedPlayers[3],
                    ].includes(player.id)
                )
                .map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name}
                  </option>
                ))}
            </select>
          )}
        </div>
        <label className={`btn swap ${newPlayerChecked[1] ? "swap-active" : ""}`} onClick={() => {
          setNewPlayerChecked((players) => ({
            ...players,
            1: !players[1],
          }));
        }}>
          <span className="swap-off">New</span>
          <span className="swap-on">Existing</span>
        </label>
        <input
          type="radio"
          className="radio radio-success self-center"
          checked={winner === 1}
          onChange={() => setWinner(1)}
        />
        <div className="col-span-2">
          {newPlayerChecked[2] ? (
            <input
              className="input w-full"
              onChange={(e) => {
                setNewPlayerNames((players) => ({
                  ...players,
                  2: e.target.value,
                }));
              }}
            />
          ) : (
            <select
              className="select w-full"
              onChange={(e) =>
                setSelectedPlayers((players) => ({
                  ...players,
                  2: parseInt(e.target.value),
                }))
              }
              value={`${selectedPlayers[2] || ""}`}
            >
              <option disabled value="">
                Player 3
              </option>
              {players
                ?.filter(
                  (player) =>
                    ![
                      selectedPlayers[0],
                      selectedPlayers[1],
                      selectedPlayers[3],
                    ].includes(player.id)
                )
                .map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name}
                  </option>
                ))}
            </select>
          )}
        </div>
        <label className={`btn swap ${newPlayerChecked[2] ? "swap-active" : ""}`} onClick={() => {
          setNewPlayerChecked((players) => ({
            ...players,
            2: !players[2],
          }));
        }}>
          <span className="swap-off">New</span>
          <span className="swap-on">Existing</span>
        </label>
        <input
          type="radio"
          className="radio radio-success self-center"
          checked={winner === 2}
          onChange={() => setWinner(2)}
        />
        <div className="col-span-2">
          {newPlayerChecked[3] ? (
            <input
              className="input w-full"
              onChange={(e) => {
                setNewPlayerNames((players) => ({
                  ...players,
                  3: e.target.value,
                }));
              }}
            />
          ) : (
            <select
              className="select w-full"
              onChange={(e) =>
                setSelectedPlayers((players) => ({
                  ...players,
                  3: parseInt(e.target.value),
                }))
              }
              value={`${selectedPlayers[3] || ""}`}
            >
              <option disabled value="">
                Player 4
              </option>
              {players
                ?.filter(
                  (player) =>
                    ![
                      selectedPlayers[0],
                      selectedPlayers[1],
                      selectedPlayers[2],
                    ].includes(player.id)
                )
                .map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name}
                  </option>
                ))}
            </select>
          )}
        </div>
        <label className={`btn swap ${newPlayerChecked[3] ? "swap-active" : ""}`} onClick={() => {
          setNewPlayerChecked((players) => ({
            ...players,
            3: !players[3],
          }));
        }}>
          <span className="swap-off">New</span>
          <span className="swap-on">Existing</span>
        </label>
        <input
          type="radio"
          className="radio radio-success self-center"
          checked={winner === 3}
          onChange={() => setWinner(3)}
        />
        <div className="col-span-4 p-2">
          <label className="label">
            <input
              type="checkbox"
              className="checkbox"
              checked={draw}
              onChange={() => {
                setDraw((d) => !d);
                setWinner(null);
              }}
            />
            Draw?
          </label>
        </div>
        <button className="btn btn-neutral" disabled={fetcher.state !== "idle"} onClick={handleSubmit}>
          Submit
        </button>
      </div>
      <div className="mt-4">
        {error && <span className="text-red-500">{error}</span>}
      </div>
    </main>
  );
}
