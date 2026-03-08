import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="h-9 w-9 p-0"
      aria-label="Toggle dark mode"
    >
      {theme === 'dark' ? (
        <Sun className="h-4 w-4 text-secondary" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  );
};

export default ThemeToggle;
