export type RoomType = 'standard' | 'deluxe' | 'suite' | 'presidential';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type AppRole = 'admin' | 'user';

export interface Room {
  id: string;
  name: string;
  description: string | null;
  room_type: RoomType;
  price_per_night: number;
  capacity: number;
  size_sqft: number | null;
  amenities: string[];
  image_url: string | null;
  images: string[];
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  room_id: string;
  check_in: string;
  check_out: string;
  total_price: number;
  guests: number;
  special_requests: string | null;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
  room?: Room;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}
