import Header from "@/components/Header";
import HeroSection from "@/components/landing/HeroSection";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="px-12">
        <HeroSection />
      </main>
      <Footer />
    </div>
  );
}
