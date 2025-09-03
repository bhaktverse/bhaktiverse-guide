import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Navigation from "@/components/Navigation";
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
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadTemples();
    }
  }, [user]);

  const loadTemples = async () => {
    // Generate sample temple data
    const sampleTemples: Temple[] = [
      {
        id: "1",
        name: "Somnath Temple",
        primary_deity: "Shiva",
        tradition: "Shaivism",
        location: {
          address: "Somnath, Veraval",
          city: "Veraval",
          state: "Gujarat",
          country: "India",
          coordinates: [20.8880, 70.4017]
        },
        description: "One of the twelve Jyotirlinga shrines of Lord Shiva, known for its magnificent architecture and spiritual significance.",
        history: "The temple has been destroyed and rebuilt multiple times throughout history, symbolizing the eternal nature of faith.",
        visiting_hours: {
          morning: "6:00 AM - 9:00 PM",
          evening: "5:00 PM - 9:00 PM"
        },
        contact_info: {
          phone: "+91-2876-231349",
          website: "https://somnath.org"
        },
        live_darshan_url: "https://live.somnath.org",
        darshan_schedule: {
          morning_aarti: "7:00 AM",
          evening_aarti: "7:00 PM",
          special_darshan: "12:00 PM"
        },
        facilities: ["Parking", "Prasadam", "Guest House", "Wheelchair Access", "WiFi"],
        entrance_fee: {
          general: 0,
          special_darshan: 100
        },
        image_urls: ["/placeholder.svg"],
        rating: 4.8,
        verified: true,
        distance: 2.5
      },
      {
        id: "2",
        name: "Meenakshi Amman Temple",
        primary_deity: "Parvati",
        tradition: "Shaivism",
        location: {
          address: "Madurai Main",
          city: "Madurai",
          state: "Tamil Nadu",
          country: "India",
          coordinates: [9.9195, 78.1193]
        },
        description: "Historic Hindu temple dedicated to Meenakshi, a form of Parvati, and her consort Sundareshwar, a form of Shiva.",
        history: "The temple complex houses 14 gopurams (gateway towers) ranging from 45-50m in height, each a masterpiece of Dravidian architecture.",
        visiting_hours: {
          morning: "5:00 AM - 12:30 PM",
          evening: "4:00 PM - 9:30 PM"
        },
        contact_info: {
          phone: "+91-452-2345777"
        },
        live_darshan_url: "https://live.meenakshi.org",
        darshan_schedule: {
          morning_aarti: "6:30 AM",
          evening_aarti: "8:00 PM",
          special_darshan: "1:00 PM"
        },
        facilities: ["Parking", "Prasadam", "Audio Guide", "Photography", "Restaurant"],
        entrance_fee: {
          general: 50,
          special_darshan: 200
        },
        image_urls: ["/placeholder.svg"],
        rating: 4.9,
        verified: true,
        distance: 15.2
      },
      {
        id: "3",
        name: "Golden Temple",
        primary_deity: "Guru Granth Sahib",
        tradition: "Sikhism",
        location: {
          address: "Golden Temple Road",
          city: "Amritsar",
          state: "Punjab",
          country: "India",
          coordinates: [31.6200, 74.8765]
        },
        description: "The holiest Gurdwara and the most important pilgrimage site of Sikhism, known for its golden dome and sacred pool.",
        history: "Built in the 16th century by Guru Arjan, the temple welcomes people of all backgrounds to worship and partake in free meals.",
        visiting_hours: {
          morning: "24 hours",
          evening: "24 hours"
        },
        contact_info: {
          phone: "+91-183-2553954",
          website: "https://goldentemple.org"
        },
        live_darshan_url: "https://live.goldentemple.org",
        darshan_schedule: {
          morning_aarti: "3:00 AM",
          evening_aarti: "10:00 PM"
        },
        facilities: ["Free Meals", "Accommodation", "Parking", "Medical Aid", "Lost & Found"],
        entrance_fee: {
          general: 0
        },
        image_urls: ["/placeholder.svg"],
        rating: 4.9,
        verified: true,
        distance: 8.7
      },
      {
        id: "4",
        name: "Tirupati Balaji Temple",
        primary_deity: "Venkateswara",
        tradition: "Vaishnavism",
        location: {
          address: "Tirumala Hills",
          city: "Tirupati",
          state: "Andhra Pradesh",
          country: "India",
          coordinates: [13.6833, 79.3667]
        },
        description: "One of the most visited Hindu temples in the world, dedicated to Lord Venkateswara, an incarnation of Vishnu.",
        history: "The temple is believed to be constructed over a period of time with the contributions of various dynasties.",
        visiting_hours: {
          morning: "2:30 AM - 1:00 AM",
          evening: "Continuous"
        },
        contact_info: {
          phone: "+91-877-2277777",
          website: "https://tirumala.org"
        },
        live_darshan_url: "https://live.tirumala.org",
        darshan_schedule: {
          morning_aarti: "4:30 AM",
          evening_aarti: "6:00 PM",
          special_darshan: "Various times"
        },
        facilities: ["Online Booking", "Accommodation", "Prasadam", "Hair Tonsure", "TTD Services"],
        entrance_fee: {
          general: 0,
          special_darshan: 300
        },
        image_urls: ["/placeholder.svg"],
        rating: 4.7,
        verified: true,
        distance: 25.4
      },
      {
        id: "5",
        name: "Kashi Vishwanath Temple",
        primary_deity: "Shiva",
        tradition: "Shaivism",
        location: {
          address: "Vishwanath Gali, Lahori Tola",
          city: "Varanasi",
          state: "Uttar Pradesh",
          country: "India",
          coordinates: [25.3109, 83.0107]
        },
        description: "One of the most famous Hindu temples dedicated to Lord Shiva, located in the holy city of Varanasi.",
        history: "The temple has been mentioned in the Puranas and has been a place of worship for thousands of years.",
        visiting_hours: {
          morning: "2:30 AM - 11:00 AM",
          evening: "12:00 PM - 7:00 PM"
        },
        contact_info: {
          phone: "+91-542-2392059"
        },
        live_darshan_url: "https://live.kashivishwanath.org",
        darshan_schedule: {
          morning_aarti: "3:00 AM",
          evening_aarti: "7:00 PM",
          special_darshan: "4:00 AM"
        },
        facilities: ["Security", "Prasadam", "VIP Darshan", "Photography", "Guide Services"],
        entrance_fee: {
          general: 0,
          special_darshan: 250
        },
        image_urls: ["/placeholder.svg"],
        rating: 4.6,
        verified: true,
        distance: 12.8
      }
    ];

    setTemples(sampleTemples);
    setLoading(false);
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

  if (authLoading || loading) {
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
      
      <div className="container mx-auto px-4 py-8">
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
                  {temple.distance && (
                    <span className="text-primary font-medium">
                      {temple.distance} km away
                    </span>
                  )}
                </div>

                {/* Rating */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-gold-light text-gold-light" />
                    <span className="text-sm font-medium">{temple.rating}</span>
                    <span className="text-xs text-muted-foreground">(4.2k reviews)</span>
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
    </div>
  );
};

export default Temples;