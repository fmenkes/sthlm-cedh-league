import type { Route } from "./+types/search-scryfall";
import { name, version } from "package.json";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q");

  if (typeof query !== "string" || query.trim() === "") {
    return { ok: false, message: "Commander name is required." };
  }

  const SCRYFALL_API_URI = "https://api.scryfall.com/cards/search?q=";

  const uri = `${SCRYFALL_API_URI}${encodeURIComponent(
    `${query.trim()} is:commander`
  )}&unique=cards&order=released&dir=desc`;

  const headers = {
    "User-Agent": `${name}/${version}`,
    Accept: "application/json",
  };

  const response = await fetch(uri, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    if (response.status === 404) {
      return {
        ok: false,
        message: "No cards found!",
      };
    }
    return {
      ok: false,
      message: `Error fetching data from Scryfall: ${response.statusText}`,
    };
  }

  const data = await response.json();
  if (!data.data || data.data.length === 0) {
    return {
      ok: false,
      message: "No cards found!",
    };
  }

  return {
    ok: true,
    cards: data.data as ScryfallCard[],
    commander: encodeURIComponent(query.trim()),
  };
}
