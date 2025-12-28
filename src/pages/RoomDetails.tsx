import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format, differenceInDays } from 'date-fns';
import { Users, Maximize, Check, Loader2, CalendarDays } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Room } from '@/types/database';
import { AvailabilityCalendar } from '@/components/rooms/AvailabilityCalendar';

const roomTypeLabels: Record<string, string> = {
  standard: 'Standard Room',
  deluxe: 'Deluxe Room',
  suite: 'Luxury Suite',
  presidential: 'Presidential Suite',
};

export default function RoomDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState('1');
  const [specialRequests, setSpecialRequests] = useState('');
  const [isBooking, setIsBooking] = useState(false);

  const { data: room, isLoading, error } = useQuery({
    queryKey: ['room', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      return data as Room | null;
    },
  });

  const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;
  const totalPrice = room ? nights * room.price_per_night : 0;

  const handleDateSelect = (newCheckIn: Date | undefined, newCheckOut: Date | undefined) => {
    setCheckIn(newCheckIn);
    setCheckOut(newCheckOut);
  };

  const handleBooking = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please sign in to book a room.",
      });
      navigate('/auth');
      return;
    }

    if (!checkIn || !checkOut || nights < 1) {
      toast({
        variant: "destructive",
        title: "Invalid dates",
        description: "Please select valid check-in and check-out dates.",
      });
      return;
    }

    setIsBooking(true);

    const { error } = await supabase.from('bookings').insert({
      user_id: user.id,
      room_id: id,
      check_in: format(checkIn, 'yyyy-MM-dd'),
      check_out: format(checkOut, 'yyyy-MM-dd'),
      total_price: totalPrice,
      guests: parseInt(guests),
      special_requests: specialRequests || null,
      status: 'confirmed',
    });

    setIsBooking(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Booking failed",
        description: error.message,
      });
    } else {
      // Invalidate the room bookings query to refresh availability
      queryClient.invalidateQueries({ queryKey: ['room-bookings', id] });
      
      toast({
        title: "Booking confirmed!",
        description: "Your room has been booked successfully.",
      });
      navigate('/dashboard');
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen pt-32 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      </Layout>
    );
  }

  if (error || !room) {
    return (
      <Layout>
        <div className="min-h-screen pt-32 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-serif font-bold mb-4">Room Not Found</h1>
            <p className="text-muted-foreground mb-6">The room you're looking for doesn't exist.</p>
            <Button variant="gold" onClick={() => navigate('/rooms')}>
              View All Rooms
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Room Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Main Image */}
              <div className="relative h-96 rounded-lg overflow-hidden">
                <img
                  src={room.image_url || '/placeholder.svg'}
                  alt={room.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Room Info */}
              <div>
                <p className="text-accent font-medium tracking-widest mb-2 uppercase">
                  {roomTypeLabels[room.room_type]}
                </p>
                <h1 className="text-4xl font-serif font-bold mb-4">{room.name}</h1>

                <div className="flex flex-wrap gap-6 text-muted-foreground mb-6">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-accent" />
                    <span>Up to {room.capacity} Guests</span>
                  </div>
                  {room.size_sqft && (
                    <div className="flex items-center gap-2">
                      <Maximize className="h-5 w-5 text-accent" />
                      <span>{room.size_sqft} sq ft</span>
                    </div>
                  )}
                </div>

                <p className="text-foreground/80 leading-relaxed">{room.description}</p>
              </div>

              {/* Amenities */}
              {room.amenities && room.amenities.length > 0 && (
                <div>
                  <h2 className="text-2xl font-serif font-bold mb-4">Room Amenities</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {room.amenities.map((amenity) => (
                      <div key={amenity} className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-accent" />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Availability Calendar */}
              <div className="bg-card rounded-lg shadow-md p-6 border border-border">
                <div className="flex items-center gap-2 mb-6">
                  <CalendarDays className="h-6 w-6 text-accent" />
                  <h2 className="text-2xl font-serif font-bold">Check Availability</h2>
                </div>
                <p className="text-muted-foreground mb-6">
                  Select your check-in and check-out dates. Dates marked in red are already booked.
                </p>
                <AvailabilityCalendar
                  roomId={id!}
                  onSelectDates={handleDateSelect}
                  selectedCheckIn={checkIn}
                  selectedCheckOut={checkOut}
                />
              </div>
            </div>

            {/* Booking Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 bg-card rounded-lg shadow-xl p-6 border border-border">
                <div className="text-center mb-6">
                  <span className="text-3xl font-serif font-bold text-accent">
                    ${room.price_per_night}
                  </span>
                  <span className="text-muted-foreground"> / night</span>
                </div>

                {/* Selected Dates Display */}
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Check-in</p>
                      <p className="font-semibold">
                        {checkIn ? format(checkIn, 'MMM d, yyyy') : 'Select date'}
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Check-out</p>
                      <p className="font-semibold">
                        {checkOut ? format(checkOut, 'MMM d, yyyy') : 'Select date'}
                      </p>
                    </div>
                  </div>

                  {/* Guests */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Guests</label>
                    <Select value={guests} onValueChange={setGuests}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select guests" />
                      </SelectTrigger>
                      <SelectContent>
                        {[...Array(room.capacity)].map((_, i) => (
                          <SelectItem key={i + 1} value={String(i + 1)}>
                            {i + 1} Guest{i > 0 ? 's' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Special Requests */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Special Requests</label>
                    <Textarea
                      placeholder="Any special requests..."
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>

                {/* Price Summary */}
                {nights > 0 && (
                  <div className="border-t border-border pt-4 mb-6 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        ${room.price_per_night} x {nights} night{nights > 1 ? 's' : ''}
                      </span>
                      <span>${totalPrice}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-accent">${totalPrice}</span>
                    </div>
                  </div>
                )}

                <Button
                  variant="gold"
                  className="w-full"
                  size="lg"
                  onClick={handleBooking}
                  disabled={!room.is_available || isBooking || nights < 1}
                >
                  {isBooking ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : room.is_available ? (
                    nights > 0 ? 'Confirm Booking' : 'Select Dates'
                  ) : (
                    'Unavailable'
                  )}
                </Button>

                {!user && (
                  <p className="text-center text-muted-foreground text-sm mt-4">
                    Please sign in to make a booking
                  </p>
                )}

                {nights < 1 && checkIn && !checkOut && (
                  <p className="text-center text-accent text-sm mt-4">
                    Now select your check-out date from the calendar
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
