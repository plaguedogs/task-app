import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-foreground">404</h2>
        <h3 className="text-xl text-muted-foreground">Page Not Found</h3>
        <p className="text-muted-foreground">Could not find the requested page.</p>
        <Link href="/">
          <Button className="bg-primary hover:bg-primary/90">
            Return Home
          </Button>
        </Link>
      </div>
    </div>
  )
}