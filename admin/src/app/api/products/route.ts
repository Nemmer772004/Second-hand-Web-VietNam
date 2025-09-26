import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

export async function GET() {
  try {
    const productsCollection = await getCollection('products');
    const products = await productsCollection.find({}).toArray();
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error in products:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
