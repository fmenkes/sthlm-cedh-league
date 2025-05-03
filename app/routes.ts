import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  route("auth/confirm", "routes/auth/confirm.tsx"),
  route("seasons/:seasonId", "routes/season.tsx"),
] satisfies RouteConfig;
