// @/components/Header.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { UserAvatar } from "./user-avatar";
import { Plus, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "./ui/button";
import { CreateTaskDialog } from "@/components/workflow/CreateTaskDialog";

export default function Header() {
  const [search, setSearch] = useState("");
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-50 border-b bg-background">
        <div className="mx-auto flex h-14 items-center sm:h-16 px-4 gap-4">
          {/* Left — Logo */}
          <div className="flex shrink-0 items-center w-40">
            <Link href="/" className="group flex items-center gap-2">
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
          </div>

          {/* Centre — Search bar */}
          <div className="flex flex-1 items-center justify-center">
            <div className="flex w-full max-w-xl items-center">
              {/* Input */}
              <Input
                placeholder="Search news..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    // handle search
                  }
                }}
                className="rounded-none border-r-0 pl-5 focus-visible:ring-0 focus-visible:ring-offset-0"
              />

              {/* Clear button — only shows when there's text */}
              {search && (
                <Button
                  variant="outline"
                  onClick={() => setSearch("")}
                  className="rounded-none border-x-0 px-3 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}

              {/* Search button */}
              <Button
                variant="outline"
                className="rounded-none border-l-0 px-5 bg-muted hover:bg-muted/80"
                onClick={() => {
                  // handle search
                }}
              >
                <Search className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          </div>

          {/* Right — Avatar */}
          <div className="flex shrink-0 items-center justify-end gap-4 w-40">
            <Button
              variant="outline"
              className="px-3"
              onClick={() => setIsCreateTaskOpen(true)}
            >
              <Plus className="h-4 w-4" /> Create
            </Button>
            <UserAvatar />
          </div>
        </div>
      </nav>
      <CreateTaskDialog
        open={isCreateTaskOpen}
        onOpenChange={setIsCreateTaskOpen}
      />
    </>
  );
}
