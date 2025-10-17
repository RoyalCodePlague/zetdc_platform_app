import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const RefundPolicy = () => {
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
          <h1 className="text-4xl font-bold text-foreground mb-2">Refund Policy</h1>
          <p className="text-muted-foreground text-sm">Last updated: October 17, 2024</p>

          <div className="prose prose-slate max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">1. Overview</h2>
              <p className="text-muted-foreground leading-relaxed">
                At ZETDC Remote, we strive to provide reliable and efficient electricity token services. This Refund Policy outlines the circumstances under which refunds may be issued and the process for requesting a refund.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">2. General Refund Policy</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Due to the nature of prepaid electricity tokens, refunds are generally not available once a token has been successfully generated and delivered. However, we understand that errors can occur, and we handle each case individually.
              </p>
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md p-4 mt-4">
                <p className="text-amber-900 dark:text-amber-200 text-sm font-medium">
                  ⚠️ Important: Please ensure that you enter the correct meter number before completing your purchase. We cannot refund purchases made to incorrect meter numbers.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">3. Eligible Refund Scenarios</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Refunds may be issued in the following situations:
              </p>
              
              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">3.1 Token Not Generated</h3>
              <p className="text-muted-foreground leading-relaxed">
                If your payment was processed but no electricity token was generated due to a system error on our end.
              </p>

              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">3.2 Duplicate Charges</h3>
              <p className="text-muted-foreground leading-relaxed">
                If you were charged multiple times for the same transaction due to a technical error.
              </p>

              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">3.3 Invalid Token Provided</h3>
              <p className="text-muted-foreground leading-relaxed">
                If the token provided is invalid or cannot be loaded onto your meter due to our system error (not meter-related issues).
              </p>

              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">3.4 Service Unavailable</h3>
              <p className="text-muted-foreground leading-relaxed">
                If we are unable to provide the service due to extended system maintenance or technical difficulties.
              </p>

              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">3.5 Incorrect Amount Charged</h3>
              <p className="text-muted-foreground leading-relaxed">
                If you were charged an amount different from what was displayed at checkout due to a system error.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">4. Non-Refundable Scenarios</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Refunds will NOT be issued in the following cases:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Token successfully loaded onto the correct meter</li>
                <li>Incorrect meter number entered by the user</li>
                <li>Change of mind after successful token delivery</li>
                <li>Meter-related technical issues (contact ZETDC directly)</li>
                <li>User error in entering payment information</li>
                <li>Tokens not loaded due to meter being tampered with or faulty</li>
                <li>Purchases made more than 30 days ago</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">5. Refund Request Process</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                To request a refund, follow these steps:
              </p>
              
              <div className="bg-muted p-4 rounded-md space-y-3">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Step 1: Contact Support</h4>
                  <p className="text-sm text-muted-foreground">
                    Email us at support@zetdc-remote.com or call +263 242 758 631 within 7 days of the transaction.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Step 2: Provide Details</h4>
                  <p className="text-sm text-muted-foreground">
                    Include your transaction ID, meter number, date of purchase, amount paid, and detailed description of the issue.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Step 3: Investigation</h4>
                  <p className="text-sm text-muted-foreground">
                    Our team will investigate your claim within 3-5 business days.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Step 4: Resolution</h4>
                  <p className="text-sm text-muted-foreground">
                    If approved, refunds will be processed within 7-10 business days to your original payment method.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">6. Refund Processing Time</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Once a refund is approved:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li><strong>Credit/Debit Cards:</strong> 5-10 business days</li>
                <li><strong>Mobile Money:</strong> 1-3 business days</li>
                <li><strong>Bank Transfers:</strong> 3-7 business days</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Please note that processing times may vary depending on your financial institution.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">7. Partial Refunds</h2>
              <p className="text-muted-foreground leading-relaxed">
                In certain circumstances, partial refunds may be issued. This includes situations where:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-2">
                <li>You received partial electricity units due to a calculation error</li>
                <li>Service fees were incorrectly applied</li>
                <li>Processing errors resulted in incorrect token values</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">8. Chargebacks</h2>
              <p className="text-muted-foreground leading-relaxed">
                We strongly encourage you to contact us directly before initiating a chargeback with your bank or payment provider. Chargebacks initiated without prior contact may result in:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-2">
                <li>Account suspension pending investigation</li>
                <li>Additional processing fees</li>
                <li>Difficulty resolving future issues</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-3">
                We are committed to resolving all disputes fairly and efficiently.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">9. Service Credits</h2>
              <p className="text-muted-foreground leading-relaxed">
                In lieu of a monetary refund, we may offer service credits for future purchases. Service credits:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-2">
                <li>Are valid for 12 months from issuance</li>
                <li>Cannot be transferred or redeemed for cash</li>
                <li>Can be used for any electricity token purchase</li>
                <li>Will be automatically applied at checkout</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">10. Exceptions and Special Cases</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to make exceptions to this policy on a case-by-case basis for extraordinary circumstances. Each situation will be reviewed individually by our management team.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">11. Prevention Tips</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                To avoid issues that may require refunds:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Double-check your meter number before purchasing</li>
                <li>Verify the amount before completing payment</li>
                <li>Save your transaction confirmation for records</li>
                <li>Ensure your meter is functioning properly</li>
                <li>Contact support immediately if you notice any issues</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">12. Changes to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to update this Refund Policy at any time. Changes will be effective immediately upon posting. Your continued use of our service after any changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">13. Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                For refund requests or questions about this policy, please contact us:
              </p>
              <div className="bg-muted p-4 rounded-md mt-3">
                <p className="text-foreground font-semibold mb-2">Customer Support</p>
                <p className="text-foreground">Email: support@zetdc-remote.com</p>
                <p className="text-foreground">Phone: +263 242 758 631</p>
                <p className="text-foreground">Address: Harare, Zimbabwe</p>
                <p className="text-foreground mt-2">Business Hours: Monday - Friday, 8:00 AM - 5:00 PM CAT</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;
