export interface ReportFormInput {
  players: {
    id: string | null;
    name: string | null;
    newPlayer: boolean;
    deck: string | null;
  }[];
  winner: number | null;
  draw: boolean;
  season: number;
  played_at: Date;
}

export interface DeckFormInput {
  nickname?: string;
  commander: ScryfallCard;
  partner?: ScryfallCard;
}
