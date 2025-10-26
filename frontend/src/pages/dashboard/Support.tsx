import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, MessageSquare, Phone, Mail, Search, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";

const Support = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [supportForm, setSupportForm] = useState({
    subject: "",
    category: "",
    message: "",
    email: ""
  });
  const [submitting, setSubmitting] = useState(false);

  const faqs = [
    {
      question: "How do I purchase electricity tokens?",
      answer: "Navigate to the 'Buy Electricity' section, select your meter, enter the amount, choose a payment method, and complete the purchase. Your token will be sent immediately via SMS and email."
    },
    {
      question: "What payment methods are accepted?",
      answer: "We accept Visa, Mastercard, EcoCash, OneMoney, and bank transfers. You can save your payment methods for faster checkout."
    },
    {
      question: "How long does it take to receive my token?",
      answer: "Tokens are generated instantly after successful payment. You'll receive your 20-digit token via SMS and email within seconds."
    },
    {
      question: "Can I manage multiple meters?",
      answer: "Yes! You can add and manage multiple electricity meters from your dashboard. Go to 'My Meters' to add new meters."
    },
    {
      question: "What should I do if my token doesn't work?",
      answer: "First, ensure you've entered all 20 digits correctly. If the problem persists, contact support with your transaction ID for assistance."
    },
    {
      question: "How do I set up auto-recharge?",
      answer: "Go to 'Auto Recharge' settings and configure your threshold amount, recharge amount, and payment method. Your meter will automatically recharge when the balance falls below the threshold."
    },
    {
      question: "Is my payment information secure?",
      answer: "Yes, all payment information is encrypted and processed through secure payment gateways. We never store your complete card details."
    },
    {
      question: "Can I get a refund?",
      answer: "Refunds are processed on a case-by-case basis. Please contact support with your transaction details if you need a refund."
    }
  ];

  const contactMethods = [
    {
      icon: Phone,
      title: "Phone Support",
      description: "Call us 24/7",
      value: "+263 242 123 456",
      action: "tel:+263242123456"
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "We'll respond within 24 hours",
      value: "support@zetdc.co.zw",
      action: "mailto:support@zetdc.co.zw"
    },
    {
      icon: MessageSquare,
      title: "Live Chat",
      description: "Chat with our team",
      value: "Start Chat",
      action: "#"
    }
  ];

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!supportForm.subject || !supportForm.category || !supportForm.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/support/tickets/', {
        subject: supportForm.subject,
        category: supportForm.category,
        message: supportForm.message,
        email: supportForm.email
      });

      toast({
        title: "Support Ticket Created",
        description: "We've received your request and will respond within 24 hours."
      });

      setSupportForm({
        subject: "",
        category: "",
        message: "",
        email: ""
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit support ticket. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Help & Support</h1>
        <p className="text-muted-foreground">Get help with your account and services</p>
      </div>

      {/* Contact Methods */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {contactMethods.map((method, index) => (
          <Card key={index} className="bg-gradient-card hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                  <method.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{method.title}</h3>
                  <p className="text-sm text-muted-foreground">{method.description}</p>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    if (method.action.startsWith('#')) {
                      toast({
                        title: "Coming Soon",
                        description: "Live chat feature is coming soon!"
                      });
                    } else {
                      window.location.href = method.action;
                    }
                  }}
                >
                  {method.value}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Submit Support Ticket */}
      <Card className="bg-gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Send className="h-5 w-5" />
            <span>Submit a Support Ticket</span>
          </CardTitle>
          <CardDescription>Can't find an answer? Send us a message</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitTicket} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={supportForm.subject}
                  onChange={(e) => setSupportForm({ ...supportForm, subject: e.target.value })}
                  placeholder="Brief description of your issue"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={supportForm.category}
                  onValueChange={(value) => setSupportForm({ ...supportForm, category: value })}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Technical Issue</SelectItem>
                    <SelectItem value="billing">Billing Question</SelectItem>
                    <SelectItem value="account">Account Management</SelectItem>
                    <SelectItem value="token">Token Issues</SelectItem>
                    <SelectItem value="payment">Payment Problems</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Contact Email</Label>
              <Input
                id="email"
                type="email"
                value={supportForm.email}
                onChange={(e) => setSupportForm({ ...supportForm, email: e.target.value })}
                placeholder="Your email address (optional)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                value={supportForm.message}
                onChange={(e) => setSupportForm({ ...supportForm, message: e.target.value })}
                placeholder="Describe your issue in detail..."
                rows={6}
                required
              />
            </div>

            <Button type="submit" variant="energy" className="w-full" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Ticket"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* FAQs */}
      <Card className="bg-gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <HelpCircle className="h-5 w-5" />
            <span>Frequently Asked Questions</span>
          </CardTitle>
          <CardDescription>Find quick answers to common questions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search FAQs */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search FAQs..."
              className="pl-10"
            />
          </div>

          {/* FAQ Accordion */}
          <Accordion type="single" collapsible className="w-full">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No FAQs match your search</p>
              </div>
            )}
          </Accordion>
        </CardContent>
      </Card>

    </div>
  );
};

export default Support;
