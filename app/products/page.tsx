// app/products/page.tsx
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    include: { vendor: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <main className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">All Products</h1>

      {products.length === 0 ? (
        <p>No products yet.</p>
      ) : (
        <ul className="space-y-4">
          {products.map((product) => (
            <li
              key={product.id}
              className="border rounded-lg p-4 flex items-center justify-between"
            >
              <div>
                <Link
                  href={`/products/${product.slug}`}
                  className="text-lg font-semibold hover:underline"
                >
                  {product.title}
                </Link>
                <p className="text-sm text-gray-600">
                  Store: {product.vendor.name}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">
                  ${(product.priceCents / 100).toFixed(2)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
