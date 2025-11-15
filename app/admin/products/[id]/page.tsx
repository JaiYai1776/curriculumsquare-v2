// app/admin/products/[id]/page.tsx
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';

type Props = {
  params: Promise<{ id: string }>;
};

async function updateProduct(formData: FormData) {
  'use server';

  const id = formData.get('id') as string | null;
  const title = (formData.get('title') as string | null)?.trim();
  const price = (formData.get('price') as string | null)?.trim();

  if (!id) {
    throw new Error('Missing product id');
  }
  if (!title || !price) {
    throw new Error('Title and price are required');
  }

  const priceNumber = Number(price);
  if (Number.isNaN(priceNumber) || priceNumber <= 0) {
    throw new Error('Price must be a positive number');
  }

  const priceCents = Math.round(priceNumber * 100);

  await prisma.product.update({
    where: { id },
    data: {
      title,
      priceCents,
      // later we’ll plug in more fields (shortDescription, status, etc.)
    },
  });

  // Keep both admin list and public list fresh
  revalidatePath('/admin/products');
  revalidatePath('/products');

  redirect('/admin/products');
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { vendor: true },
  });

  if (!product) {
    return (
      <main className="max-w-xl mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold mb-4">Product not found</h1>
        <Link href="/admin/products" className="text-blue-600 hover:underline">
          ← Back to products
        </Link>
      </main>
    );
  }

  const price = (product.priceCents / 100).toFixed(2);

  return (
    <main className="max-w-xl mx-auto py-10 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Edit Product</h1>
        <Link href="/admin/products" className="text-sm text-blue-600 hover:underline">
          ← Back to list
        </Link>
      </div>

      <p className="text-sm text-gray-600">
        Store:{' '}
        <span className="font-medium">
          {product.vendor?.name ?? 'Unknown vendor'}
        </span>
      </p>

      <form action={updateProduct} className="space-y-4">
        <input type="hidden" name="id" value={product.id} />

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="title">
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            defaultValue={product.title}
            required
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="price">
            Price (USD)
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            defaultValue={price}
            required
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>

        <button
          type="submit"
          className="inline-flex items-center justify-center rounded bg-black text-white px-4 py-2 text-sm font-semibold hover:bg-gray-800"
        >
          Save Changes
        </button>
      </form>
    </main>
  );
}
