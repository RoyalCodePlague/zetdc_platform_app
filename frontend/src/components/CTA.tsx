import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";
import { useState } from "react";
import AuthModal from "@/components/modals/AuthModal";

const CTA = () => {
  const [authModal, setAuthModal] = useState({ open: false, tab: "signup" as "login" | "signup" });

  return (
    <section className="py-20 bg-gradient-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center bg-primary/10 rounded-full px-6 py-3 mb-6">
            <Zap className="h-5 w-5 text-primary mr-2" />
            <span className="text-primary font-medium">Ready to Get Started?</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Never Run Out of Electricity Again
          </h2>
          
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust ZETDC Remote for their 
            prepaid electricity needs. Simple, secure, and available 24/7.
          </p>
          
          <div className="flex justify-center items-center">
            <Button 
              variant="energy" 
              size="hero"
              className="group"
              onClick={() => setAuthModal({ open: true, tab: "signup" })}
            >
              Create Free Account
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
          
          <div className="mt-8 text-sm text-muted-foreground">
            No setup fees • No monthly charges • Pay only for what you use
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

export default CTA;