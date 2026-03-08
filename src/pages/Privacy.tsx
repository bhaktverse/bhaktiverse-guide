import { usePageTitle } from '@/hooks/usePageTitle';
import Navigation from '@/components/Navigation';
import MobileBottomNav from '@/components/MobileBottomNav';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';

const Privacy = () => {
  usePageTitle('Privacy Policy');

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-6 pb-24 md:pb-8 max-w-3xl">
        <Breadcrumbs className="mb-6" />
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              Privacy Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none space-y-6">
            <p className="text-muted-foreground">Last updated: March 8, 2026</p>

            <section>
              <h3 className="text-lg font-semibold">1. Information We Collect</h3>
              <p className="text-muted-foreground">We collect information you provide directly: email, name, date of birth (for astrology features), palm images (for palm reading), and spiritual preferences. We also collect usage data to improve the platform.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold">2. How We Use Your Data</h3>
              <p className="text-muted-foreground">Your data is used to provide personalized spiritual guidance, generate AI-powered readings, track your spiritual journey progress, and deliver relevant notifications about festivals and events.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold">3. Data Storage & Security</h3>
              <p className="text-muted-foreground">All data is stored securely using Supabase with row-level security policies. Sensitive data like phone numbers and location are protected with restricted access policies. Palm images are stored in encrypted storage buckets.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold">4. AI Processing</h3>
              <p className="text-muted-foreground">When you use AI features (saint chat, palm reading, numerology), your input is processed through secure AI services. We do not sell or share your spiritual data with third parties for advertising.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold">5. Data Retention</h3>
              <p className="text-muted-foreground">Your data is retained as long as your account is active. You can request deletion of your account and all associated data at any time through your profile settings.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold">6. Your Rights</h3>
              <p className="text-muted-foreground">You have the right to access, correct, or delete your personal data. You can export your spiritual journey data or request complete account deletion.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold">7. Cookies & Tracking</h3>
              <p className="text-muted-foreground">We use essential cookies for authentication and session management. We do not use third-party advertising cookies.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold">8. Contact</h3>
              <p className="text-muted-foreground">For privacy-related inquiries, please reach out through our community page or contact support.</p>
            </section>
          </CardContent>
        </Card>
      </div>
      <MobileBottomNav />
    </div>
  );
};

export default Privacy;
