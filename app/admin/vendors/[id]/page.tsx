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
  const subtitle = (formData.get('subtitle') as string | null)?.trim() || null;
  const price = (formData.get('price') as string | null)?.trim();
  const salePrice = (formData.get('salePrice') as string | null)?.trim();
  const shortDescription =
    (formData.get('shortDescription') as string | null)?.trim() || null;
  const longDescription =
    (formData.get('longDescription') as string | null)?.trim() || null;

  const type = (formData.get('type') as string | null)?.trim() || 'DIGITAL_DOWNLOAD';
  const status = (formData.get('status') as string | null)?.trim() || 'PUBLISHED';

  const ageMinRaw = (formData.get('ageMin') as string | null)?.trim();
  const ageMaxRaw = (formData.get('ageMax') as string | null)?.trim();
  const sku = (formData.get('sku') as string | null)?.trim() || null;
  const thumbnailUrl =
    (formData.get('thumbnailUrl') as string | null)?.trim() || null;
  const featuredRaw = formData.get('featured') as string | null;

  if (!id) throw new Error('Missing product id');
  if (!title || !price) throw new Error('Title and price are required');

  const priceNumber = Number(price);
  if (Number.isNaN(priceNumber) || priceNumber <= 0) {
    throw new Error('Price must be a positive number');
  }
  const priceCents = Math.round(priceNumber * 100);

  let salePriceCents: number | null = null;
  if (salePrice) {
    const saleNumber = Number(salePrice);
    if (!Number.isNaN(saleNumber) && saleNumber > 0) {
      salePriceCents = Math.round(saleNumber * 100);
    }
  }

  const ageMin = ageMinRaw ? Number(ageMinRaw) : null;
  const ageMax = ageMaxRaw ? Number(ageMaxRaw) : null;
  const featured = featuredRaw === 'on';

  await prisma.product.update({
    where: { id },
    data: {
      title,
      subtitle,
      priceCents,
      salePriceCents,
      shortDescription,
      longDescription,
      type: type as any,
      status: status as any,
      ageMin,
      ageMax,
      sku,
      thumbnailUrl,
      featured,
    },
  });

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
  const salePrice =
    product.salePriceCents != null
      ? (product.salePriceCents / 100).toFixed(2)
      : '';

  return (
    <main className="max-w-3xl mx-auto py-10 px-4 space-y-6">
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

      <form action={updateProduct} className="space-y-6">
        <input type="hidden" name="id" value={product.id} />

        <section className="space-y-4">
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
            <label className="block text-sm font-medium mb-1" htmlFor="subtitle">
              Subtitle
            </label>
            <input
              id="subtitle"
              name="subtitle"
              type="text"
              defaultValue={product.subtitle ?? ''}
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="salePrice">
                Sale Price
              </label>
              <input
                id="salePrice"
                name="salePrice"
                type="number"
                min="0"
                step="0.01"
                defaultValue={salePrice}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="sku">
                SKU
              </label>
              <input
                id="sku"
                name="sku"
                type="text"
                defaultValue={product.sku ?? ''}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <label
              className="block text-sm font-medium mb-1"
              htmlFor="shortDescription"
            >
              Short Description
            </label>
            <textarea
              id="shortDescription"
              name="shortDescription"
              rows={3}
              defaultValue={product.shortDescription ?? ''}
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-1"
              htmlFor="longDescription"
            >
              Long Description
            </label>
            <textarea
              id="longDescription"
              name="longDescription"
              rows={6}
              defaultValue={product.longDescription ?? ''}
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>
        </section>

        <section className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="type">
                Product Type
              </label>
              <select
                id="type"
                name="type"
                defaultValue={product.type}
                className="w-full border rounded px-3 py-2 text-sm"
              >
                <option value="DIGITAL_DOWNLOAD">Digital Download</option>
                <option value="LIVE_CLASS">Live Class</option>
                <option value="BUNDLE">Bundle</option>
                <option value="PHYSICAL">Physical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="status">
                Status
              </label>
              <select
                id="status"
                name="status"
                defaultValue={product.status}
                className="w-full border rounded px-3 py-2 text-sm"
              >
                <option value="DRAFT">Draft</option>
                <option value="PENDING_REVIEW">Pending Review</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="featured">
                Featured
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="featured"
                  name="featured"
                  type="checkbox"
                  defaultChecked={product.featured}
                />
                <span className="text-xs text-gray-600">
                  Show in featured sections
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="ageMin">
                Age Minimum
              </label>
              <input
                id="ageMin"
                name="ageMin"
                type="number"
                min="0"
                defaultValue={product.ageMin ?? ''}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="ageMax">
                Age Maximum
              </label>
              <input
                id="ageMax"
                name="ageMax"
                type="number"
                min="0"
                defaultValue={product.ageMax ?? ''}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-1"
              htmlFor="thumbnailUrl"
            >
              Thumbnail URL
            </label>
            <input
              id="thumbnailUrl"
              name="thumbnailUrl"
              type="text"
              defaultValue={product.thumbnailUrl ?? ''}
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>
        </section>

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
