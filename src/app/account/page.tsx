'use client';

import { useState } from 'react';
import { User, LogOut, ShoppingBag, Heart, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  if (loading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  if (!user) {
    router.push('/login');
    return null;
  }
  
  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
      router.push('/');
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Logout Failed',
        description: 'An error occurred while logging out.',
      });
    }
  };


  // Mock data - replace with actual data fetching
  const orders = [
    { id: 'ORD-12345', date: '2024-05-20', total: 1249.98, status: 'Shipped' },
    { id: 'ORD-12332', date: '2024-04-12', total: 349.99, status: 'Delivered' },
  ];
  const wishlist = [
    { id: 'velvet-dream-sofa', name: 'Velvet Dream Sofa', price: 899.99, image: 'https://picsum.photos/seed/p1/200/200' },
    { id: 'oakwood-coffee-table', name: 'Oakwood Coffee Table', price: 249.99, image: 'https://picsum.photos/seed/p2/200/200' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div>
            <h2 className="font-headline text-2xl font-bold mb-4">My Profile</h2>
            <div className="space-y-4">
              <p><strong>Name:</strong> {user.displayName || 'N/A'}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Phone Number:</strong> {user.phoneNumber || 'Not provided'}</p>
              <Button variant="outline">Edit Profile</Button>
            </div>
          </div>
        );
      case 'orders':
        return (
          <div>
            <h2 className="font-headline text-2xl font-bold mb-4">My Orders</h2>
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="border p-4 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-bold">Order #{order.id}</p>
                    <p className="text-sm text-muted-foreground">Date: {order.date}</p>
                    <p className="text-sm text-muted-foreground">Total: ${order.total.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium bg-secondary text-secondary-foreground px-2 py-1 rounded-md">{order.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'wishlist':
        return (
          <div>
            <h2 className="font-headline text-2xl font-bold mb-4">My Wishlist</h2>
            <div className="space-y-4">
              {wishlist.map(item => (
                <div key={item.id} className="border p-4 rounded-lg flex items-center gap-4">
                  <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-md" />
                  <div className="flex-grow">
                    <p className="font-bold">{item.name}</p>
                    <p className="text-muted-foreground">${item.price.toFixed(2)}</p>
                  </div>
                  <Button asChild><Link href={`/products/${item.id}`}>View Item</Link></Button>
                </div>
              ))}
            </div>
          </div>
        );
      case 'settings':
         return (
          <div>
            <h2 className="font-headline text-2xl font-bold mb-4">Settings</h2>
            <p className="text-muted-foreground">Manage your account settings and preferences here.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">My Account</h1>
      </div>

      <div className="grid md:grid-cols-4 gap-8">
        <aside className="md:col-span-1">
          <nav className="flex flex-col space-y-2">
            <Button variant={activeTab === 'profile' ? 'secondary' : 'ghost'} onClick={() => setActiveTab('profile')} className="justify-start gap-3"><User /> Profile</Button>
            <Button variant={activeTab === 'orders' ? 'secondary' : 'ghost'} onClick={() => setActiveTab('orders')} className="justify-start gap-3"><ShoppingBag /> Orders</Button>
            <Button variant={activeTab === 'wishlist' ? 'secondary' : 'ghost'} onClick={() => setActiveTab('wishlist')} className="justify-start gap-3"><Heart /> Wishlist</Button>
            <Button variant={activeTab === 'settings' ? 'secondary' : 'ghost'} onClick={() => setActiveTab('settings')} className="justify-start gap-3"><Settings /> Settings</Button>
            <Button variant="ghost" className="justify-start gap-3 text-destructive hover:text-destructive" onClick={handleLogout}><LogOut /> Logout</Button>
          </nav>
        </aside>

        <main className="md:col-span-3">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
