"use client";

import { useState } from "react";

const categories = [
  { label: "All", value: "all" },
  { label: "World", value: "world" },
  { label: "HK Local", value: "hk" },
  { label: "Science", value: "science" },
  { label: "Technology", value: "tech" },
  { label: "Environment", value: "environment" },
  { label: "Business", value: "business" },
  { label: "Culture", value: "culture" },
  { label: "Space", value: "space" },
];

interface CategoryBarProps {
  onCategoryChange?: (category: string) => void;
}

const CategoryBar = ({ onCategoryChange }: CategoryBarProps) => {
  const [active, setActive] = useState("all");

  const handleClick = (value: string) => {
    setActive(value);
    onCategoryChange?.(value);
  };

  return (
    <nav className="border-b border-border overflow-x-auto">
      <div className="container flex items-center gap-8 py-2.5 min-w-max">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => handleClick(cat.value)}
            className={`text-sm font-body font-semibold tracking-wide uppercase transition-colors whitespace-nowrap ${
              active === cat.value
                ? "text-foreground border-b-2 border-primary pb-2 -mb-2.75"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default CategoryBar;
