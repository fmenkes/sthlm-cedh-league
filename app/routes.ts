import {
  type RouteConfig,
  index,
  layout,
  route,
  prefix,
} from "@react-router/dev/routes";

export default [
  layout("layouts/topnav.tsx", [
    index("routes/home.tsx"),
    route("login", "routes/login.tsx"),
    route("players", "routes/players.tsx"),
    route("report", "routes/report.tsx"),
    ...prefix("seasons", [
      index("routes/seasons/index.tsx"),
      route(":seasonId", "routes/seasons/season.tsx"),
    ]),
  ]),
  route("auth/mail-sent", "routes/auth/mail-sent.tsx"),
  route("auth/confirm", "routes/auth/confirm.tsx"),
  route("auth/error", "routes/auth/error.tsx"),
  route("logout", "routes/logout.tsx"),
] satisfies RouteConfig;
