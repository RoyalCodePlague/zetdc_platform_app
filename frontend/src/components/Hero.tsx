import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";
import heroImage from "@/assets/hero-meter.jpg";
import { useState } from "react";
import AuthModal from "@/components/modals/AuthModal";

const Hero = () => {
  const [authModal, setAuthModal] = useState({ open: false, tab: "signup" as "login" | "signup" });

  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="bg-gradient-hero py-20 lg:py-32 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left animate-fade-in">
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 animate-pulse-glow">
              <Zap className="h-4 w-4 text-white mr-2 animate-bounce" style={{ animationDuration: '2s' }} />
              <span className="text-white text-sm font-medium animate-fade-in">Trusted by 50,000+ Households</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              ZETDC Remote
              <span className="block text-accent">Prepaid Recharge</span>
            </h1>
            
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Powering Zimbabwe&apos;s future, one token at a time
            </p>
            
            <p className="text-lg text-white/80 mb-10 max-w-xl mx-auto lg:mx-0">
              Simple, secure electricity top-ups from anywhere in the world. 
              Perfect for diaspora communities supporting family back home.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                variant="hero" 
                size="hero" 
                className="group"
                onClick={() => setAuthModal({ open: true, tab: "signup" })}
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button 
                variant="outline" 
                size="hero"
                className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white hover:text-primary"
                onClick={scrollToFeatures}
              >
                Learn More
              </Button>
            </div>
            
            <div className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-white/20">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">50K+</div>
                <div className="text-sm text-white/70">Households</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">1M+</div>
                <div className="text-sm text-white/70">Tokens Sold</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">15+</div>
                <div className="text-sm text-white/70">Countries</div>
              </div>
            </div>
          </div>
          
          <div className="animate-slide-up">
            <div className="relative">
              <div className="absolute inset-0 bg-white/10 rounded-2xl transform rotate-6 animate-bounce-gentle"></div>
              <img
                src={heroImage}
                alt="Modern prepaid electricity meter with digital display"
                className="relative w-full h-auto rounded-2xl shadow-strong"
              />
            </div>
          </div>
        </div>
      </div>
      
      <AuthModal 
        open={authModal.open}
        onOpenChange={(open) => setAuthModal({ ...authModal, open })}
        defaultTab={authModal.tab}
      />
    </section>
  );
};

export default Hero;