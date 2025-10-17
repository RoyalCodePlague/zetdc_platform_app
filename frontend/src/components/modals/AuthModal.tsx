import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/auth";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: "login" | "signup";
}

const AuthModal = ({ open, onOpenChange, defaultTab = "login" }: AuthModalProps) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phoneNumber: "",
    meterNumber: "",
  });

  const { toast } = useToast();
  const { setLoggedIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (activeTab === "login") {
        const response = await authService.login({
          email: formData.email,
          password: formData.password,
        });

        // ✅ Save token
        localStorage.setItem("access_token", response.access);
        localStorage.setItem("refresh_token", response.refresh);
        localStorage.setItem("user", JSON.stringify(response.user));

        setLoggedIn(true);
        toast({ title: "Login successful!", description: "Welcome back!" });
        onOpenChange(false);
        navigate("/dashboard");
      } else {
        await authService.register({
          email: formData.email,
          username: formData.email.split("@")[0],
          password: formData.password,
          password_confirm: formData.confirmPassword,
          first_name: formData.fullName.split(" ")[0],
          last_name: formData.fullName.split(" ")[1] || "",
          phone_number: formData.phoneNumber,
          meter_number: formData.meterNumber,
        });

        toast({
          title: "Registration successful!",
          description: "Please login with your credentials.",
        });
        setActiveTab("login");
      }
    } catch (error: unknown) {
      const getMsg = (e: unknown) => {
        if (!e) return 'An unexpected error occurred.';
        if (typeof e === 'string') return e;
        if (typeof e === 'object' && e !== null) {
          const obj = e as Record<string, unknown>;
          
          // Handle Django validation errors (field-specific errors)
          if (obj.phone_number) {
            return `Phone Number: ${Array.isArray(obj.phone_number) ? obj.phone_number[0] : obj.phone_number}`;
          }
          if (obj.meter_number) {
            return `Meter Number: ${Array.isArray(obj.meter_number) ? obj.meter_number[0] : obj.meter_number}`;
          }
          if (obj.email) {
            return `Email: ${Array.isArray(obj.email) ? obj.email[0] : obj.email}`;
          }
          if (obj.password) {
            return `Password: ${Array.isArray(obj.password) ? obj.password[0] : obj.password}`;
          }
          
          // Generic error messages
          if (obj.message) return String(obj.message);
          if (obj.detail) return String(obj.detail);
          
          // Show all field errors
          const errorFields = Object.keys(obj).filter(key => 
            !['message', 'detail'].includes(key)
          );
          if (errorFields.length > 0) {
            return errorFields.map(field => {
              const value = obj[field];
              const msg = Array.isArray(value) ? value[0] : value;
              return `${field}: ${msg}`;
            }).join(', ');
          }
        }
        return 'An unexpected error occurred.';
      };
      toast({
        variant: "destructive",
        title: "Error",
        description: getMsg(error),
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            {activeTab === "login" ? "Welcome Back" : "Create Account"}
          </DialogTitle>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {activeTab === "signup" && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phoneNumber">Phone Number (max 15 characters)</Label>
                <Input
                  id="phoneNumber"
                  placeholder="+263 77 123 4567"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                  maxLength={15}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="meterNumber">Meter Number (max 11 characters)</Label>
                <Input
                  id="meterNumber"
                  placeholder="12345678901"
                  value={formData.meterNumber}
                  onChange={(e) => handleInputChange("meterNumber", e.target.value)}
                  maxLength={11}
                  required
                />
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password {activeTab === "signup" && "(min 8 characters)"}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                minLength={activeTab === "signup" ? 8 : undefined}
                required
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {activeTab === "signup" && (
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                required
              />
            </div>
          )}

          <Button type="submit" className="w-full mt-2">
            {activeTab === "login" ? "Sign In" : "Sign Up"}
          </Button>

          <Separator className="my-2" />

          <div className="text-center text-sm">
            {activeTab === "login" ? (
              <>
                Don’t have an account?{" "}
                <button
                  type="button"
                  className="text-primary font-medium"
                  onClick={() => setActiveTab("signup")}
                >
                  Sign Up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  className="text-primary font-medium"
                  onClick={() => setActiveTab("login")}
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
