import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative z-20 border-t border-border/50 bg-card/80 backdrop-blur-sm py-6 mt-auto">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center text-sm text-muted-foreground">
          © 2026. Built with <Heart className="inline h-4 w-4 text-primary fill-primary" /> using{' '}
          <a
            href="https://caffeine.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium"
          >
            caffeine.ai
          </a>
        </div>
      </div>
    </footer>
  );
}
