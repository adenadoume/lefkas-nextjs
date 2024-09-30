import Link from "next/link";
import { Button } from "./ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block font-geist-sans">
              Coding Assistant
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium font-geist-sans">
            <Link href="/about">About</Link>
            <Link href="/docs">Docs</Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Search component can be added here if needed */}
          </div>
          <nav className="flex items-center">
            <Button variant="ghost" className="ml-2 font-geist-sans">
              Login
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}