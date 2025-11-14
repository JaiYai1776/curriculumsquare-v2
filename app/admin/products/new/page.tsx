// app/admin/products/new/page.tsx
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import React from 'react';

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // replace non-alphanumeric with dashes
    .replace(/^-+|-+$/g, ''); // trim leading/trailing dashes
}

async function createProduct(formData: FormData) {
  'use server';

  const title = (formData.get('title') as string | null)?.trim();
  const price = (formData.get('price') as string | null)?.trim();
  const description = (formData.get('description') as string | null)?.trim() ?? '';

  if (!title || !price) {
    // In a real app, you'd return a proper error; for now just bail.
    throw new Error('Title and price are required');
  }

  const priceNumber = Number(price);
  if (Number.isNaN(priceNumber) || priceNumber <= 0) {
    throw new Error('Price must be a positive number');
  }

  const priceCents = Math.round(priceNumber * 100);

  // Use your existing vendor by slug from the seed: "tried-and-true"
  const vendor = await prisma.vendor.findUnique({
    where: { slug: 'tried-and-true' },
  });

  if (!vendor) {
    throw new Error('Default vendor "tried-and-true" not found. Did you run the seed?');
  }

  const baseSlug = slugify(title);
  let slug = baseSlug || `product-${Date.now()}`;

  // Ensure slug is unique; if collision, append suffix
  let suffix = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.product.findUnique({
      where: { slug },
    });
    if (!existing) break;
    slug = `${baseSlug}-${suffix++}`;
  }

  const product = await prisma.product.create({
    data: {
      title,
      slug,
      priceCents,
      vendorId: vendor.id,
      // you can add description to schema later and include it here
    },
  });

  // Revalidate product list page
  revalidatePath('/products');

  // Redirect to the new product page
  redirect(`/products/${product.slug}`);
}

export default function NewProductPage() {
  return (
    <main className="max-w-xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-4">Add New Product</h1>
      <p className="text-sm text-gray-600 mb-6">
        This form creates a product for the default vendor <strong>"Tried and True"</strong>.
      </p>

      <form action={createProduct} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="title">
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            className="w-full border rounded px-3 py-2 text-sm"
            placeholder="e.g. Pre-American Revolution Activities"
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
            required
            className="w-full border rounded px-3 py-2 text-sm"
            placeholder="e.g. 29.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="description">
            Description (optional)
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            className="w-full border rounded px-3 py-2 text-sm"
            placeholder="Short summary of what this product includes..."
          />
        </div>

        <button
          type="submit"
          className="inline-flex items-center justify-center rounded bg-black text-white px-4 py-2 text-sm font-semibold hover:bg-gray-800"
        >
          Create Product
        </button>
      </form>
    </main>
  );
}
