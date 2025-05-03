import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  route("auth/confirm", "routes/auth/confirm.tsx"),
  route("leagues/:leagueId", "routes/league.tsx"),
] satisfies RouteConfig;
