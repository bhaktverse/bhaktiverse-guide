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

      // For demo purposes, check if user has been active for a while (simulate premium)
      // In production, this would check a subscriptions table
      const { data: journey } = await supabase
        .from('spiritual_journey')
        .select('level, experience_points')
        .eq('user_id', user.id)
        .single();

      // Demo: users with level 3+ or 500+ XP get premium features
      if (journey && (journey.level >= 3 || journey.experience_points >= 500)) {
        setIsPremium(true);
        setSubscriptionTier('basic');
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
