import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

interface PremiumContextType {
  isPremium: boolean;
  loading: boolean;
  subscriptionTier: 'free' | 'basic' | 'premium' | 'divine';
  expiresAt: Date | null;
  checkPremiumStatus: () => Promise<void>;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

export const usePremium = () => {
  const context = useContext(PremiumContext);
  if (context === undefined) {
    throw new Error('usePremium must be used within a PremiumProvider');
  }
  return context;
};

interface PremiumProviderProps {
  children: ReactNode;
}

export const PremiumProvider = ({ children }: PremiumProviderProps) => {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subscriptionTier, setSubscriptionTier] = useState<'free' | 'basic' | 'premium' | 'divine'>('free');
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);

  const checkPremiumStatus = async () => {
    if (!user) {
      setIsPremium(false);
      setSubscriptionTier('free');
      setLoading(false);
      return;
    }

    try {
      // Check user roles for admin/moderator (they get premium by default)
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (roles?.some(r => r.role === 'admin' || r.role === 'moderator')) {
        setIsPremium(true);
        setSubscriptionTier('divine');
        setLoading(false);
        return;
      }

      // Check subscriptions table (admin-only writable, secure)
      const { data: sub } = await supabase
        .from('subscriptions' as any)
        .select('tier, status, expires_at')
        .eq('user_id', user.id)
        .maybeSingle();

      if (sub && (sub as any).status === 'active' && (!(sub as any).expires_at || new Date((sub as any).expires_at) > new Date())) {
        setIsPremium(true);
        const tier = (sub as any).tier as 'free' | 'basic' | 'premium' | 'divine';
        setSubscriptionTier(tier);
        if ((sub as any).expires_at) setExpiresAt(new Date((sub as any).expires_at));
      } else {
        setIsPremium(false);
        setSubscriptionTier('free');
      }
    } catch (error) {
      console.error('Error checking premium status:', error);
      setIsPremium(false);
      setSubscriptionTier('free');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkPremiumStatus();
  }, [user]);

  const value = {
    isPremium,
    loading,
    subscriptionTier,
    expiresAt,
    checkPremiumStatus,
  };

  return <PremiumContext.Provider value={value}>{children}</PremiumContext.Provider>;
};
