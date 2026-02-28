import { Button } from '@/components/ui/button'

export default function TestPage() {
  return (
    <div className="min-h-screen p-8 bg-background">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-foreground">
          shadcn/ui Test Page
        </h1>
        
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Button Variants</h2>
          <div className="flex flex-wrap gap-4">
            <Button>Default Button</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Button Sizes</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon">🚀</Button>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Disabled State</h2>
          <div className="flex gap-4">
            <Button disabled>Disabled Button</Button>
            <Button variant="outline" disabled>
              Disabled Outline
            </Button>
          </div>
        </div>

        <div className="p-6 border rounded-lg bg-card">
          <h3 className="text-xl font-semibold mb-2">Card Component Test</h3>
          <p className="text-muted-foreground mb-4">
            If you see this styled card, Tailwind is working!
          </p>
          <Button>Action Button</Button>
        </div>
      </div>
    </div>
  )
}