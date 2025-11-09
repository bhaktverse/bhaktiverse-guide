import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon } from "@/components/ui/calendar";
import Navigation from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Bell, 
  Star, 
  Sun, 
  Moon, 
  Sunrise,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface SpiritualEvent {
  id: string;
  name: string;
  date: Date;
  type: 'festival' | 'aarti' | 'puja' | 'meditation' | 'pilgrimage' | 'fast';
  description: string;
  significance: string;
  location?: string;
  duration: number;
  isRecurring: boolean;
  reminderSet: boolean;
  traditions: string[];
  rituals?: string[];
}

interface TithiInfo {
  name: string;
  type: 'amavasya' | 'purnima' | 'ekadashi' | 'chaturdashi' | 'regular';
  significance?: string;
}

const SpiritualCalendar = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<SpiritualEvent[]>([]);
  const [todayTithi, setTodayTithi] = useState<TithiInfo>({ name: "Shukla Paksha Saptami", type: "regular" });
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadEvents();
      loadPanchangData();
    }
  }, [user, currentDate]);

  const loadPanchangData = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('hindu-panchang', {
        body: { 
          date: currentDate.toISOString().split('T')[0],
          latitude: 28.6139, // Delhi coordinates as default
          longitude: 77.2090
        }
      });

      if (error) throw error;

      if (data?.panchang) {
        const p = data.panchang;
        setTodayTithi({
          name: p.hindu?.tithi || 'Shukla Paksha Saptami',
          type: p.hindu?.tithi?.toLowerCase().includes('amavasya') ? 'amavasya' :
                p.hindu?.tithi?.toLowerCase().includes('purnima') ? 'purnima' :
                p.hindu?.tithi?.toLowerCase().includes('ekadashi') ? 'ekadashi' :
                p.hindu?.tithi?.toLowerCase().includes('chaturdashi') ? 'chaturdashi' : 'regular',
          significance: p.hindu?.tithi
        });
        
        // Store panchang data for display
        (window as any).currentPanchang = p;
      }
    } catch (error) {
      console.error('Error loading panchang:', error);
      // Fallback to mock data
      loadTithiInfo();
    }
  };

  const loadEvents = async () => {
    try {
      // Load events from calendar_events table
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .order('date');

      if (error) throw error;

      const dbEvents: SpiritualEvent[] = data?.map(event => ({
        id: event.id,
        name: event.title,
        date: new Date(event.date),
        type: event.event_type as any,
        description: event.description || '',
        significance: event.significance || '',
        duration: event.duration_hours ? event.duration_hours * 60 : 60,
        isRecurring: event.is_recurring || false,
        reminderSet: event.reminder_enabled || false,
        traditions: [],
        rituals: Array.isArray(event.rituals) ? event.rituals.map((r: any) => r.toString()) : []
      })) || [];

      // Add daily recurring events
      const today = new Date();
      const dailyEvents: SpiritualEvent[] = [
        {
          id: "morning-aarti",
          name: "Morning Aarti",
          date: today,
          type: "aarti",
          description: "Daily morning prayer to welcome the divine light",
          significance: "Start the day with gratitude",
          duration: 30,
          isRecurring: true,
          reminderSet: true,
          traditions: ["Hinduism"],
          rituals: ["Lamp lighting", "Bhajan singing"]
        },
        {
          id: "evening-meditation",
          name: "Evening Meditation",
          date: today,
          type: "meditation",
          description: "Daily group meditation session",
          significance: "End the day with inner peace",
          duration: 45,
          isRecurring: true,
          reminderSet: true,
          traditions: ["Universal"],
          rituals: ["Guided meditation", "Chanting"]
        }
      ];

      setEvents([...dbEvents, ...dailyEvents]);
    } catch (error) {
      console.error('Error loading events:', error);
      setEvents([]);
    }
  };

  const loadTithiInfo = () => {
    // Generate sample tithi information
    const tithis = [
      { name: "Amavasya", type: "amavasya" as const, significance: "New moon - ideal for introspection and new beginnings" },
      { name: "Purnima", type: "purnima" as const, significance: "Full moon - time for gratitude and completion" },
      { name: "Ekadashi", type: "ekadashi" as const, significance: "Fasting day for spiritual purification" },
      { name: "Shukla Paksha Saptami", type: "regular" as const },
      { name: "Krishna Paksha Chaturdashi", type: "chaturdashi" as const, significance: "Day before new moon - time for release and letting go" }
    ];
    
    setTodayTithi(tithis[Math.floor(Math.random() * tithis.length)]);
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'festival': return '🎉';
      case 'aarti': return '🪔';
      case 'puja': return '🙏';
      case 'meditation': return '🧘‍♀️';
      case 'pilgrimage': return '⛰️';
      case 'fast': return '🌙';
      default: return '📅';
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'festival': return 'bg-primary text-primary-foreground';
      case 'aarti': return 'bg-accent text-accent-foreground';
      case 'puja': return 'bg-secondary text-secondary-foreground';
      case 'meditation': return 'bg-muted text-muted-foreground';
      case 'pilgrimage': return 'bg-card text-card-foreground';
      case 'fast': return 'bg-secondary text-secondary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTithiIcon = (type: string) => {
    switch (type) {
      case 'amavasya': return '🌑';
      case 'purnima': return '🌕';
      case 'ekadashi': return '🌓';
      case 'chaturdashi': return '🌔';
      default: return '🌘';
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      event.date.toDateString() === date.toDateString() ||
      (event.isRecurring && event.type === 'aarti') ||
      (event.isRecurring && event.type === 'meditation')
    );
  };

  const todayEvents = getEventsForDate(new Date());
  const upcomingEvents = events
    .filter(event => event.date > new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-peace flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl animate-om-pulse">📅</div>
          <p className="text-muted-foreground">Loading spiritual calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Premium Header with Panchang Info */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-4 mb-6 p-6 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-2xl backdrop-blur-sm border border-primary/20">
            <div className="text-5xl">📅</div>
            <div className="text-left">
              <h1 className="text-4xl font-bold bg-gradient-temple bg-clip-text text-transparent">
                Hindu Panchang & Calendar
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          
          {/* Panchang Quick Info */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto mb-6">
            <Card className="card-sacred p-3">
              <div className="text-center">
                <div className="text-2xl mb-1">{getTithiIcon(todayTithi.type)}</div>
                <p className="text-xs text-muted-foreground mb-1">Tithi</p>
                <p className="text-sm font-semibold">{todayTithi.name.split(' ').pop()}</p>
              </div>
            </Card>
            <Card className="card-sacred p-3">
              <div className="text-center">
                <div className="text-2xl mb-1">⭐</div>
                <p className="text-xs text-muted-foreground mb-1">Nakshatra</p>
                <p className="text-sm font-semibold">
                  {(window as any).currentPanchang?.hindu?.nakshatra || 'Rohini'}
                </p>
              </div>
            </Card>
            <Card className="card-sacred p-3">
              <div className="text-center">
                <div className="text-2xl mb-1">🪐</div>
                <p className="text-xs text-muted-foreground mb-1">Yoga</p>
                <p className="text-sm font-semibold">
                  {(window as any).currentPanchang?.hindu?.yoga || 'Shiva'}
                </p>
              </div>
            </Card>
            <Card className="card-sacred p-3">
              <div className="text-center">
                <div className="text-2xl mb-1">⏰</div>
                <p className="text-xs text-muted-foreground mb-1">Sunrise</p>
                <p className="text-sm font-semibold">
                  {(window as any).currentPanchang?.timings?.sunrise || '6:12 AM'}
                </p>
              </div>
            </Card>
            <Card className="card-sacred p-3">
              <div className="text-center">
                <div className="text-2xl mb-1">🌅</div>
                <p className="text-xs text-muted-foreground mb-1">Sunset</p>
                <p className="text-sm font-semibold">
                  {(window as any).currentPanchang?.timings?.sunset || '6:45 PM'}
                </p>
              </div>
            </Card>
          </div>
          
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Traditional Hindu calendar with Panchang details, festivals, and auspicious timings
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Card className="card-sacred">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <span>Sacred Calendar</span>
                  </CardTitle>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    <span className="text-sm font-medium min-w-32 text-center">
                      {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  Click on dates to see spiritual events and significance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CalendarIcon
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  month={currentDate}
                  onMonthChange={setCurrentDate}
                  className="rounded-md border border-border/50"
                  modifiers={{
                    eventDay: (date) => getEventsForDate(date).length > 0
                  }}
                  modifiersStyles={{
                    eventDay: {
                      backgroundColor: 'hsl(var(--primary) / 0.1)',
                      color: 'hsl(var(--primary))',
                      fontWeight: 'bold'
                    }
                  }}
                />
              </CardContent>
            </Card>

            {/* Selected Date Events */}
            {selectedDate && (
              <Card className="card-sacred mt-6">
                <CardHeader>
                  <CardTitle>
                    Events for {selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {getEventsForDate(selectedDate).length > 0 ? (
                    <div className="space-y-4">
                      {getEventsForDate(selectedDate).map((event) => (
                        <div key={event.id} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/30">
                          <div className="text-2xl">{getEventTypeIcon(event.type)}</div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-medium">{event.name}</h4>
                              <Badge className={`text-xs ${getEventTypeColor(event.type)}`}>
                                {event.type}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {event.description}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <span className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{formatTime(event.duration)}</span>
                              </span>
                              {event.reminderSet && (
                                <span className="flex items-center space-x-1 text-primary">
                                  <Bell className="h-3 w-3" />
                                  <span>Reminder set</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No events scheduled for this date</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Today's Tithi */}
            <Card className="card-sacred">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="text-2xl">{getTithiIcon(todayTithi.type)}</div>
                  <span>Today's Tithi</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold text-primary">
                    {todayTithi.name}
                  </h3>
                  {todayTithi.significance && (
                    <p className="text-sm text-muted-foreground">
                      {todayTithi.significance}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Today's Events */}
            <Card className="card-sacred">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sunrise className="h-5 w-5 text-primary" />
                  <span>Today's Schedule</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {todayEvents.length > 0 ? (
                    todayEvents.map((event) => (
                      <div key={event.id} className="flex items-center space-x-3 p-2 rounded-lg bg-muted/30">
                        <div className="text-lg">{getEventTypeIcon(event.type)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{event.name}</p>
                          <p className="text-xs text-muted-foreground flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatTime(event.duration)}</span>
                          </p>
                        </div>
                        {event.reminderSet && (
                          <Bell className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <Sun className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">No events scheduled today</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card className="card-sacred">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-primary" />
                  <span>Upcoming Events</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="flex items-center space-x-3 p-2 rounded-lg bg-muted/30">
                      <div className="text-lg">{getEventTypeIcon(event.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{event.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {event.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // Toggle reminder
                          setEvents(events.map(e => 
                            e.id === event.id ? { ...e, reminderSet: !e.reminderSet } : e
                          ));
                        }}
                      >
                        <Bell className={`h-4 w-4 ${event.reminderSet ? 'text-primary' : 'text-muted-foreground'}`} />
                      </Button>
                    </div>
                  ))}
                  
                  {upcomingEvents.length === 0 && (
                    <div className="text-center py-4">
                      <Calendar className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">No upcoming events</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="card-sacred">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Bell className="h-4 w-4 mr-2" />
                  Set Daily Reminders
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MapPin className="h-4 w-4 mr-2" />
                  Find Nearby Temples
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Star className="h-4 w-4 mr-2" />
                  View Festival Details
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpiritualCalendar;