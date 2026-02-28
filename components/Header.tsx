// @/components/Header.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "./user-avatar";
import {
  Search,
  ChevronDown,
  Earth,
  DollarSign,
  Atom,
  Dumbbell,
  Palette,
  Tv,
  MapPin,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQueryState, parseAsString } from "nuqs";

const TOPIC_CATEGORIES = [
  { value: "hk-local", label: "HK Local", icon: MapPin },
  { value: "world", label: "World", icon: Earth },
  { value: "business", label: "Business", icon: DollarSign },
  { value: "tech-science", label: "Tech & Science", icon: Atom },
  { value: "sports", label: "Sports", icon: Dumbbell },
  { value: "art-culture", label: "Art & Culture", icon: Palette },
  { value: "entertainment", label: "Entertainment", icon: Tv },
];

export default function Header() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useQueryState(
    "category",
    parseAsString.withDefault("for-you"),
  );

  const activeTab = TOPIC_CATEGORIES.some((t) => t.value === category)
    ? "topics"
    : category === "top"
      ? "top"
      : "for-you";

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
        <Tabs
          value={activeTab}
          onValueChange={(v) => setCategory(v === "for-you" ? null : v)}
        >
          <TabsList variant="line">
            <TabsTrigger value="for-you">For You</TabsTrigger>
            <TabsTrigger value="top">Top</TabsTrigger>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <TabsTrigger value="topics" className="flex items-center gap-1">
                  Topics <ChevronDown className="h-3 w-3" />
                </TabsTrigger>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {TOPIC_CATEGORIES.map(({ value, label, icon: Icon }) => (
                  <DropdownMenuItem
                    key={value}
                    onSelect={() => setCategory(value)}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </TabsList>
        </Tabs>

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
