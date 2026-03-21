import { createBrowserRouter } from "react-router-dom";
import HomePage from "@/pages/Home";
import RegisterPage from "@/pages/Register";
import LoginPage from "@/pages/Login";
import UserPage from "@/pages/User";
import ChatPage from "@/pages/Chat";
import ListingsPage from "@/pages/Listings";
import ListingDetailPage from "@/pages/ListingDetail";

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
  {
    path: "/listings",
    Component: ListingsPage,
  },
  {
    path: "/listings/:id",
    Component: ListingDetailPage,
  },
  {
    path: "/user-info",
    Component: UserPage,
  },
  {
    path: "/chat",
    Component: ChatPage,
  },
]);
