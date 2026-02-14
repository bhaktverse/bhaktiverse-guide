import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Navigation from "@/components/Navigation";
import MobileBottomNav from "@/components/MobileBottomNav";
import Breadcrumbs from "@/components/Breadcrumbs";
import { supabase } from "@/integrations/supabase/client";
import { 
  ArrowLeft, MapPin, Clock, Phone, Mail, Globe, Star, 
  Video, Calendar, Car, Wifi, Users, Utensils, Heart, 
  Share, Navigation as NavigationIcon, Camera, ExternalLink
} from "lucide-react";

interface Temple {
  id: string;
  name: string;
  primary_deity: string | null;
  tradition: string | null;
  location: any;
  description: string | null;
  history: string | null;
  visiting_hours: any;
  contact_info: any;
  live_darshan_url: string | null;
  darshan_schedule: any;
  facilities: any;
  entrance_fee: any;
  image_urls: any;
  rating: number | null;
  verified: boolean | null;
  youtube_channel_id: string | null;
}

const TempleDetail = () => {
  const { templeId } = useParams<{ templeId: string }>();
  const navigate = useNavigate();
  const [temple, setTemple] = useState<Temple | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (templeId) {
      loadTemple();
    }
  }, [templeId]);

  const loadTemple = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('temples')
        .select('*')
        .eq('id', templeId)
        .single();

      if (error) throw error;
      setTemple(data);
    } catch (error) {
      console.error('Error loading temple:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTraditionIcon = (tradition: string | null) => {
    switch (tradition?.toLowerCase()) {
      case 'shaivism': return '🔱';
      case 'vaishnavism': return '🪷';
      case 'sikhism': return '☬';
      case 'buddhism': return '☸️';
      default: return '🕉️';
    }
  };

  const getFacilityIcon = (facility: string) => {
    switch (facility.toLowerCase()) {
      case 'parking': return <Car className="h-4 w-4" />;
      case 'wifi': return <Wifi className="h-4 w-4" />;
      case 'restaurant':
      case 'prasadam':
      case 'free meals': return <Utensils className="h-4 w-4" />;
      case 'accommodation':
      case 'guest house': return <Users className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const handleShare = async () => {
    if (navigator.share && temple) {
      try {
        await navigator.share({
          title: temple.name,
          text: `Visit ${temple.name} - ${temple.description}`,
          url: window.location.href,
        });
      } catch (e) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-peace flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl animate-om-pulse">🏛️</div>
          <p className="text-muted-foreground">Loading temple details...</p>
        </div>
      </div>
    );
  }

  if (!temple) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="text-6xl mb-4">🏛️</div>
          <h2 className="text-2xl font-bold mb-2">Temple Not Found</h2>
          <p className="text-muted-foreground mb-4">The requested temple could not be found.</p>
          <Button onClick={() => navigate('/temples')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Temples
          </Button>
        </div>
      </div>
    );
  }

  const location = temple.location || {};
  const visitingHours = temple.visiting_hours || {};
  const contactInfo = temple.contact_info || {};
  const darshanSchedule = temple.darshan_schedule || {};
  const facilities = Array.isArray(temple.facilities) ? temple.facilities : [];
  const entranceFee = temple.entrance_fee || {};
  const imageUrls = Array.isArray(temple.image_urls) ? temple.image_urls : [];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6 pb-24 md:pb-8">
        <Breadcrumbs className="mb-4" />
        {/* Actions */}
        <div className="flex items-center justify-end mb-6">
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => setIsFavorite(!isFavorite)}>
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            <Button variant="outline" size="icon" onClick={handleShare}>
              <Share className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Hero Section */}
        <Card className="card-sacred overflow-hidden mb-6">
          <div className="relative h-64 md:h-80 bg-gradient-saffron">
            {imageUrls.length > 0 && imageUrls[0] !== '/placeholder.svg' ? (
              <img 
                src={imageUrls[0]} 
                alt={temple.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <span className="text-8xl">{getTraditionIcon(temple.tradition)}</span>
              </div>
            )}
            {temple.verified && (
              <Badge className="absolute top-4 right-4 bg-success text-success-foreground">
                ✓ Verified
              </Badge>
            )}
          </div>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-3xl flex items-center gap-3">
                  {getTraditionIcon(temple.tradition)}
                  {temple.name}
                </CardTitle>
                <CardDescription className="text-lg mt-2">
                  {temple.primary_deity && <span className="text-primary font-medium">{temple.primary_deity}</span>}
                  {temple.tradition && <span> • {temple.tradition}</span>}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-accent text-accent" />
                <span className="text-lg font-semibold">{temple.rating || 4.5}</span>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Description */}
            {temple.description && (
              <Card className="card-sacred">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">📜</span>
                    About
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="leading-relaxed">{temple.description}</p>
                </CardContent>
              </Card>
            )}

            {/* History */}
            {temple.history && (
              <Card className="card-sacred">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">📖</span>
                    History & Significance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="leading-relaxed">{temple.history}</p>
                </CardContent>
              </Card>
            )}

            {/* Darshan Schedule */}
            <Card className="card-sacred">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Darshan Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Morning Aarti</p>
                    <p className="font-semibold">{darshanSchedule.morning_aarti || '6:00 AM'}</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Evening Aarti</p>
                    <p className="font-semibold">{darshanSchedule.evening_aarti || '7:00 PM'}</p>
                  </div>
                  {darshanSchedule.special_darshan && (
                    <div className="p-4 bg-primary/10 rounded-lg col-span-2">
                      <p className="text-sm text-muted-foreground mb-1">Special Darshan</p>
                      <p className="font-semibold text-primary">{darshanSchedule.special_darshan}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Facilities */}
            {facilities.length > 0 && (
              <Card className="card-sacred">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">🏨</span>
                    Facilities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {facilities.map((facility: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="text-sm flex items-center gap-1 py-2 px-3">
                        {getFacilityIcon(facility)}
                        <span>{facility}</span>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Live Darshan */}
            {temple.live_darshan_url && (
              <Card className="card-sacred border-primary/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <Video className="h-5 w-5" />
                    Live Darshan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full"
                    onClick={() => window.open(temple.live_darshan_url!, '_blank')}
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Watch Live
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Location */}
            <Card className="card-sacred">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">
                  {location.address || location.city || 'Address not available'}
                  {location.city && location.state && `, ${location.city}, ${location.state}`}
                </p>
                {location.coordinates && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.open(`https://www.google.com/maps?q=${location.coordinates[0]},${location.coordinates[1]}`, '_blank')}
                  >
                    <NavigationIcon className="h-4 w-4 mr-2" />
                    Get Directions
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Visiting Hours */}
            <Card className="card-sacred">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Visiting Hours
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Morning</span>
                  <span className="font-medium">{visitingHours.morning || '6:00 AM - 12:00 PM'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Evening</span>
                  <span className="font-medium">{visitingHours.evening || '4:00 PM - 9:00 PM'}</span>
                </div>
              </CardContent>
            </Card>

            {/* Entry Fee */}
            <Card className="card-sacred">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-xl">🎫</span>
                  Entry Fee
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">General</span>
                  <span className="font-medium">
                    {entranceFee.general === 0 ? 'Free' : `₹${entranceFee.general || 0}`}
                  </span>
                </div>
                {entranceFee.special_darshan && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Special Darshan</span>
                    <span className="font-medium text-primary">₹{entranceFee.special_darshan}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="card-sacred">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {contactInfo.phone && (
                  <Button variant="outline" className="w-full justify-start" onClick={() => window.open(`tel:${contactInfo.phone}`)}>
                    <Phone className="h-4 w-4 mr-2" />
                    {contactInfo.phone}
                  </Button>
                )}
                {contactInfo.email && (
                  <Button variant="outline" className="w-full justify-start" onClick={() => window.open(`mailto:${contactInfo.email}`)}>
                    <Mail className="h-4 w-4 mr-2" />
                    {contactInfo.email}
                  </Button>
                )}
                {contactInfo.website && (
                  <Button variant="outline" className="w-full justify-start" onClick={() => window.open(contactInfo.website, '_blank')}>
                    <Globe className="h-4 w-4 mr-2" />
                    Website
                    <ExternalLink className="h-4 w-4 ml-auto" />
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <MobileBottomNav />
    </div>
  );
};

export default TempleDetail;
