import { Zap, Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
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
              <a href="#" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#features" className="text-white/80 hover:text-white transition-colors text-sm">Features</a></li>
              <li><a href="#how-it-works" className="text-white/80 hover:text-white transition-colors text-sm">How It Works</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors text-sm">Pricing</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors text-sm">FAQ</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors text-sm">Support</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-white/80 hover:text-white transition-colors text-sm">Terms of Service</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors text-sm">Privacy Policy</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors text-sm">Cookie Policy</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors text-sm">Refund Policy</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2 text-sm text-white/80">
                <Mail className="h-4 w-4" />
                <span>support@zetdc-remote.com</span>
              </li>
              <li className="flex items-center space-x-2 text-sm text-white/80">
                <Phone className="h-4 w-4" />
                <span>+263 242 758 631</span>
              </li>
              <li className="flex items-center space-x-2 text-sm text-white/80">
                <MapPin className="h-4 w-4" />
                <span>Harare, Zimbabwe</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/80 text-sm">
            © 2024 ZETDC Remote Prepaid Recharge Platform. All rights reserved.
          </p>
          <p className="text-white/80 text-sm mt-4 md:mt-0">
            Made with ❤️ for Zimbabwe&apos;s future
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;