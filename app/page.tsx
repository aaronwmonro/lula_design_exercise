import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function Page() {
  return (
    <main className="min-h-screen p-10">
      <div className="mx-auto max-w-xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Dev Set Up Test
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              If you can see this card, button, and input styled nicely, shadcn is wired correctly.
            </p>

            <div className="flex gap-3">
              <Input placeholder="Search products…" />
              <Button>Search</Button>
            </div>

            <div className="flex gap-3">
              <Button variant="default">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
