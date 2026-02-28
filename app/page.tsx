import Header from "@/components/Header";
import HeroSection from "@/components/landing/HeroSection";
import Footer from "@/components/landing/Footer";
import LatestNews from "@/components/landing/LastestNews";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="px-12">
        <main className="">
          <HeroSection />
          <div className="border-t border-border" />
          <LatestNews />
        </main>
        <Footer />
      </div>
    </div>
  );
}
