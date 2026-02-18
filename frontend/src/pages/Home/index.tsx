import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
function HomePage() {
  const navigate = useNavigate();
  return (
    <>
    <div>
    <div className="flex justify-center items-center">
            <img src="assets/image/homepage_title.png" alt="logo" className="w-320 h-180" />
    </div>
    <div className="flex flex-col items-center justify-center gap-6 bg-background text-foreground">
      <p className="text-lg text-muted-foreground">
        Campus Second-hand Trading Platform — Here is the start home page
      </p>
      <div className="flex gap-3">
        <Button onClick={() => navigate("/login")}>Start Exploring</Button>
        <Button variant="outline">Post Item</Button>
      </div>
    </div>
    </div>
    </>
  );
}

export default HomePage;
