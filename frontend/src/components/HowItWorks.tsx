import { Card, CardContent } from "@/components/ui/card";
import { Monitor, DollarSign, MessageCircle } from "lucide-react";
import processSteps from "@/assets/process-steps-hq.jpg";

const HowItWorks = () => {
  const steps = [
    {
      icon: Monitor,
      title: "Select Your Meter",
      description: "Choose from your saved meters or add a new prepaid meter number",
      step: "01"
    },
    {
      icon: DollarSign,
      title: "Choose Amount & Pay",
      description: "Select your top-up amount and pay securely using various payment methods",
      step: "02"
    },
    {
      icon: MessageCircle,
      title: "Receive Your Token",
      description: "Get your 20-digit token instantly via SMS, email, or WhatsApp",
      step: "03"
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Three simple steps to top up your electricity from anywhere in the world
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {steps.map((step, index) => (
            <Card 
              key={index} 
              className="relative overflow-hidden group hover:shadow-medium transition-all duration-300 animate-scale-in bg-gradient-card border-0"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-8 text-center">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:animate-pulse-glow">
                    <step.icon className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {step.step}
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold mb-4 text-foreground">
                  {step.title}
                </h3>
                
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <img
            src={processSteps}
            alt="ZETDC Remote Prepaid Recharge Process Steps"
            className="mx-auto rounded-xl shadow-soft max-w-full h-auto"
          />
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;