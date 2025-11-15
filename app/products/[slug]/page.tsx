// app/products/[slug]/page.tsx
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: { vendor: true },
  });

  if (!product) {
    notFound();
  }

  const basePrice = product.priceCents / 100;
  const salePrice = product.salePriceCents
    ? product.salePriceCents / 100
    : null;

  const ageText =
    product.ageMin || product.ageMax
      ? `Ages ${product.ageMin ?? '?'}${
          product.ageMax ? `–${product.ageMax}` : ''
        }`
      : null;

  const typeText = product.type.replace('_', ' ');

  const description =
    product.longDescription || product.shortDescription || '';

  return (
    <main className="max-w-4xl mx-auto py-10 px-4 space-y-6">
      <div className="text-sm mb-2">
        <Link href="/products" className="text-blue-600 hover:underline">
          ← Back to products
        </Link>
      </div>

      <div className="grid gap-8 md:grid-cols-[2fr,1fr] items-start">
        {/* Left: content */}
        <section className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">{product.title}</h1>
            {product.subtitle && (
              <p className="text-base text-gray-600">{product.subtitle}</p>
            )}
            <p className="text-sm text-gray-500">
              {product.vendor?.name ?? 'Unknown vendor'} · {typeText}
            </p>
          </div>

          {description && (
            <div className="space-y-3 text-sm text-gray-800 leading-relaxed">
              {description.split('\n').map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>
          )}

          {product.sku && (
            <p className="text-xs text-gray-400 mt-2">SKU: {product.sku}</p>
          )}
        </section>

        {/* Right: pricing / meta */}
        <aside className="border rounded-lg p-4 space-y-4 bg-gray-50">
          <div className="space-y-1">
            {salePrice != null ? (
              <>
                <div className="text-sm line-through text-gray-500">
                  ${basePrice.toFixed(2)}
                </div>
                <div className="text-2xl font-bold text-green-700">
                  ${salePrice.toFixed(2)}
                </div>
              </>
            ) : (
              <div className="text-2xl font-bold">
                ${basePrice.toFixed(2)}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 text-xs mt-2">
              <span className="inline-block rounded bg-gray-200 px-2 py-0.5">
                {product.status}
              </span>
              <span className="inline-block rounded bg-gray-200 px-2 py-0.5">
                {typeText}
              </span>
              {ageText && (
                <span className="inline-block rounded bg-gray-200 px-2 py-0.5">
                  {ageText}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            className="w-full inline-flex items-center justify-center rounded bg-black text-white px-4 py-2 text-sm font-semibold hover:bg-gray-800 disabled:opacity-60"
            disabled
          >
            Buy now (coming soon)
          </button>

          <div className="text-xs text-gray-500 space-y-1">
            <p>
              This is where we’ll later hook in checkout, access to downloads,
              or registration for live classes.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
