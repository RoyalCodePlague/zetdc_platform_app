import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Users, Globe, Zap } from "lucide-react";

const Stats = () => {
  const stats = [
    {
      icon: Users,
      number: "50,000+",
      label: "Happy Households",
      description: "Families across Zimbabwe trust us with their electricity needs"
    },
    {
      icon: Zap,
      number: "1,000,000+", 
      label: "Tokens Delivered",
      description: "Successfully processed prepaid electricity tokens"
    },
    {
      icon: Globe,
      number: "15+",
      label: "Countries Served",
      description: "Supporting diaspora communities worldwide"
    },
    {
      icon: TrendingUp,
      number: "99.9%",
      label: "Uptime Guarantee",
      description: "Reliable service you can count on 24/7"
    }
  ];

  return (
    <section className="py-20 bg-gradient-hero relative overflow-hidden">
      <div className="absolute inset-0 bg-black/10"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Trusted by Thousands
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Join the growing community of satisfied customers who rely on our platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card 
              key={index} 
              className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300 animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                
                <div className="text-3xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                
                <div className="text-lg font-semibold text-white mb-2">
                  {stat.label}
                </div>
                
                <p className="text-white/80 text-sm">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;