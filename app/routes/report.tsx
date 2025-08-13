import { createClient } from "~/utils/supabase.server";
import type { Route } from "./+types/report";
import type { User } from "@supabase/supabase-js";
import { useFetcher, redirect, useOutletContext } from "react-router";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { Controller, FormProvider, useForm } from "react-hook-form";
import type { ReportFormInput } from "~/types/form";
import PlayerInput from "~/components/PlayerInput";
import { version } from "package.json";

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

  const { data: decks } = await supabase
    .from("deck")
    .select("id, nickname")
    .order("nickname");

  return { players, seasons, decks };
}

export async function action({ request }: Route.ActionArgs) {
  const data = await request.json();

  const { supabase } = createClient(request);
  const { newPlayers, existingPlayers, winner, draw, season, played_at } = data;

  if (newPlayers.length + existingPlayers.length !== 4) {
    return {
      ok: false,
      message: "You must select 4 players",
    };
  }
  if (winner === null && !draw) {
    return {
      ok: false,
      message: "You must select a winner or a draw",
    };
  }

  let allPlayers = existingPlayers;
  let winnerId = winner;

  if (newPlayers.length > 0) {
    const { data: newPlayerData, error: newPlayerError } = await supabase
      .from("player")
      .insert(
        newPlayers.map((player: { name: string }) => ({ name: player.name }))
      )
      .select();
    if (newPlayerError) {
      return {
        ok: false,
        message: newPlayerError.message,
      };
    }
    if (typeof winner === "string") {
      winnerId = newPlayerData.find((player) => player.name === winner)?.id;
    }
    const newPlayerIds = newPlayerData.map((player) => ({
      name: player.id,
      seat: newPlayers.find((p: { name: string }) => p.name === player.name)
        ?.seat,
    }));
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
    return {
      ok: false,
      message: gameError.message,
    };
  }

  const { error } = await supabase.from("game_player").insert(
    allPlayers.map(
      (player: { name: number; seat: number; deck: number | null }) => ({
        player_id: player.name,
        game_id: gameData?.[0].id,
        seat: player.seat,
        deck: player.deck,
      })
    )
  );

  if (error) {
    return {
      ok: false,
      message: error.message,
    };
  }

  return {
    ok: true,
    message: "Game reported successfully",
  };
}

export default function Report({ loaderData }: Route.ComponentProps) {
  const { players, seasons, decks } = loaderData;
  const methods = useForm<ReportFormInput>({
    defaultValues: {
      played_at: new Date(),
      season: seasons?.[0]?.id || 1,
      players: [
        { id: "", name: null, newPlayer: false, deck: null },
        { id: "", name: null, newPlayer: false, deck: null },
        { id: "", name: null, newPlayer: false, deck: null },
        { id: "", name: null, newPlayer: false, deck: null },
      ],
    },
  });
  const { control } = methods;
  const fetcher = useFetcher();
  const { user } = useOutletContext<{ user: User }>();

  if (!user) {
    return (
      <main className="pt-16 p-4 container mx-auto">
        <h1 className="text-4xl mb-4">
          You must be logged in to report a game
        </h1>
      </main>
    );
  }

  useEffect(() => {
    if (fetcher.data?.ok) {
      methods.reset();
    } else if (fetcher.data?.message) {
      methods.setError("root", {
        type: "manual",
        message: fetcher.data.message,
      });
    }
  }, [fetcher.data, methods]);

  const onSubmit = async (data: ReportFormInput) => {
    const { players, played_at, winner, draw, season } = data;
    const newPlayers = [];
    const existingPlayers = [];

    for (const [index, player] of data.players.entries()) {
      if (player.newPlayer) {
        if (!player.name || player.name.trim() === "") {
          methods.setError("root", {
            type: "manual",
            message: "Player name cannot be empty",
          });
          return;
        }
        newPlayers.push({
          seat: index + 1,
          name: player.name.trim(),
          deck: player.deck || null,
        });
      } else if (player.id) {
        existingPlayers.push({
          seat: index + 1,
          name: player.id,
          deck: player.deck || null,
        });
      }
    }

    if (newPlayers.length + existingPlayers.length !== 4) {
      methods.setError("root", {
        type: "manual",
        message: "You must select 4 players",
      });
      return;
    }

    if (typeof winner !== "number" && !draw) {
      methods.setError("root", {
        type: "manual",
        message: "You must select a winner or a draw",
      });
      return;
    }

    let winnerIdOrName = null;

    if (typeof winner === "number") {
      if (players[winner].newPlayer) {
        winnerIdOrName = players[winner].name;
      } else {
        winnerIdOrName = parseInt(players[winner].id!, 10);
      }
    }

    const body = {
      newPlayers,
      existingPlayers,
      winner: winnerIdOrName,
      draw,
      season,
      played_at: dayjs(played_at).format("YYYY-MM-DD"),
    };

    await fetcher.submit(body, {
      method: "POST",
      encType: "application/json",
    });
  };

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1 className="text-4xl mb-4">Report game</h1>
      <div className="grid grid-cols-4 gap-4">
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="contents">
            <div className="col-span-4 md:col-span-1">
              <Controller
                name="played_at"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <>
                    <button
                      popoverTarget="rdp-popover"
                      className="input input-border w-full"
                      style={{ anchorName: "--rdp" } as React.CSSProperties}
                    >
                      {value
                        ? dayjs(value).format("DD/MM/YYYY")
                        : "Pick a date"}
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
                        selected={value}
                        onSelect={onChange}
                        required={false}
                      />
                    </div>
                  </>
                )}
              />
            </div>
            <div className="col-span-4 md:col-span-1">
              <Controller
                name="season"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <select
                    className="select w-full"
                    onChange={onChange}
                    value={`${value || ""}`}
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
                )}
              />
            </div>
            <div className="hidden md:col-span-2 md:block" />
            <h1 className="col-span-2">Player name</h1>
            <div />
            <h1 className="text-center">Winner?</h1>
            <div className="col-span-4 grid grid-cols-4 gap-2">
              {[0, 1, 2, 3].map((index) => (
                <PlayerInput
                  key={index}
                  index={index}
                  players={players}
                  decks={decks}
                />
              ))}
            </div>
            <div className="col-span-4 p-2">
              <label className="label">
                <input
                  type="checkbox"
                  className="checkbox"
                  {...methods.register("draw")}
                  onChange={(e) => {
                    methods.setValue("draw", e.target.checked);
                    methods.setValue("winner", null);
                  }}
                />
                Draw?
              </label>
            </div>
            <button
              className="btn btn-neutral"
              disabled={fetcher.state !== "idle"}
              role="submit"
            >
              Submit
            </button>
          </form>
        </FormProvider>
      </div>
      <div className="mt-4">
        {methods.formState.errors.root && (
          <span className="text-red-500">
            {methods.formState.errors.root.message}
          </span>
        )}
      </div>
    </main>
  );
}
