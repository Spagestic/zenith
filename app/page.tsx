"use client";

import { useState } from "react";

import Header from "@/components/Header";

import CategoryBar from "@/components/landing/CategoryBar";
import HeroSection from "@/components/landing/HeroSection";
import TrendingGrid from "@/components/landing/TrendingGrid";
import KnowledgeGraphTeaser from "@/components/landing/KnowledgeGraphTeaser";
import HowItWorks from "@/components/landing/HowItWorks";
import TransparencyPanel from "@/components/landing/TransparencyPanel";
import Newsletter from "@/components/landing/Newsletter";
import Footer from "@/components/landing/Footer";

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState("all");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="px-12">
        <CategoryBar onCategoryChange={setActiveCategory} />

        <main className="">
          <HeroSection />
          <div className="border-t border-border" />
          <TrendingGrid activeCategory={activeCategory} />
          <HowItWorks />
          <TransparencyPanel />
          <Newsletter />
        </main>

        <Footer />
      </div>
    </div>
  );
}
