import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

export async function GET() {
  try {
    const ordersCollection = await getCollection('orders');
    const orders = await ordersCollection.find({}).toArray();
    
    const stats = {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
    };
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error in orders/stats:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
