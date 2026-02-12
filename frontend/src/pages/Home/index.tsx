import { Button } from "@/components/ui/button";

function HomePage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background text-foreground">
      <h1 className="text-4xl font-bold tracking-tight">SwampSwap</h1>
      <p className="text-lg text-muted-foreground">
        Campus Second-hand Trading Platform — Here is the start home page
      </p>
      <div className="flex gap-3">
        <Button>Start Exploring</Button>
        <Button variant="outline">Post Item</Button>
      </div>
    </div>
  );
}

export default HomePage;
