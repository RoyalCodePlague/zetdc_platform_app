import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CreditCard, Smartphone, Building } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface AddPaymentMethodModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialPaymentType?: string;
}

const AddPaymentMethodModal = ({ open, onOpenChange, initialPaymentType }: AddPaymentMethodModalProps) => {
  const [loading, setLoading] = useState(false);
  const [paymentType, setPaymentType] = useState("");
  const [formData, setFormData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
    phoneNumber: "",
    bankName: ""
  });
  const { toast } = useToast();

  const paymentMethods = [
    { id: "card", label: "Credit/Debit Card", icon: CreditCard },
    { id: "mobile", label: "Mobile Money", icon: Smartphone },
    { id: "bank", label: "Bank Transfer", icon: Building }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await new Promise(resolve => setTimeout(resolve, 2000));

    toast({
      title: "Payment Method Added",
      description: "Your payment method has been added successfully.",
    });

    setLoading(false);
    onOpenChange(false);
    setPaymentType("");
    setFormData({ cardNumber: "", expiryDate: "", cvv: "", cardholderName: "", phoneNumber: "", bankName: "" });
  };

  // when modal opens, preselect the initial payment type if provided
  useEffect(() => {
    if (open && initialPaymentType) {
      setPaymentType(initialPaymentType);
    }
    if (!open) {
      // reset when closed
      setPaymentType("");
      setFormData({ cardNumber: "", expiryDate: "", cvv: "", cardholderName: "", phoneNumber: "", bankName: "" });
    }
  }, [open, initialPaymentType]);

  const renderPaymentForm = () => {
    switch (paymentType) {
      case "card":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={formData.cardNumber}
                onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  placeholder="MM/YY"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  value={formData.cvv}
                  onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cardholderName">Cardholder Name</Label>
              <Input
                id="cardholderName"
                placeholder="John Doe"
                value={formData.cardholderName}
                onChange={(e) => setFormData({ ...formData, cardholderName: e.target.value })}
                required
              />
            </div>
          </>
        );
      case "mobile":
        return (
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Mobile Number</Label>
            <Input
              id="phoneNumber"
              placeholder="+263 77 123 4567"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              required
            />
          </div>
        );
      case "bank":
        return (
          <div className="space-y-2">
            <Label htmlFor="bankName">Bank Name</Label>
            <Select value={formData.bankName} onValueChange={(value) => setFormData({ ...formData, bankName: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select your bank" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="steward">Steward Bank</SelectItem>
                <SelectItem value="ecocash">EcoCash</SelectItem>
                <SelectItem value="onemoney">OneMoney</SelectItem>
                <SelectItem value="cbz">CBZ Bank</SelectItem>
                <SelectItem value="fbc">FBC Bank</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Payment Method</DialogTitle>
        </DialogHeader>
        
        {!paymentType ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Choose a payment method to add:</p>
            <div className="grid gap-3">
              {paymentMethods.map((method) => (
                <Card key={method.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setPaymentType(method.id)}>
                  <CardContent className="flex items-center space-x-3 p-4">
                    <method.icon className="h-5 w-5 text-primary" />
                    <span className="font-medium">{method.label}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {renderPaymentForm()}
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setPaymentType("")}>
                Back
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Add Payment Method
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddPaymentMethodModal;