import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Features from "@/components/Features";
import Stats from "@/components/Stats";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

const Landing = () => {
  return (
    <div className="min-h-screen">
      <Header  />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <Stats />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Landing;