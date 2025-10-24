import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const TermsOfService = () => {
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
          <h1 className="text-4xl font-bold text-foreground mb-2">Terms of Service</h1>
          <p className="text-muted-foreground text-sm">Last updated: October 17, 2024</p>

          <div className="prose prose-slate max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using the ZETDC Remote Prepaid Recharge Platform ("Service"), you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these terms, please do not use our Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">2. Service Description</h2>
              <p className="text-muted-foreground leading-relaxed">
                ZETDC Remote provides a platform for purchasing prepaid electricity tokens for Zimbabwe Electricity Distribution Company (ZETDC) meters. We act as an intermediary service to facilitate electricity top-ups from anywhere in the world.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">3. User Accounts</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                To use our Service, you must:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Provide accurate and complete registration information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Be at least 18 years of age or have parental consent</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">4. Payment and Pricing</h2>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>All prices are displayed in USD and are subject to change</li>
                <li>Payment must be made through approved payment methods</li>
                <li>Service fees may apply to transactions</li>
                <li>You are responsible for all charges incurred under your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">5. Token Delivery</h2>
              <p className="text-muted-foreground leading-relaxed">
                We strive to deliver electricity tokens immediately upon successful payment. However, delivery times may vary due to technical issues, network problems, or ZETDC system maintenance. We are not liable for delays beyond our control.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">6. Refunds and Cancellations</h2>
              <p className="text-muted-foreground leading-relaxed">
                Please refer to our Refund Policy for detailed information about refunds and cancellations. Generally, once a token has been successfully generated and delivered, it cannot be refunded.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">7. User Conduct</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">You agree not to:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Use the Service for any illegal or unauthorized purpose</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with or disrupt the Service</li>
                <li>Provide false or misleading information</li>
                <li>Use automated systems to access the Service without permission</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">8. Intellectual Property</h2>
              <p className="text-muted-foreground leading-relaxed">
                All content, trademarks, and other intellectual property on the Service are owned by ZETDC Remote or its licensors. You may not use, reproduce, or distribute any content without our written permission.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">9. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                ZETDC Remote shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the Service. Our total liability shall not exceed the amount you paid for the transaction in question.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">10. Service Modifications</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify, suspend, or discontinue the Service at any time without notice. We may also update these Terms of Service periodically. Continued use of the Service constitutes acceptance of modified terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">11. Governing Law</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of Zimbabwe. Any disputes shall be resolved in the courts of Zimbabwe.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">12. Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about these Terms of Service, please contact us at:
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

export default TermsOfService;
