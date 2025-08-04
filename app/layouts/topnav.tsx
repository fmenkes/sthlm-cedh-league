import { NavLink, Outlet } from "react-router";
import type { Route } from "./+types/topnav";
import { createClient } from "~/utils/supabase.server";

export async function loader({ request }: Route.LoaderArgs) {
  const { supabase } = createClient(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { user };
}

export default function TopNav({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData;

  return (
    <>
      <nav className="navbar bg-gray-800 text-sm md:text-base">
        <div className="container mx-auto flex justify-between items-center px-4">
          <ul className="flex space-x-4">
            <li>
              <NavLink to="/" className="text-white hover:text-gray-300">
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/players" className="text-white hover:text-gray-300">
                Players
              </NavLink>
            </li>
            <li>
              <NavLink to="/seasons" className="text-white hover:text-gray-300">
                Seasons
              </NavLink>
            </li>
            <li>
              <NavLink to="/stats" className="text-white hover:text-gray-300">
                Stats
              </NavLink>
            </li>
            {user && (
              <li>
                <NavLink
                  to="/report"
                  className="text-white hover:text-gray-300"
                >
                  Report game
                </NavLink>
              </li>
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
