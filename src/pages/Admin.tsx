import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Plus, Edit, Trash2, Loader2, Hotel, Calendar, Users as UsersIcon } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Room, Booking, RoomType, BookingStatus } from '@/types/database';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800',
};

export default function Admin() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isRoomDialogOpen, setIsRoomDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  const [roomForm, setRoomForm] = useState({
    name: '',
    description: '',
    room_type: 'standard' as RoomType,
    price_per_night: '',
    capacity: '2',
    size_sqft: '',
    amenities: '',
    image_url: '',
    is_available: true,
  });

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You don't have permission to access this page.",
      });
      navigate('/');
    }
  }, [user, isAdmin, loading, navigate, toast]);

  // Fetch rooms
  const { data: rooms, isLoading: roomsLoading } = useQuery({
    queryKey: ['admin-rooms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Room[];
    },
    enabled: isAdmin,
  });

  // Fetch bookings with room and user info
  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          room:rooms(name)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  // Create/Update room mutation
  const roomMutation = useMutation({
    mutationFn: async (room: any) => {
      if (editingRoom) {
        const { error } = await supabase
          .from('rooms')
          .update(room)
          .eq('id', editingRoom.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('rooms').insert([room]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rooms'] });
      toast({
        title: editingRoom ? 'Room updated' : 'Room created',
        description: editingRoom
          ? 'The room has been updated successfully.'
          : 'The room has been created successfully.',
      });
      setIsRoomDialogOpen(false);
      resetRoomForm();
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  // Delete room mutation
  const deleteRoomMutation = useMutation({
    mutationFn: async (roomId: string) => {
      const { error } = await supabase.from('rooms').delete().eq('id', roomId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rooms'] });
      toast({
        title: 'Room deleted',
        description: 'The room has been deleted successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  // Update booking status mutation
  const updateBookingMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: BookingStatus }) => {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      toast({
        title: 'Booking updated',
        description: 'The booking status has been updated.',
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const resetRoomForm = () => {
    setRoomForm({
      name: '',
      description: '',
      room_type: 'standard',
      price_per_night: '',
      capacity: '2',
      size_sqft: '',
      amenities: '',
      image_url: '',
      is_available: true,
    });
    setEditingRoom(null);
  };

  const handleEditRoom = (room: Room) => {
    setEditingRoom(room);
    setRoomForm({
      name: room.name,
      description: room.description || '',
      room_type: room.room_type,
      price_per_night: String(room.price_per_night),
      capacity: String(room.capacity),
      size_sqft: room.size_sqft ? String(room.size_sqft) : '',
      amenities: room.amenities?.join(', ') || '',
      image_url: room.image_url || '',
      is_available: room.is_available,
    });
    setIsRoomDialogOpen(true);
  };

  const handleSubmitRoom = () => {
    const roomData = {
      name: roomForm.name,
      description: roomForm.description || null,
      room_type: roomForm.room_type,
      price_per_night: parseFloat(roomForm.price_per_night),
      capacity: parseInt(roomForm.capacity),
      size_sqft: roomForm.size_sqft ? parseInt(roomForm.size_sqft) : null,
      amenities: roomForm.amenities.split(',').map((a) => a.trim()).filter(Boolean),
      image_url: roomForm.image_url || null,
      is_available: roomForm.is_available,
    };

    roomMutation.mutate(roomData);
  };

  if (loading || !isAdmin) {
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-serif font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage rooms and bookings</p>
            </div>
          </div>

          <Tabs defaultValue="rooms" className="space-y-8">
            <TabsList className="bg-card">
              <TabsTrigger value="rooms" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
                <Hotel className="h-4 w-4 mr-2" />
                Rooms
              </TabsTrigger>
              <TabsTrigger value="bookings" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
                <Calendar className="h-4 w-4 mr-2" />
                Bookings
              </TabsTrigger>
            </TabsList>

            {/* Rooms Tab */}
            <TabsContent value="rooms">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-serif font-bold">Manage Rooms</h2>
                <Dialog open={isRoomDialogOpen} onOpenChange={setIsRoomDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="gold" onClick={resetRoomForm}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Room
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="font-serif text-xl">
                        {editingRoom ? 'Edit Room' : 'Add New Room'}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Room Name</Label>
                          <Input
                            value={roomForm.name}
                            onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
                            placeholder="Deluxe Suite"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Room Type</Label>
                          <Select
                            value={roomForm.room_type}
                            onValueChange={(value: RoomType) => setRoomForm({ ...roomForm, room_type: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="standard">Standard</SelectItem>
                              <SelectItem value="deluxe">Deluxe</SelectItem>
                              <SelectItem value="suite">Suite</SelectItem>
                              <SelectItem value="presidential">Presidential</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={roomForm.description}
                          onChange={(e) => setRoomForm({ ...roomForm, description: e.target.value })}
                          placeholder="Describe the room..."
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Price/Night ($)</Label>
                          <Input
                            type="number"
                            value={roomForm.price_per_night}
                            onChange={(e) => setRoomForm({ ...roomForm, price_per_night: e.target.value })}
                            placeholder="150"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Capacity</Label>
                          <Input
                            type="number"
                            value={roomForm.capacity}
                            onChange={(e) => setRoomForm({ ...roomForm, capacity: e.target.value })}
                            placeholder="2"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Size (sq ft)</Label>
                          <Input
                            type="number"
                            value={roomForm.size_sqft}
                            onChange={(e) => setRoomForm({ ...roomForm, size_sqft: e.target.value })}
                            placeholder="400"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Image URL</Label>
                        <Input
                          value={roomForm.image_url}
                          onChange={(e) => setRoomForm({ ...roomForm, image_url: e.target.value })}
                          placeholder="https://..."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Amenities (comma-separated)</Label>
                        <Input
                          value={roomForm.amenities}
                          onChange={(e) => setRoomForm({ ...roomForm, amenities: e.target.value })}
                          placeholder="WiFi, TV, Mini Bar, Bathtub"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="is_available"
                          checked={roomForm.is_available}
                          onChange={(e) => setRoomForm({ ...roomForm, is_available: e.target.checked })}
                          className="rounded border-input"
                        />
                        <Label htmlFor="is_available">Available for booking</Label>
                      </div>

                      <Button
                        variant="gold"
                        onClick={handleSubmitRoom}
                        disabled={roomMutation.isPending || !roomForm.name || !roomForm.price_per_night}
                      >
                        {roomMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                        {editingRoom ? 'Update Room' : 'Create Room'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {roomsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-accent" />
                </div>
              ) : rooms && rooms.length > 0 ? (
                <div className="bg-card rounded-lg shadow-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="text-left p-4 font-medium">Room</th>
                          <th className="text-left p-4 font-medium">Type</th>
                          <th className="text-left p-4 font-medium">Price</th>
                          <th className="text-left p-4 font-medium">Capacity</th>
                          <th className="text-left p-4 font-medium">Status</th>
                          <th className="text-left p-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rooms.map((room) => (
                          <tr key={room.id} className="border-t border-border">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={room.image_url || '/placeholder.svg'}
                                  alt={room.name}
                                  className="w-12 h-12 rounded object-cover"
                                />
                                <span className="font-medium">{room.name}</span>
                              </div>
                            </td>
                            <td className="p-4 capitalize">{room.room_type}</td>
                            <td className="p-4">${room.price_per_night}</td>
                            <td className="p-4">{room.capacity} guests</td>
                            <td className="p-4">
                              <Badge variant={room.is_available ? "default" : "secondary"}>
                                {room.is_available ? 'Available' : 'Unavailable'}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <Button size="sm" variant="ghost" onClick={() => handleEditRoom(room)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => deleteRoomMutation.mutate(room.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-card rounded-lg">
                  <Hotel className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No rooms yet. Add your first room!</p>
                </div>
              )}
            </TabsContent>

            {/* Bookings Tab */}
            <TabsContent value="bookings">
              <h2 className="text-2xl font-serif font-bold mb-6">Manage Bookings</h2>

              {bookingsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-accent" />
                </div>
              ) : bookings && bookings.length > 0 ? (
                <div className="bg-card rounded-lg shadow-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="text-left p-4 font-medium">Room</th>
                          <th className="text-left p-4 font-medium">Check-in</th>
                          <th className="text-left p-4 font-medium">Check-out</th>
                          <th className="text-left p-4 font-medium">Guests</th>
                          <th className="text-left p-4 font-medium">Total</th>
                          <th className="text-left p-4 font-medium">Status</th>
                          <th className="text-left p-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map((booking: any) => (
                          <tr key={booking.id} className="border-t border-border">
                            <td className="p-4 font-medium">{booking.room?.name}</td>
                            <td className="p-4">{format(new Date(booking.check_in), 'PP')}</td>
                            <td className="p-4">{format(new Date(booking.check_out), 'PP')}</td>
                            <td className="p-4">{booking.guests}</td>
                            <td className="p-4 text-accent font-bold">${booking.total_price}</td>
                            <td className="p-4">
                              <Badge className={statusColors[booking.status]}>
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <Select
                                value={booking.status}
                                onValueChange={(status: BookingStatus) =>
                                  updateBookingMutation.mutate({ id: booking.id, status })
                                }
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="confirmed">Confirmed</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-card rounded-lg">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No bookings yet.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
