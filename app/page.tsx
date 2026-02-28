import Header from "@/components/Header";
import HeroSection from "@/components/landing/HeroSection";
import Footer from "@/components/Footer";
import LatestNews from "@/components/landing/LatestNews";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="px-12">
        <HeroSection />
        <LatestNews />
      </main>
      <Footer />
    </div>
  );
}
