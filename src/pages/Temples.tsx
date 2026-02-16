import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Navigation from "@/components/Navigation";
import MobileBottomNav from "@/components/MobileBottomNav";
import Breadcrumbs from "@/components/Breadcrumbs";
import { supabase } from "@/integrations/supabase/client";
import { 
  MapPin, 
  Search, 
  Navigation as NavigationIcon, 
  Clock, 
  Phone, 
  Star, 
  Camera,
  Heart,
  Share,
  Video,
  Calendar,
  Users,
  Wifi,
  Car,
  Utensils
} from "lucide-react";

interface Temple {
  id: string;
  name: string;
  primary_deity: string;
  tradition: string;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    coordinates: [number, number];
  };
  description: string;
  history: string;
  visiting_hours: {
    morning: string;
    evening: string;
  };
  contact_info: {
    phone?: string;
    email?: string;
    website?: string;
  };
  live_darshan_url?: string;
  darshan_schedule: {
    morning_aarti: string;
    evening_aarti: string;
    special_darshan?: string;
  };
  facilities: string[];
  entrance_fee: {
    general: number;
    special_darshan?: number;
  };
  image_urls: string[];
  rating: number;
  verified: boolean;
  distance?: number;
}

const Temples = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [temples, setTemples] = useState<Temple[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTradition, setSelectedTradition] = useState("all");
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'name'>('distance');
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    loadTemples();
  }, []);

  const loadTemples = async () => {
    try {
      setLoading(true);
      
      // Fetch temples from database
      const { data: dbTemples, error } = await supabase
        .from('temples')
        .select('*')
        .order('rating', { ascending: false });

      if (error) throw error;

      // Transform database data to match interface
      const transformedTemples: Temple[] = dbTemples?.map(temple => {
        const locationData = temple.location as any;
        const visitingHoursData = temple.visiting_hours as any;
        const contactInfoData = temple.contact_info as any;
        const darshanaData = temple.darshan_schedule as any;
        const facilitiesData = temple.facilities as any;
        const entranceFeeData = temple.entrance_fee as any;
        const imageUrlsData = temple.image_urls as any;
        
        return {
          id: temple.id,
          name: temple.name,
          primary_deity: temple.primary_deity || '',
          tradition: temple.tradition || '',
          location: locationData || {
            address: temple.name,
            city: 'Unknown',
            state: 'Unknown',
            country: 'India',
            coordinates: [0, 0]
          },
          description: temple.description || '',
          history: temple.history || '',
          visiting_hours: visitingHoursData || {
            morning: "6:00 AM - 9:00 PM",
            evening: "6:00 AM - 9:00 PM"
          },
          contact_info: contactInfoData || {},
          live_darshan_url: temple.live_darshan_url,
          darshan_schedule: darshanaData || {
            morning_aarti: "6:00 AM",
            evening_aarti: "7:00 PM"
          },
          facilities: Array.isArray(facilitiesData) ? facilitiesData : [],
          entrance_fee: entranceFeeData || { general: 0 },
          image_urls: Array.isArray(imageUrlsData) ? imageUrlsData : ["/placeholder.svg"],
          rating: Number(temple.rating) || 0,
          verified: temple.verified || false,
          distance: undefined // Real geolocation not yet implemented
        };
      }) || [];

      setTemples(transformedTemples);
      
    } catch (error) {
      console.error('Error loading temples:', error);
      
      // Fallback to sample data if database query fails
      const fallbackTemples: Temple[] = [
        {
          id: "1",
          name: "Kedarnath Temple",
          primary_deity: "Shiva",
          tradition: "Shaivism",
          location: {
            address: "Kedarnath, Rudraprayag",
            city: "Kedarnath",
            state: "Uttarakhand",
            country: "India",
            coordinates: [30.7346, 79.0669]
          },
          description: "One of the twelve Jyotirlingas, situated at an altitude of 3,583m in the Himalayas.",
          history: "Ancient temple believed to be built by Pandavas and later renovated by Adi Shankaracharya.",
          visiting_hours: {
            morning: "4:00 AM - 7:00 PM",
            evening: "4:00 AM - 7:00 PM"
          },
          contact_info: {
            phone: "+91-1364-233727"
          },
          live_darshan_url: "https://live.kedarnath.org",
          darshan_schedule: {
            morning_aarti: "4:00 AM",
            evening_aarti: "7:00 PM"
          },
          facilities: ["Helicopter Service", "Medical Aid", "Guest House", "Prasadam"],
          entrance_fee: {
            general: 0
          },
          image_urls: ["/placeholder.svg"],
          rating: 4.9,
          verified: true,
          distance: 5.2
        }
      ];
      
      setTemples(fallbackTemples);
    } finally {
      setLoading(false);
    }
  };

  const getTraditionIcon = (tradition: string) => {
    switch (tradition.toLowerCase()) {
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

  const filteredAndSortedTemples = temples
    .filter(temple => {
      const matchesSearch = temple.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           temple.primary_deity.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           temple.location.city.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTradition = selectedTradition === "all" || temple.tradition === selectedTradition;
      
      return matchesSearch && matchesTradition;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return (a.distance || 0) - (b.distance || 0);
        case 'rating':
          return b.rating - a.rating;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  const traditions = Array.from(new Set(temples.map(t => t.tradition)));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-peace flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl animate-om-pulse">🏛️</div>
          <p className="text-muted-foreground">Finding sacred temples near you...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 pb-24 md:pb-8">
        <Breadcrumbs className="mb-6" />
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-temple bg-clip-text text-transparent mb-4">
            Sacred Temples 🏛️
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover divine temples near you. Experience live darshan, plan visits, 
            and connect with sacred spaces from around the world.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search temples, deities, or locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={selectedTradition}
                onChange={(e) => setSelectedTradition(e.target.value)}
                className="px-3 py-2 border border-border rounded-md bg-background"
              >
                <option value="all">All Traditions</option>
                {traditions.map(tradition => (
                  <option key={tradition} value={tradition}>{tradition}</option>
                ))}
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'distance' | 'rating' | 'name')}
                className="px-3 py-2 border border-border rounded-md bg-background"
              >
                <option value="distance">Sort by Distance</option>
                <option value="rating">Sort by Rating</option>
                <option value="name">Sort by Name</option>
              </select>
              
              <Button
                variant="outline"
                onClick={() => setShowMap(!showMap)}
              >
                <MapPin className="h-4 w-4 mr-2" />
                {showMap ? 'List View' : 'Map View'}
              </Button>
            </div>
          </div>
        </div>

        {/* Temples Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedTemples.map((temple) => (
            <Card key={temple.id} className="card-sacred group cursor-pointer" onClick={() => navigate(`/temples/${temple.id}`)}>
              <CardHeader className="pb-3">
                <div className="relative">
                  <Avatar className="h-16 w-16 mx-auto mb-3 shadow-divine">
                    <AvatarImage src={temple.image_urls[0]} />
                    <AvatarFallback className="bg-gradient-saffron text-primary-foreground text-xl">
                      {getTraditionIcon(temple.tradition)}
                    </AvatarFallback>
                  </Avatar>
                  
                  {temple.verified && (
                    <Badge className="absolute -top-2 -right-2 bg-success text-white px-2 py-1">
                      ✓ Verified
                    </Badge>
                  )}
                </div>
                
                <CardTitle className="text-center group-hover:text-primary transition-colors">
                  {temple.name}
                </CardTitle>
                <CardDescription className="text-center">
                  {temple.primary_deity} • {temple.tradition}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Location & Distance */}
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center space-x-1 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{temple.location.city}, {temple.location.state}</span>
                  </span>
                  {temple.location?.state && (
                    <span className="text-muted-foreground text-xs">
                      {temple.location.country || 'India'}
                    </span>
                  )}
                </div>

                {/* Rating */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-gold-light text-gold-light" />
                    <span className="text-sm font-medium">{temple.rating}</span>
                    <span className="text-xs text-muted-foreground">rating</span>
                  </div>
                  
                  <Badge variant="outline" className="text-xs">
                    {temple.tradition}
                  </Badge>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {temple.description}
                </p>

                {/* Visiting Hours */}
                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Open: {temple.visiting_hours.morning}</span>
                </div>

                {/* Facilities */}
                <div className="flex flex-wrap gap-1">
                  {temple.facilities.slice(0, 4).map((facility, index) => (
                    <Badge key={index} variant="secondary" className="text-xs flex items-center space-x-1">
                      {getFacilityIcon(facility)}
                      <span>{facility}</span>
                    </Badge>
                  ))}
                  {temple.facilities.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{temple.facilities.length - 4} more
                    </Badge>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button size="sm" className="flex-1" onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/temples/${temple.id}`);
                  }}>
                    <NavigationIcon className="h-4 w-4 mr-1" />
                    Visit
                  </Button>
                  
                  <Button size="sm" variant="outline" className="flex-1" onClick={(e) => {
                    e.stopPropagation();
                    if (temple.live_darshan_url) {
                      window.open(temple.live_darshan_url, '_blank');
                    }
                  }}>
                    <Video className="h-4 w-4 mr-1" />
                    Live
                  </Button>
                </div>

                {/* Quick Actions */}
                <div className="flex justify-between pt-2 border-t border-border/50">
                  <Button variant="ghost" size="sm" onClick={(e) => {
                    e.stopPropagation();
                    // Handle favorite
                  }}>
                    <Heart className="h-4 w-4" />
                  </Button>
                  
                  <Button variant="ghost" size="sm" onClick={(e) => {
                    e.stopPropagation();
                    // Handle share
                  }}>
                    <Share className="h-4 w-4" />
                  </Button>
                  
                  <Button variant="ghost" size="sm" onClick={(e) => {
                    e.stopPropagation();
                    // Handle photo gallery
                  }}>
                    <Camera className="h-4 w-4" />
                  </Button>
                  
                  <Button variant="ghost" size="sm" onClick={(e) => {
                    e.stopPropagation();
                    // Handle event calendar
                  }}>
                    <Calendar className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredAndSortedTemples.length === 0 && (
          <Card className="card-sacred">
            <CardContent className="text-center py-12">
              <div className="text-6xl mb-4">🏛️</div>
              <h3 className="text-xl font-semibold mb-2">No Temples Found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search filters to find temples in your area.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
      
      <MobileBottomNav />
    </div>
  );
};

export default Temples;