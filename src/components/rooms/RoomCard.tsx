import { Link } from 'react-router-dom';
import { Users, Maximize, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Room } from '@/types/database';

interface RoomCardProps {
  room: Room;
}

const roomTypeLabels: Record<string, string> = {
  standard: 'Standard',
  deluxe: 'Deluxe',
  suite: 'Suite',
  presidential: 'Presidential',
};

export function RoomCard({ room }: RoomCardProps) {
  return (
    <div className="group bg-card rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
      {/* Image */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={room.image_url || '/placeholder.svg'}
          alt={room.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4">
          <Badge variant="secondary" className="bg-accent text-accent-foreground font-medium">
            {roomTypeLabels[room.room_type]}
          </Badge>
        </div>
        {!room.is_available && (
          <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center">
            <span className="text-primary-foreground font-semibold text-lg">Unavailable</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-accent text-accent" />
          ))}
        </div>

        <h3 className="text-xl font-serif font-semibold mb-2 group-hover:text-accent transition-colors">
          {room.name}
        </h3>

        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {room.description}
        </p>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{room.capacity} Guests</span>
          </div>
          {room.size_sqft && (
            <div className="flex items-center gap-1">
              <Maximize className="h-4 w-4" />
              <span>{room.size_sqft} sqft</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div>
            <span className="text-2xl font-serif font-bold text-accent">${room.price_per_night}</span>
            <span className="text-muted-foreground text-sm"> / night</span>
          </div>
          <Link to={`/rooms/${room.id}`}>
            <Button variant="gold" size="sm">
              View Details
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
