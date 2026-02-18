import { Button } from "@/components/ui/button"

interface HomePageProps {
  onNavigateToUser?: () => void;
}

function HomePage({ onNavigateToUser }: HomePageProps) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background text-foreground">
      <h1 className="text-4xl font-bold tracking-tight">
        SwampSwap
      </h1>
      <p className="text-lg text-muted-foreground">
        Campus Second-hand Trading Platform — Here is the start home page
      </p>
      <div className="flex gap-3">
        <Button>Start Exploring</Button>
        <Button variant="outline">Post Item</Button>
      </div>
      
      {/* just for development demo, can be removed in production */}
      <div className="mt-8 border-t pt-6">
        <p className="mb-3 text-sm text-muted-foreground">Development test:</p>
        <Button variant="secondary" onClick={onNavigateToUser}>
          user information page
        </Button>
      </div>
    </div>
  )
}

export default HomePage
