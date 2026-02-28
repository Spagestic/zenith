// @/components/Header.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "./user-avatar";
import { Search } from "lucide-react";

export default function Header() {
  const [search, setSearch] = useState("");

  return (
    <nav className="sticky top-0 z-50 border-b bg-background">
      <div className="mx-auto flex h-14 items-center justify-between gap-4 px-4 sm:h-16">
        {/* Logo */}
        <Link href="/" className="group flex shrink-0 items-center gap-2">
          <Image
            alt="Zenith Logo"
            className="h-8 w-8 pixel-crisp"
            height={32}
            src="/logo_.png"
            width={32}
          />
          <span className="text-lg font-bold tracking-tight sm:text-xl">
            Zenith
          </span>
        </Link>

        {/* Desktop search */}
        <div className="relative hidden w-full max-w-md md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search topics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Right */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <UserAvatar />
        </div>
      </div>

      {/* Mobile search */}
      <div className="border-t px-4 py-2 md:hidden">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search topics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
    </nav>
  );
}
