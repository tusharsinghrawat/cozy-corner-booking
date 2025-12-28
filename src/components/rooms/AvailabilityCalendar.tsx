import { useQuery } from '@tanstack/react-query';
import { format, eachDayOfInterval, parseISO, isSameDay } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AvailabilityCalendarProps {
  roomId: string;
  onSelectDates?: (checkIn: Date | undefined, checkOut: Date | undefined) => void;
  selectedCheckIn?: Date;
  selectedCheckOut?: Date;
}

interface BookingRange {
  check_in: string;
  check_out: string;
  status: string;
}

export function AvailabilityCalendar({
  roomId,
  onSelectDates,
  selectedCheckIn,
  selectedCheckOut,
}: AvailabilityCalendarProps) {
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['room-bookings', roomId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('check_in, check_out, status')
        .eq('room_id', roomId)
        .in('status', ['confirmed', 'pending']);

      if (error) throw error;
      return data as BookingRange[];
    },
  });

  // Get all booked dates
  const bookedDates = bookings?.flatMap((booking) => {
    const start = parseISO(booking.check_in);
    const end = parseISO(booking.check_out);
    return eachDayOfInterval({ start, end });
  }) || [];

  const isDateBooked = (date: Date) => {
    return bookedDates.some((bookedDate) => isSameDay(date, bookedDate));
  };

  const handleSelect = (date: Date | undefined) => {
    if (!date || !onSelectDates) return;

    if (!selectedCheckIn || (selectedCheckIn && selectedCheckOut)) {
      // Start new selection
      onSelectDates(date, undefined);
    } else {
      // Complete selection
      if (date > selectedCheckIn) {
        // Check if any date in range is booked
        const datesInRange = eachDayOfInterval({ start: selectedCheckIn, end: date });
        const hasBookedDate = datesInRange.some(isDateBooked);
        
        if (hasBookedDate) {
          // Reset and start with new date
          onSelectDates(date, undefined);
        } else {
          onSelectDates(selectedCheckIn, date);
        }
      } else {
        // If selected before check-in, make it new check-in
        onSelectDates(date, undefined);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-destructive/20 border border-destructive/40" />
          <span className="text-muted-foreground">Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-accent" />
          <span className="text-muted-foreground">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-card border border-border" />
          <span className="text-muted-foreground">Available</span>
        </div>
      </div>

      <Calendar
        mode="single"
        selected={selectedCheckIn}
        onSelect={handleSelect}
        disabled={(date) => date < new Date() || isDateBooked(date)}
        numberOfMonths={2}
        className="rounded-lg border border-border p-4 pointer-events-auto"
        classNames={{
          day_disabled: "text-muted-foreground opacity-50 line-through",
          months: "flex flex-col md:flex-row gap-4",
        }}
        modifiers={{
          booked: bookedDates,
          rangeStart: selectedCheckIn ? [selectedCheckIn] : [],
          rangeEnd: selectedCheckOut ? [selectedCheckOut] : [],
          inRange: selectedCheckIn && selectedCheckOut
            ? eachDayOfInterval({ start: selectedCheckIn, end: selectedCheckOut })
            : [],
        }}
        modifiersClassNames={{
          booked: "bg-destructive/20 text-destructive line-through cursor-not-allowed",
          rangeStart: "bg-accent text-accent-foreground rounded-l-md",
          rangeEnd: "bg-accent text-accent-foreground rounded-r-md",
          inRange: "bg-accent/30",
        }}
      />

      {selectedCheckIn && (
        <div className="text-sm text-muted-foreground">
          {selectedCheckOut ? (
            <p>
              Selected: <span className="font-medium text-foreground">{format(selectedCheckIn, 'PPP')}</span>
              {' → '}
              <span className="font-medium text-foreground">{format(selectedCheckOut, 'PPP')}</span>
            </p>
          ) : (
            <p>
              Check-in: <span className="font-medium text-foreground">{format(selectedCheckIn, 'PPP')}</span>
              <span className="text-accent"> — Select check-out date</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
