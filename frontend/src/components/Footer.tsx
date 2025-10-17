import { Zap, Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-primary text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">ZETDC Remote</span>
            </div>
            <p className="text-white/80 text-sm leading-relaxed">
              Empowering Zimbabwe&apos;s energy future with secure, convenient prepaid electricity top-ups from anywhere in the world.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => scrollToSection('features')} 
                  className="text-white/80 hover:text-white transition-colors text-sm text-left"
                >
                  Features
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('how-it-works')} 
                  className="text-white/80 hover:text-white transition-colors text-sm text-left"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('stats')} 
                  className="text-white/80 hover:text-white transition-colors text-sm text-left"
                >
                  About Us
                </button>
              </li>
              <li>
                <a 
                  href="mailto:support@zetdc-remote.com" 
                  className="text-white/80 hover:text-white transition-colors text-sm"
                >
                  Support
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/terms" 
                  className="text-white/80 hover:text-white transition-colors text-sm"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link 
                  to="/privacy" 
                  className="text-white/80 hover:text-white transition-colors text-sm"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link 
                  to="/cookies" 
                  className="text-white/80 hover:text-white transition-colors text-sm"
                >
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link 
                  to="/refund" 
                  className="text-white/80 hover:text-white transition-colors text-sm"
                >
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2 text-sm text-white/80">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <a 
                  href="mailto:support@zetdc-remote.com" 
                  className="hover:text-white transition-colors"
                >
                  support@zetdc-remote.com
                </a>
              </li>
              <li className="flex items-center space-x-2 text-sm text-white/80">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <a 
                  href="tel:+263242758631" 
                  className="hover:text-white transition-colors"
                >
                  +263 242 758 631
                </a>
              </li>
              <li className="flex items-center space-x-2 text-sm text-white/80">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span>Harare, Zimbabwe</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-8">
          <p className="text-white/80 text-sm text-center">
            © 2024 ZETDC Remote Prepaid Recharge Platform. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;