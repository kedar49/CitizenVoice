import Link from "next/link";
import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-center gap-2 text-sm text-stone-600 dark:text-stone-400">
          <span>Created by</span>
          <Link
            href="https://x.com/wtfkedar"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors inline-flex items-center gap-1"
          >
            Kedar
          </Link>
          <span className="inline-flex items-center gap-1">
            with <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
          </span>
        </div>
      </div>
    </footer>
  );
}
