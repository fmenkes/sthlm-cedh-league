import { NavLink, Outlet } from "react-router";
import type { Route } from "./+types/topnav";
import { createClient } from "~/utils/supabase.server";
import { useRef } from "react";

export async function loader({ request }: Route.LoaderArgs) {
  const { supabase } = createClient(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { user };
}

const links = [
  { to: "/", label: "Home" },
  { to: "/players", label: "Players" },
  { to: "/seasons", label: "Seasons" },
  { to: "/stats", label: "Stats" },
  { to: "/decks", label: "Decks", requiresAuth: true },
  { to: "/report", label: "Report game", requiresAuth: true },
];

export default function TopNav({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData;
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleDropdownClick = () => {
    dropdownRef.current?.togglePopover();
  };

  return (
    <>
      <nav className="navbar bg-gray-800 text-lg md:text-base">
        <div className="dropdown" ref={dropdownRef}>
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost focus:bg-gray-500 lg:hidden text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {" "}
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />{" "}
            </svg>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
          >
            {links.map((link) =>
              !link.requiresAuth || user ? (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    className="text-lg"
                    onClick={handleDropdownClick}
                  >
                    {link.label}
                  </NavLink>
                </li>
              ) : null
            )}
          </ul>
        </div>
        <div className="container mx-auto flex justify-end lg:justify-between items-center px-4">
          <ul className="space-x-4 hidden lg:flex">
            {links.map((link) =>
              !link.requiresAuth || user ? (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    className="text-white hover:text-gray-300"
                  >
                    {link.label}
                  </NavLink>
                </li>
              ) : null
            )}
          </ul>
          <ul className="flex space-x-4">
            {user ? (
              <li>
                <NavLink
                  to="/logout"
                  className="text-white hover:text-gray-300"
                >
                  Logout
                </NavLink>
              </li>
            ) : (
              <li>
                <NavLink to="/login" className="text-white hover:text-gray-300">
                  Login
                </NavLink>
              </li>
            )}
          </ul>
        </div>
      </nav>
      <Outlet context={{ user }} />
    </>
  );
}
