import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const CookiePolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <div className="bg-card rounded-lg shadow-lg p-8 space-y-6">
          <h1 className="text-4xl font-bold text-foreground mb-2">Cookie Policy</h1>
          <p className="text-muted-foreground text-sm">Last updated: October 17, 2024</p>

          <div className="prose prose-slate max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">1. What Are Cookies?</h2>
              <p className="text-muted-foreground leading-relaxed">
                Cookies are small text files that are placed on your device (computer, smartphone, or tablet) when you visit our website. They help us provide you with a better experience by remembering your preferences and understanding how you use our platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">2. How We Use Cookies</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                ZETDC Remote uses cookies for various purposes to enhance your experience:
              </p>
              
              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">2.1 Essential Cookies</h3>
              <p className="text-muted-foreground leading-relaxed">
                These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and accessibility.
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-2">
                <li>Authentication and account access</li>
                <li>Security and fraud prevention</li>
                <li>Load balancing and performance</li>
                <li>User session management</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">2.2 Functional Cookies</h3>
              <p className="text-muted-foreground leading-relaxed">
                These cookies enable enhanced functionality and personalization:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-2">
                <li>Remembering your login details</li>
                <li>Saving your language preferences</li>
                <li>Storing your meter information</li>
                <li>Remembering your payment preferences</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">2.3 Analytics Cookies</h3>
              <p className="text-muted-foreground leading-relaxed">
                These cookies help us understand how visitors interact with our platform:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-2">
                <li>Tracking page visits and user flow</li>
                <li>Measuring service performance</li>
                <li>Understanding user behavior patterns</li>
                <li>Identifying popular features and pages</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">2.4 Marketing Cookies</h3>
              <p className="text-muted-foreground leading-relaxed">
                These cookies are used to deliver relevant advertisements and track campaign effectiveness:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-2">
                <li>Displaying personalized content</li>
                <li>Tracking ad performance</li>
                <li>Limiting ad frequency</li>
                <li>Measuring marketing campaign success</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">3. Types of Cookies We Use</h2>
              
              <div className="bg-muted p-4 rounded-md space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Session Cookies</h4>
                  <p className="text-sm text-muted-foreground">
                    Temporary cookies that expire when you close your browser. Used for essential functions like maintaining your login session.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Persistent Cookies</h4>
                  <p className="text-sm text-muted-foreground">
                    Cookies that remain on your device for a set period or until you delete them. Used for remembering your preferences across visits.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-foreground mb-2">First-Party Cookies</h4>
                  <p className="text-sm text-muted-foreground">
                    Set directly by our website. Used for essential site functionality and analytics.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Third-Party Cookies</h4>
                  <p className="text-sm text-muted-foreground">
                    Set by external services we use, such as payment processors, analytics providers, and marketing platforms.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">4. Third-Party Cookies</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                We use services from third-party providers that may set cookies on your device:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li><strong>Payment Processors:</strong> To securely process transactions</li>
                <li><strong>Google Analytics:</strong> To understand site usage and performance</li>
                <li><strong>Social Media Platforms:</strong> To enable social sharing features</li>
                <li><strong>Customer Support Tools:</strong> To provide chat and support services</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">5. Managing Your Cookie Preferences</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                You have control over which cookies you accept:
              </p>
              
              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">5.1 Browser Settings</h3>
              <p className="text-muted-foreground leading-relaxed">
                Most web browsers allow you to control cookies through their settings. You can:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-2">
                <li>View and delete cookies</li>
                <li>Block third-party cookies</li>
                <li>Block all cookies</li>
                <li>Clear cookies when you close your browser</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">5.2 Cookie Banner</h3>
              <p className="text-muted-foreground leading-relaxed">
                When you first visit our site, we display a cookie banner allowing you to accept or customize your cookie preferences.
              </p>

              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">5.3 Impact of Disabling Cookies</h3>
              <p className="text-muted-foreground leading-relaxed">
                Please note that disabling cookies may affect the functionality of our platform. Some features may not work properly if you disable essential cookies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">6. Browser-Specific Cookie Management</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Here's how to manage cookies in popular browsers:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li><strong>Google Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
                <li><strong>Mozilla Firefox:</strong> Options → Privacy & Security → Cookies and Site Data</li>
                <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
                <li><strong>Microsoft Edge:</strong> Settings → Privacy, search, and services → Cookies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">7. Updates to This Cookie Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Cookie Policy from time to time to reflect changes in our practices or applicable laws. We will notify you of significant changes by updating the "Last updated" date at the top of this policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">8. More Information</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                For more information about cookies and how to manage them, visit:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>www.aboutcookies.org</li>
                <li>www.allaboutcookies.org</li>
                <li>Your browser's help section</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">9. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have questions about our use of cookies, please contact us:
              </p>
              <div className="bg-muted p-4 rounded-md mt-3">
                <p className="text-foreground">Email: support@zetdc-remote.com</p>
                <p className="text-foreground">Phone: +263 242 758 631</p>
                <p className="text-foreground">Address: Harare, Zimbabwe</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;
