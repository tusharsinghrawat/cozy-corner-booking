import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, Wifi, UtensilsCrossed, Waves, Car, Sparkles, Shield } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { RoomCard } from '@/components/rooms/RoomCard';
import { supabase } from '@/integrations/supabase/client';
import { Room } from '@/types/database';
import heroImage from '@/assets/hero-hotel.jpg';

const amenities = [
  { icon: Wifi, title: 'Free WiFi', description: 'High-speed internet throughout' },
  { icon: UtensilsCrossed, title: 'Fine Dining', description: 'World-class cuisine' },
  { icon: Waves, title: 'Spa & Pool', description: 'Relax and rejuvenate' },
  { icon: Car, title: 'Valet Parking', description: 'Complimentary service' },
  { icon: Sparkles, title: 'Room Service', description: '24/7 availability' },
  { icon: Shield, title: 'Security', description: 'Safe and secure stay' },
];

export default function Index() {
  const { data: featuredRooms, isLoading } = useQuery({
    queryKey: ['featured-rooms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('is_available', true)
        .limit(3);
      
      if (error) throw error;
      return data as Room[];
    },
  });

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative h-screen min-h-[700px] flex items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-hero" />
        </div>

        <div className="relative z-10 text-center text-primary-foreground px-4 max-w-4xl mx-auto animate-fade-in">
          <p className="text-accent font-medium tracking-widest mb-4 uppercase">Welcome to Luxury</p>
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 leading-tight">
            Experience Timeless
            <span className="block text-accent">Elegance</span>
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Discover unparalleled comfort and sophistication at GrandHotel. 
            Where every moment becomes a cherished memory.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/rooms">
              <Button variant="hero" size="xl">
                Explore Rooms
                <ChevronRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="hero-outline" size="xl">
                Learn More
              </Button>
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-primary-foreground/50 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-primary-foreground/50 rounded-full" />
          </div>
        </div>
      </section>

      {/* Amenities Section */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-accent font-medium tracking-widest mb-2 uppercase">Our Services</p>
            <h2 className="text-4xl md:text-5xl font-serif font-bold">World-Class Amenities</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {amenities.map((amenity, index) => (
              <div
                key={amenity.title}
                className="text-center p-6 bg-card rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 text-accent mb-4">
                  <amenity.icon className="h-8 w-8" />
                </div>
                <h3 className="font-semibold mb-1">{amenity.title}</h3>
                <p className="text-muted-foreground text-sm">{amenity.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Rooms Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
            <div>
              <p className="text-accent font-medium tracking-widest mb-2 uppercase">Accommodations</p>
              <h2 className="text-4xl md:text-5xl font-serif font-bold">Featured Rooms</h2>
            </div>
            <Link to="/rooms" className="mt-4 md:mt-0">
              <Button variant="outline" className="group">
                View All Rooms
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card rounded-lg overflow-hidden shadow-md animate-pulse">
                  <div className="h-64 bg-muted" />
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                    <div className="h-10 bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : featuredRooms && featuredRooms.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredRooms.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-card rounded-lg">
              <p className="text-muted-foreground text-lg">No rooms available at the moment.</p>
              <p className="text-muted-foreground">Please check back later or contact us.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
            Ready for an Unforgettable Stay?
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
            Book your room today and experience the luxury you deserve. 
            Special rates available for extended stays.
          </p>
          <Link to="/rooms">
            <Button variant="hero" size="xl">
              Book Your Room Now
              <ChevronRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
