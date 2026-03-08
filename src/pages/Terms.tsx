import { usePageTitle } from '@/hooks/usePageTitle';
import Navigation from '@/components/Navigation';
import MobileBottomNav from '@/components/MobileBottomNav';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollText } from 'lucide-react';

const Terms = () => {
  usePageTitle('Terms of Service');

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-6 pb-24 md:pb-8 max-w-3xl">
        <Breadcrumbs className="mb-6" />
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ScrollText className="h-6 w-6 text-primary" />
              Terms of Service
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none space-y-6">
            <p className="text-muted-foreground">Last updated: March 8, 2026</p>

            <section>
              <h3 className="text-lg font-semibold">1. Acceptance of Terms</h3>
              <p className="text-muted-foreground">By accessing and using BhaktVerse, you accept and agree to be bound by these Terms of Service. If you do not agree, please do not use the platform.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold">2. Use of Service</h3>
              <p className="text-muted-foreground">BhaktVerse provides AI-powered spiritual guidance, educational content, and community features. Our services are for informational and devotional purposes only and should not replace professional advice.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold">3. User Accounts</h3>
              <p className="text-muted-foreground">You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate information and to update it as needed.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold">4. Content Guidelines</h3>
              <p className="text-muted-foreground">Users must respect all spiritual traditions. Hate speech, harassment, or content that disrespects any religious or spiritual practice is strictly prohibited.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold">5. AI-Generated Content</h3>
              <p className="text-muted-foreground">AI responses (palm reading, numerology, saint chats) are generated for spiritual exploration and entertainment. They should not be taken as absolute predictions or professional counsel.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold">6. Intellectual Property</h3>
              <p className="text-muted-foreground">All content, design, and technology on BhaktVerse is owned by us or our licensors. You may not reproduce or distribute platform content without permission.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold">7. Limitation of Liability</h3>
              <p className="text-muted-foreground">BhaktVerse is provided "as is." We are not liable for any decisions made based on AI-generated spiritual content or community interactions.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold">8. Contact</h3>
              <p className="text-muted-foreground">For questions about these terms, please reach out through our community page or email support.</p>
            </section>
          </CardContent>
        </Card>
      </div>
      <MobileBottomNav />
    </div>
  );
};

export default Terms;
