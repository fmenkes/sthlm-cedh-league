import { createClient } from "~/utils/supabase.server";
import { type User } from "@supabase/supabase-js";
import { useFetcher, useOutletContext } from "react-router";
import type { Route } from "./+types/decks";
import type { Route as Search } from "./+types/search-scryfall";
import { useForm } from "react-hook-form";
import type { DeckFormInput } from "~/types/form";
import { useEffect, useRef, useState, type CSSProperties } from "react";

export async function action({ request }: Route.ActionArgs) {
  const jsonData = await request.json();
  const { supabase } = createClient(request);

  const { nickname, commander, partner } = jsonData;

  if (!commander || !commander.id) {
    return {
      ok: false,
      message: "Commander is required",
    };
  }

  const { data: commanderData, error: commanderError } = await supabase
    .from("commander")
    .select("id")
    .eq("scryfall_id", commander.id);

  if (commanderError) {
    return {
      ok: false,
      message: `Error fetching commander: ${commanderError.message}`,
    };
  }

  let existingCommanderId: number | null = null;

  if (commanderData && commanderData.length > 0) {
    const existingCommander = commanderData[0];
    existingCommanderId = existingCommander.id;
  }

  if (!existingCommanderId) {
    const { data: newCommanderData, error: newCommanderError } = await supabase
      .from("commander")
      .insert({
        name: commander.name,
        src:
          commander.image_uris?.normal ||
          commander.image_uris?.large ||
          commander.card_faces?.[0].image_uris?.normal ||
          commander.card_faces?.[0].image_uris?.large,
        partner: commander.keywords?.includes("Partner") || false,
        scryfall_id: commander.id,
        art_crop:
          commander.image_uris?.art_crop ||
          commander.card_faces?.[0].image_uris?.art_crop ||
          null,
      })
      .select()
      .single();
    if (newCommanderError) {
      return {
        ok: false,
        message: `Error inserting new commander: ${newCommanderError.message}`,
      };
    }
    existingCommanderId = newCommanderData.id;
  }

  let existingPartnerId: number | null = null;

  if (partner) {
    const { data: partnerData, error: partnerError } = await supabase
      .from("commander")
      .select("id")
      .eq("scryfall_id", partner.id);

    if (partnerError) {
      return {
        ok: false,
        message: `Error fetching partner: ${partnerError.message}`,
      };
    }

    if (partnerData && partnerData.length > 0) {
      const existingPartner = partnerData[0];
      existingPartnerId = existingPartner.id;
    }

    if (!existingPartnerId) {
      const { data: newPartnerData, error: newPartnerError } = await supabase
        .from("commander")
        .insert({
          name: partner.name,
          src: partner.image_uris?.normal || partner.image_uris?.large,
          partner: partner.keywords?.includes("Partner") || false,
          scryfall_id: partner.id,
          art_crop: partner.image_uris?.art_crop || null,
        })
        .select()
        .single();
      if (newPartnerError) {
        return {
          ok: false,
          message: `Error inserting new partner: ${newPartnerError.message}`,
        };
      }
      existingPartnerId = newPartnerData.id;
    }
  }

  const deckNickname =
    nickname?.trim() ||
    `${commander.name}${partner ? ` / ${partner.name}` : ""}`;

  const { data, error } = await supabase
    .from("deck")
    .insert({
      nickname: deckNickname,
      commander: existingCommanderId,
      partner: existingPartnerId,
    })
    .select()
    .single();

  if (error && error.message.includes("duplicate key value")) {
    return {
      ok: false,
      message: "A deck with this commander or nickname already exists.",
    };
  }

  return {
    ok: true,
    message: "Deck added successfully",
    deck: data,
  };
}

export async function loader({ request }: Route.LoaderArgs) {
  const { supabase } = createClient(request);

  const { data: decks } = await supabase
    .from("deck")
    .select(
      `
      id, 
      nickname,
      commander:commander!deck_commander_fk ( id, name, art_crop ),
      partner:commander!deck_partner_fk ( id, name, art_crop )`
    )
    .order("created_at", { ascending: false });

  const { data: deckStats } = await supabase
    .from("deck_win_percentage")
    .select("*");

  const merged = decks?.map((deck) => {
    const stats = deckStats?.find((s) => s.deck === deck.id);
    return {
      ...deck,
      wins: stats?.wins ?? 0,
      total_games: stats?.total_games ?? 0,
      win_percentage: stats?.win_percentage ?? 0,
    };
  });

  return { decks: merged };
}

