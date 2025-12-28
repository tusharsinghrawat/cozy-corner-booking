import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Calendar, MapPin, Users, Clock, Loader2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Booking, Room } from '@/types/database';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800',
};

export default function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['user-bookings', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          room:rooms(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as (Booking & { room: Room })[];
    },
    enabled: !!user,
  });

  const { data: profile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen pt-32 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="pt-32 pb-16 min-h-screen bg-secondary">
        <div className="container mx-auto px-4">
          {/* Welcome Section */}
          <div className="mb-12">
            <h1 className="text-4xl font-serif font-bold mb-2">
              Welcome, {profile?.full_name || 'Guest'}
            </h1>
            <p className="text-muted-foreground">
              Manage your bookings and account details
            </p>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-card rounded-lg shadow-md p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-accent/10 rounded-full">
                  <Calendar className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Total Bookings</p>
                  <p className="text-2xl font-bold">{bookings?.length || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg shadow-md p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Active Bookings</p>
                  <p className="text-2xl font-bold">
                    {bookings?.filter((b) => b.status === 'confirmed').length || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg shadow-md p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Completed Stays</p>
                  <p className="text-2xl font-bold">
                    {bookings?.filter((b) => b.status === 'completed').length || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bookings List */}
          <div>
            <h2 className="text-2xl font-serif font-bold mb-6">Your Bookings</h2>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-accent" />
              </div>
            ) : bookings && bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-card rounded-lg shadow-md p-6 flex flex-col md:flex-row gap-6"
                  >
                    {/* Room Image */}
                    <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={booking.room?.image_url || '/placeholder.svg'}
                        alt={booking.room?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Booking Details */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                        <h3 className="text-xl font-serif font-semibold">
                          {booking.room?.name}
                        </h3>
                        <Badge className={statusColors[booking.status]}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground mb-4">
                        <div>
                          <p className="font-medium text-foreground">Check-in</p>
                          <p>{format(new Date(booking.check_in), 'PP')}</p>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Check-out</p>
                          <p>{format(new Date(booking.check_out), 'PP')}</p>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Guests</p>
                          <p>{booking.guests}</p>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Total</p>
                          <p className="text-accent font-bold">${booking.total_price}</p>
                        </div>
                      </div>

                      {booking.special_requests && (
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">Special Requests:</span>{' '}
                          {booking.special_requests}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-card rounded-lg">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Bookings Yet</h3>
                <p className="text-muted-foreground mb-6">
                  You haven't made any bookings yet. Start exploring our rooms!
                </p>
                <Button variant="gold" onClick={() => navigate('/rooms')}>
                  Browse Rooms
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
