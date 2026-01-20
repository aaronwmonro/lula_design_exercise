import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="min-h-screen p-10">
      <Card className="max-w-md">
        <CardContent className="p-6 space-y-4">
          <h1 className="text-2xl font-semibold">Shadcn is live</h1>
          <p className="text-muted-foreground">
            Next.js + Tailwind + shadcn is working.
          </p>
          <Button>Continue</Button>
        </CardContent>
      </Card>
    </main>
  );
}
