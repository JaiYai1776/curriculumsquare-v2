// app/products/page.tsx
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    include: { vendor: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <main className="max-w-5xl mx-auto py-10 px-4 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Products</h1>
        <p className="text-sm text-gray-600">
          A growing collection of simulations, classes, and resources from trusted homeschool vendors.
        </p>
      </header>

      {products.length === 0 ? (
        <p>No products yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {products.map((product) => {
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

            const typeText = product.type.replace('_', ' '); // e.g. DIGITAL_DOWNLOAD → DIGITAL DOWNLOAD

            return (
              <article
                key={product.id}
                className="border rounded-lg p-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold">
                    <Link
                      href={`/products/${product.slug}`}
                      className="hover:underline"
                    >
                      {product.title}
                    </Link>
                  </h2>

                  {product.subtitle && (
                    <p className="text-xs text-gray-600">{product.subtitle}</p>
                  )}

                  <p className="text-xs text-gray-500">
                    {product.vendor?.name ?? 'Unknown vendor'} · {typeText}
                  </p>

                  {product.shortDescription && (
                    <p className="text-sm text-gray-700 mt-1">
                      {product.shortDescription}
                    </p>
                  )}
                </div>

                <div className="flex items-end justify-between mt-4">
                  <div className="space-x-2">
                    {salePrice != null ? (
                      <>
                        <span className="text-sm line-through text-gray-500">
                          ${basePrice.toFixed(2)}
                        </span>
                        <span className="text-base font-semibold text-green-700">
                          ${salePrice.toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <span className="text-base font-semibold">
                        ${basePrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <div className="text-right space-y-1">
                    {ageText && (
                      <div className="text-xs text-gray-500">{ageText}</div>
                    )}
                    {product.featured && (
                      <span className="inline-block rounded bg-yellow-100 text-yellow-800 px-2 py-0.5 text-xs">
                        Featured
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
