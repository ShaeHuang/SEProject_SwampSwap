import { createBrowserRouter } from "react-router-dom";
import HomePage from "@/pages/Home";
import RegisterPage from "@/pages/Register";
import LoginPage from "@/pages/Login";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: HomePage,
  },
  {
    path: "/register",
    Component: RegisterPage,
  },
  {
    path: "/login",
    Component: LoginPage,
  },
]);
