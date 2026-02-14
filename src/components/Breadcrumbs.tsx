import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
}

const ROUTE_LABELS: Record<string, { label: string; icon?: string }> = {
  '/': { label: 'Home', icon: '🏠' },
  '/dashboard': { label: 'Dashboard', icon: '📊' },
  '/saints': { label: 'Saints', icon: '🧘‍♂️' },
  '/temples': { label: 'Temples', icon: '🏛️' },
  '/scriptures': { label: 'Scriptures', icon: '📚' },
  '/audio-library': { label: 'Audio Library', icon: '🎵' },
  '/community': { label: 'Community', icon: '👥' },
  '/palm-reading': { label: 'Palm Reading', icon: '🤚' },
  '/numerology': { label: 'Numerology', icon: '🔮' },
  '/daily-devotion': { label: 'Daily Devotion', icon: '🙏' },
  '/spiritual-calendar': { label: 'Calendar', icon: '📅' },
  '/premium': { label: 'Premium', icon: '👑' },
  '/divine-dashboard': { label: 'Divine Dashboard', icon: '✨' },
  '/auth': { label: 'Login', icon: '🔐' },
  '/horoscope': { label: 'Horoscope', icon: '🌟' },
  '/kundali-match': { label: 'Kundali Match', icon: '💑' },
  '/profile': { label: 'Profile', icon: '👤' },
};

interface BreadcrumbsProps {
  className?: string;
  showHome?: boolean;
}

const Breadcrumbs = ({ className = '', showHome = true }: BreadcrumbsProps) => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  const breadcrumbs: BreadcrumbItem[] = [];

  if (showHome && location.pathname !== '/') {
    breadcrumbs.push({
      label: 'Home',
      path: '/',
      icon: <Home className="h-4 w-4" />
    });
  }

  let currentPath = '';
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const routeInfo = ROUTE_LABELS[currentPath];
    
    breadcrumbs.push({
      label: routeInfo?.label || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
      path: currentPath,
      icon: routeInfo?.icon ? <span className="text-sm">{routeInfo.icon}</span> : undefined
    });
  });

  if (breadcrumbs.length <= 1 && location.pathname === '/') {
    return null;
  }

  return (
    <nav className={`flex items-center space-x-1 text-sm ${className}`}>
      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;
        
        return (
          <div key={crumb.path} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-muted-foreground/50 mx-1" />
            )}
            
            {isLast ? (
              <span className="flex items-center gap-1.5 text-foreground font-medium">
                {crumb.icon}
                <span>{crumb.label}</span>
              </span>
            ) : (
              <Link
                to={crumb.path}
                className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
              >
                {crumb.icon}
                <span>{crumb.label}</span>
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
