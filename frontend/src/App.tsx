import { useState } from "react";
import HomePage from "@/pages/Home";
import UserPage from "@/pages/User";

type Page = "home" | "user";

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");

  // simple page routing (can use react-router later)
  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <HomePage onNavigateToUser={() => setCurrentPage("user")} />;
      case "user":
        return <UserPage />;
      default:
        return <HomePage onNavigateToUser={() => setCurrentPage("user")} />;
    }
  };

  return renderPage();
}

export default App
