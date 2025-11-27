import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Share2, Copy, Check, MessageCircle, Twitter, Facebook, Linkedin, Mail } from 'lucide-react';

interface SocialShareProps {
  title: string;
  text: string;
  palmType?: string;
  score?: number;
}

const SocialShare = ({ title, text, palmType, score }: SocialShareProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const shareUrl = window.location.href;
  
  const shareText = `🤚 ${title}\n\n${palmType ? `Palm Type: ${palmType}` : ''}\n${score ? `Destiny Score: ${score}/100` : ''}\n\n${text.substring(0, 200)}...\n\n🕉️ Get your AI palm reading at BhaktVerse`;

  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(shareUrl);

  const shareLinks = {
    whatsapp: `https://wa.me/?text=${encodedText}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedText}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodedText}`,
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: shareText,
          url: shareUrl,
        });
        toast({ title: "Shared successfully!" });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Share error:', error);
        }
      }
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      toast({ title: "Copied to clipboard!" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  const openShareLink = (platform: keyof typeof shareLinks) => {
    window.open(shareLinks[platform], '_blank', 'width=600,height=400');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {navigator.share && (
          <DropdownMenuItem onClick={handleNativeShare} className="gap-2 cursor-pointer">
            <Share2 className="h-4 w-4 text-primary" />
            Share...
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem onClick={() => openShareLink('whatsapp')} className="gap-2 cursor-pointer">
          <MessageCircle className="h-4 w-4 text-green-500" />
          WhatsApp
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => openShareLink('twitter')} className="gap-2 cursor-pointer">
          <Twitter className="h-4 w-4 text-sky-500" />
          Twitter / X
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => openShareLink('facebook')} className="gap-2 cursor-pointer">
          <Facebook className="h-4 w-4 text-blue-600" />
          Facebook
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => openShareLink('linkedin')} className="gap-2 cursor-pointer">
          <Linkedin className="h-4 w-4 text-blue-700" />
          LinkedIn
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => openShareLink('email')} className="gap-2 cursor-pointer">
          <Mail className="h-4 w-4 text-orange-500" />
          Email
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={copyToClipboard} className="gap-2 cursor-pointer">
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          {copied ? 'Copied!' : 'Copy Text'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SocialShare;
