import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import AuthModal from "./modals/AuthModal";

const Header = () => {
  const { loggedIn, logout } = useAuth();
  const [openAuth, setOpenAuth] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-md shadow-sm">
      <div className="container mx-auto flex items-center justify-between py-4 px-4 md:px-8">
        <div
          className="text-2xl font-bold text-primary cursor-pointer"
          onClick={() => navigate("/")}
        >
          ZETDC Website
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <a href="#features" className="text-gray-700 hover:text-primary">
            Features
          </a>
          <a href="#how" className="text-gray-700 hover:text-primary">
            How It Works
          </a>
          <a href="#support" className="text-gray-700 hover:text-primary">
            Support
          </a>
          <a href="#about" className="text-gray-700 hover:text-primary">
            About
          </a>
        </nav>

        <div className="flex items-center gap-3">
          {!loggedIn ? (
            <>
              <Button
                variant="outline"
                className="rounded-full px-5"
                onClick={() => setOpenAuth(true)}
              >
                Login
              </Button>
              <Button
                variant="default"
                className="rounded-full px-5"
                onClick={() => setOpenAuth(true)}
              >
                Sign Up
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                className="rounded-full px-5"
                onClick={() => navigate("/dashboard")}
              >
                Dashboard
              </Button>
              <Button
                variant="destructive"
                className="rounded-full px-5"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal open={openAuth} onOpenChange={setOpenAuth} />
    </header>
  );
};

export default Header;
