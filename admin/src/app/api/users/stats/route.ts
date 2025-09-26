import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

export async function GET() {
  try {
    const usersCollection = await getCollection('users');
    const total = await usersCollection.countDocuments();
    
    return NextResponse.json({ total });
  } catch (error) {
    console.error('Error in users/stats:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