export default function Decks({ loaderData }: Route.ComponentProps) {
  const { decks } = loaderData;
  const { user } = useOutletContext<{ user: User }>();
  const commanderFetcher = useFetcher<Search.ComponentProps["loaderData"]>();
  const partnerFetcher = useFetcher<Search.ComponentProps["loaderData"]>();
  const actionFetcher = useFetcher();
  const {
    formState,
    reset,
    setError,
    register,
    setValue,
    watch,
    handleSubmit,
  } = useForm<DeckFormInput>();
  const inputRef = useRef<HTMLInputElement>(null);
  const partnerInputRef = useRef<HTMLInputElement>(null);
  const partnerPopoverRef = useRef<HTMLUListElement>(null);
  const [commanderInput, setCommanderInput] = useState("");
  const [partnerInput, setPartnerInput] = useState("");
  const popoverRef = useRef<HTMLUListElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>(undefined);
  const isUserTypingRef = useRef(false);

  useEffect(() => {
    if (!isUserTypingRef.current) return;

    clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      await commanderFetcher.load(
        `/search-scryfall?q=${encodeURIComponent(commanderInput)}`
      );
      popoverRef.current?.showPopover();
    }, 500);

    return () => clearTimeout(timeoutRef.current);
  }, [commanderInput]);

  useEffect(() => {
    if (!isUserTypingRef.current) return;

    clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      await partnerFetcher.load(
        `/search-scryfall?q=${encodeURIComponent(partnerInput)}`
      );
      partnerPopoverRef.current?.showPopover();
    }, 500);

    return () => clearTimeout(timeoutRef.current);
  }, [partnerInput]);

  useEffect(() => {
    if (actionFetcher.data?.ok) {
      reset();
      setCommanderInput("");
      setPartnerInput("");
    } else if (actionFetcher.data?.message) {
      setError("root", {
        type: "manual",
        message: actionFetcher.data.message,
      });
    }
  }, [actionFetcher.data]);

  const handleBlur = async () => {
    setTimeout(() => {
      popoverRef.current?.hidePopover();
      partnerPopoverRef.current?.hidePopover();
    }, 200);
  };

  const handleChange = (value: string, setter: (value: string) => void) => {
    isUserTypingRef.current = true;
    setter(value);
    popoverRef.current?.hidePopover();
    partnerPopoverRef.current?.hidePopover();
  };

  const handleSelectCommander = (card: ScryfallCard) => {
    isUserTypingRef.current = false;
    setValue("commander", card);
    setCommanderInput(card.name);
  };

  const handleSelectPartner = (card: ScryfallCard) => {
    isUserTypingRef.current = false;
    setValue("partner", card);
    setPartnerInput(card.name);
  };

  const onSubmit = async (data: DeckFormInput) => {
    const { commander, partner, nickname } = data;

    console.log("Submitting deck:", {
      nickname,
      commander,
      partner: commander?.keywords?.includes("Partner") ? partner : undefined,
    });

    const body = {
      nickname: nickname?.trim() || "",
      commander: commander ? { ...commander } : null,
      partner:
        commander?.keywords?.includes("Partner") && partner
          ? { ...partner }
          : null,
    };

    await actionFetcher.submit(body, {
      method: "POST",
      encType: "application/json",
    });
  };

  const watchCommander = watch("commander");

  return (
    <main className="pt-16 p-4 container mx-auto overflow-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {user && (
          <>
            <form onSubmit={handleSubmit(onSubmit)}>
              <fieldset className="fieldset bg-base-200 border-base-300 rounded-box border p-4 w-full">
                <legend className="fieldset-legend">New deck</legend>

                <label className="label">Commander</label>
                <label className="input w-full">
                  <svg
                    className="h-[1em] opacity-50"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                  >
                    <g
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      strokeWidth="2.5"
                      fill="none"
                      stroke="currentColor"
                    >
                      <circle cx="11" cy="11" r="8"></circle>
                      <path d="m21 21-4.3-4.3"></path>
                    </g>
                  </svg>
                  <input
                    ref={inputRef}
                    type="text"
                    className="grow"
                    placeholder="Search commander"
                    name="q"
                    style={{ anchorName: "--anchor-input" } as CSSProperties}
                    popoverTarget="popover-input"
                    value={commanderInput}
                    onChange={(e) =>
                      handleChange(e.target.value, setCommanderInput)
                    }
                    onBlur={handleBlur}
                  />
                  {commanderFetcher.state === "loading" && (
                    <span className="loading loading-spinner loading-xs"></span>
                  )}
                </label>

                <ul
                  ref={popoverRef}
                  id="popover-input"
                  popover="manual"
                  style={{ positionAnchor: "--anchor-input" } as CSSProperties}
                  className="dropdown menu w-52 rounded-box bg-base-100 shadow-sm"
                >
                  {commanderFetcher.data?.ok ? (
                    commanderFetcher.data?.cards?.map((card) => (
                      <li key={card.id}>
                        <span onClick={() => handleSelectCommander(card)}>
                          {card.name}
                        </span>
                      </li>
                    ))
                  ) : (
                    <li>
                      <span>
                        {commanderFetcher.data?.message || "No results found"}
                      </span>
                    </li>
                  )}
                </ul>

                {watchCommander?.keywords?.includes("Partner") && (
                  <>
                    <label className="label">Partner</label>
                    <label className="input w-full">
                      <svg
                        className="h-[1em] opacity-50"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                      >
                        <g
                          strokeLinejoin="round"
                          strokeLinecap="round"
                          strokeWidth="2.5"
                          fill="none"
                          stroke="currentColor"
                        >
                          <circle cx="11" cy="11" r="8"></circle>
                          <path d="m21 21-4.3-4.3"></path>
                        </g>
                      </svg>
                      <input
                        ref={partnerInputRef}
                        type="text"
                        className="grow"
                        placeholder="Search partner"
                        name="q"
                        style={
                          { anchorName: "--partner-anchor" } as CSSProperties
                        }
                        popoverTarget="partner-popover"
                        value={partnerInput}
                        onChange={(e) =>
                          handleChange(e.target.value, setPartnerInput)
                        }
                        onBlur={handleBlur}
                      />
                      {partnerFetcher.state === "loading" && (
                        <span className="loading loading-spinner loading-xs"></span>
                      )}
                    </label>

                    <ul
                      ref={partnerPopoverRef}
                      id="partner-popover"
                      popover="manual"
                      style={
                        { positionAnchor: "--partner-anchor" } as CSSProperties
                      }
                      className="dropdown menu w-52 rounded-box bg-base-100 shadow-sm"
                    >
                      {partnerFetcher.data?.ok ? (
                        partnerFetcher.data?.cards?.map((card) => (
                          <li key={card.id}>
                            <span onClick={() => handleSelectPartner(card)}>
                              {card.name}
                            </span>
                          </li>
                        ))
                      ) : (
                        <li>
                          <span>
                            {partnerFetcher.data?.message || "No results found"}
                          </span>
                        </li>
                      )}
                    </ul>
                  </>
                )}

                <label className="label">Nickname</label>
                <input
                  type="text"
                  className="input w-full"
                  placeholder="Give the deck a nickname?"
                  {...register("nickname")}
                />
                <button
                  className="btn btn-neutral mt-4"
                  disabled={actionFetcher.state === "submitting"}
                >
                  Create deck
                </button>
              </fieldset>
            </form>
            <div className="min-h-10 mt-4">
              {formState.errors.root && (
                <span className="text-red-500">
                  {formState.errors.root.message}
                </span>
              )}
            </div>
            <div className="hidden lg:block" />
          </>
        )}
        {decks?.map((deck) => {
          const deckName = `${deck.commander.name}${
            deck.partner ? ` / ${deck.partner.name}` : ""
          }`;

          return (
            <div
              className="card bg-base-200 shadow-sm h-48 relative"
              key={deck.id}
            >
              {deck.commander.art_crop && deck.partner?.art_crop ? (
                <div className="absolute inset-0 flex">
                  <img
                    className="object-top object-cover h-full w-1/2 rounded-l-md"
                    style={{ filter: "brightness(50%)" }}
                    src={deck.commander.art_crop}
                  />
                  <img
                    className="object-top object-cover h-full w-1/2 rounded-r-md"
                    style={{ filter: "brightness(50%)" }}
                    src={deck.partner.art_crop}
                  />
                </div>
              ) : (
                <div className="absolute inset-0 flex">
                  <img
                    className="object-top object-cover h-full w-full rounded-md"
                    style={{ filter: "brightness(50%)" }}
                    src={deck.commander.art_crop || ""}
                  />
                </div>
              )}
              <div
                className={`card-body z-10 relative text-white flex flex-col justify-between`}
              >
                <h2 className="card-title">{deckName}</h2>
                <div className="flex flex-row justify-between items-center text-lg">
                  <span>{deck.nickname !== deckName ? deck.nickname : ""}</span>
                  <span className="text-sm">WR {deck.win_percentage}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
