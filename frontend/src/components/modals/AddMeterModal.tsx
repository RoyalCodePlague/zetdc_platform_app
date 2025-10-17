import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Zap } from "lucide-react";
import { metersService } from "@/services/meters";

interface AddMeterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void; // Callback to refresh meter list
}

const AddMeterModal = ({ open, onOpenChange, onSuccess }: AddMeterModalProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    meterNumber: "",
    nickname: "",
    location: "",
    meterType: ""
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.meterNumber || formData.meterNumber.length < 11) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid 11-digit meter number.",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.nickname.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a nickname for your meter.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Actually save the meter to the database
      await metersService.createMeter({
        meter_number: formData.meterNumber,
        nickname: formData.nickname,
        address: formData.location,
        // Note: meterType is not in the backend model, so we don't send it
      });

      toast({
        title: "Meter Added Successfully",
        description: `${formData.nickname} has been added to your meters.`,
      });

      // Reset form and close modal
      setFormData({ meterNumber: "", nickname: "", location: "", meterType: "" });
      onOpenChange(false);
      
      // Trigger parent component to refresh meter list
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Failed to add meter:', error);
      
      // Handle specific error messages
      let errorMessage = "Failed to add meter. Please try again.";
      
      if (error.response?.data?.meter_number) {
        errorMessage = "This meter number already exists in your account.";
      } else if (error.response?.data) {
        errorMessage = typeof error.response.data === 'string' 
          ? error.response.data 
          : JSON.stringify(error.response.data);
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error Adding Meter",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-primary" />
            <span>Add New Meter</span>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="meterNumber">Meter Number</Label>
            <Input
              id="meterNumber"
              placeholder="Enter 11-digit meter number"
              value={formData.meterNumber}
              onChange={(e) => setFormData({ ...formData, meterNumber: e.target.value })}
              maxLength={11}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nickname">Nickname</Label>
            <Input
              id="nickname"
              placeholder="e.g., Home - Main, Office, etc."
              value={formData.nickname}
              onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="e.g., Harare, Bulawayo, etc."
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="meterType">Meter Type</Label>
            <Select value={formData.meterType} onValueChange={(value) => setFormData({ ...formData, meterType: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select meter type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="residential">Residential</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="industrial">Industrial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Meter
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMeterModal;