import { useEffect } from "react";
import { set, useFormContext } from "react-hook-form";
import type { ReportFormInput } from "~/types/form";

interface PlayerInputProps {
  index: number;
  players: { id: number; name: string, last_played: number | null }[] | null;
  decks: { id: number; nickname: string | null }[] | null;
}

export default function PlayerInput({
  index,
  players,
  decks,
}: PlayerInputProps) {
  const { watch, register, setValue } = useFormContext<ReportFormInput>();

  const formPlayers = watch("players");
  const player = watch(`players.${index}`);
  const newPlayer = watch(`players.${index}.newPlayer`);
  const winner = watch("winner");
  

  useEffect(() => {
    const playerToUpdate = players?.find(
      (p) => p.id === parseInt(player.id || "", 10)
    );
    if (playerToUpdate && playerToUpdate.last_played) {
      setValue(
        `players.${index}.deck`,
        `${playerToUpdate.last_played}`,
      );
    } else {
      setValue(`players.${index}.deck`, "");
    }
  }, [player.id]);
    
  return (
    <div className="grid grid-cols-4 gap-2 items-center col-span-4" >
      {/* <div className="col-span-2"> */}
      {newPlayer ? (
        <input
          {...register(`players.${index}.name`)}
          className="input w-full col-span-2 md:col-span-1 order-1"
        />
      ) : (
        <select
          className="select w-full col-span-2 md:col-span-1 order-1"
          {...register(`players.${index}.id`)}
          defaultValue=""
        >
          <option disabled value="">
            Player {index + 1}
          </option>
          {players
            ?.filter(
              (player) =>
                !formPlayers.some(
                  (formPlayer, formIndex) =>
                    parseInt(formPlayer.id || "", 10) === player.id &&
                    formIndex !== index
                )
            )
            .map((player) => (
              <option key={player.id} value={player.id}>
                {player.name}
              </option>
            ))}
        </select>
      )}
      {/* </div> */}
      <select
        className="select w-full col-span-4 md:col-span-1 order-4 md:order-2"
        {...register(`players.${index}.deck`)}
        defaultValue=""
      >
        <option value="">Unknown deck</option>
        {decks &&
          decks.map((deck) => (
            <option key={deck.id} value={deck.id}>
              {deck.nickname}
            </option>
          ))}
      </select>
      <label
        className={`btn swap order-2 md:order-3 ${newPlayer ? "swap-active" : ""}`}
        onClick={() => {
          setValue(`players.${index}.newPlayer`, !newPlayer);
        }}
      >
        <span className="swap-off">New</span>
        <span className="swap-on">Existing</span>
      </label>
      <input
        type="radio"
        className="radio radio-success self-center justify-self-center order-3 md:order-4"
        checked={winner === index}
        onChange={() => {
          setValue("draw", false);
          setValue("winner", index);
        }}
      />
    </div>
  );
}
