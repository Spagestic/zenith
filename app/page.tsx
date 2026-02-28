import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GeneratedVideoFeed from "@/components/workflow/GeneratedVideoFeed";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="px-12">
        <GeneratedVideoFeed />
      </main>
      <Footer />
    </div>
  );
}
