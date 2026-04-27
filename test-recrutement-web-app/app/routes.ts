import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("forget-password", "routes/forget-password.tsx"),
  route("new-password", "routes/new-password.tsx"),
  route("profile", "routes/profile.tsx"),
  route("dashboard", "routes/dashboard.tsx"),
] satisfies RouteConfig;
