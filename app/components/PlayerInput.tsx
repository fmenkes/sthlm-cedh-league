interface PlayerInputProps {
  index: number;
  newPlayerChecked: { [key: number]: boolean; };
  setNewPlayerNames: React.Dispatch<
    React.SetStateAction<{ [key: number]: string }>
  >;
  setSelectedPlayers: React.Dispatch<
    React.SetStateAction<{ [key: number]: number | null }>
  >;
  setNewPlayerChecked: React.Dispatch<
    React.SetStateAction<{ [key: number]: boolean }>
  >;
  selectedPlayers: { [key: number]: number | null };
  players: { id: number; name: string }[] | null;
  winner: number | null;
  setWinner: React.Dispatch<React.SetStateAction<number | null>>;
}

export default function PlayerInput({
  index,
  newPlayerChecked,
  setNewPlayerNames,
  selectedPlayers,
  setSelectedPlayers,
  setNewPlayerChecked,
  players,
  winner,
  setWinner,
}: PlayerInputProps) {
  return (
    <>
      <div className="col-span-2">
        {newPlayerChecked[index] ? (
          <input
            className="input w-full"
            onChange={(e) => {
              setNewPlayerNames((players) => ({
                ...players,
                index: e.target.value,
              }));
            }}
          />
        ) : (
          <select
            className="select w-full"
            onChange={(e) =>
              setSelectedPlayers((players) => ({
                ...players,
                index: parseInt(e.target.value),
              }))
            }
            value={`${selectedPlayers[index] || ""}`}
          >
            <option disabled value="">
              Player {index + 1}
            </option>
            {players
              ?.filter(
                (player) =>
                  !Object.entries(selectedPlayers)
                    .filter(([key]) => Number(key) !== index)
                    .map(([, value]) => value)
                    .includes(player.id)
              )
              .map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name}
                </option>
              ))}
          </select>
        )}
      </div>
      <label
        className={`btn swap ${newPlayerChecked[index] ? "swap-active" : ""}`}
        onClick={() => {
          setNewPlayerChecked((players) => ({
            ...players,
            index: !players[index],
          }));
        }}
      >
        <span className="swap-off">New</span>
        <span className="swap-on">Existing</span>
      </label>
      <input
        type="radio"
        className="radio radio-success self-center"
        checked={winner === index}
        onChange={() => setWinner(index)}
      />
    </>
  );
}
