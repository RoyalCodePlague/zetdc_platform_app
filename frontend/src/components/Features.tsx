import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Shield, 
  Clock, 
  Globe, 
  History, 
  Smartphone, 
  Users, 
  Zap, 
  CreditCard 
} from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Bank-level encryption and secure payment processing for all transactions",
      color: "bg-gradient-primary"
    },
    {
      icon: Clock,
      title: "Instant Token Delivery",
      description: "Receive your 20-digit prepaid token within seconds of payment confirmation",
      color: "bg-gradient-secondary"
    },
    {
      icon: Globe,
      title: "Diaspora Friendly",
      description: "Support family from anywhere in the world with international payment options",
      color: "bg-gradient-primary"
    },
    {
      icon: History,
      title: "Transaction History",
      description: "Complete record of all purchases with downloadable receipts and token resends",
      color: "bg-gradient-secondary"
    },
    {
      icon: Smartphone,
      title: "Multi-Channel Delivery",
      description: "Receive tokens via SMS, email, WhatsApp, or through the web platform",
      color: "bg-gradient-primary"
    },
    {
      icon: Users,
      title: "Multi-Meter Management",
      description: "Manage multiple prepaid meters for different properties from one account",
      color: "bg-gradient-secondary"
    },
    {
      icon: Zap,
      title: "Real-Time Processing",
      description: "Lightning-fast token generation with real-time ZETDC system integration",
      color: "bg-gradient-primary"
    },
    {
      icon: CreditCard,
      title: "Flexible Payments",
      description: "Multiple payment options including cards, mobile money, and bank transfers",
      color: "bg-gradient-secondary"
    }
  ];

  return (
    <section id="features" className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Powerful Features
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to manage your electricity payments efficiently and securely
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-medium transition-all duration-300 animate-fade-in bg-gradient-card border-0"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="pb-4">
                <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4 group-hover:animate-pulse-glow`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg font-semibold text-foreground">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;