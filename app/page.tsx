import Header from "@/components/Header";
import HeroSection from "@/components/landing/HeroSection";
import TrendingGrid from "@/components/landing/TrendingGrid";
import HowItWorks from "@/components/landing/HowItWorks";
import TransparencyPanel from "@/components/landing/TransparencyPanel";
import Newsletter from "@/components/landing/Newsletter";
import Footer from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="px-12">
        <main className="">
          <HeroSection />
          <div className="border-t border-border" />
          <TrendingGrid />
          <HowItWorks />
          <TransparencyPanel />
          <Newsletter />
        </main>

        <Footer />
      </div>
    </div>
  );
}
