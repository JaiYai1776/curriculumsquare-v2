// app/products/[slug]/page.tsx
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ProductPage({ params }: Props) {
  // ✅ unwrap the Promise
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: { vendor: true },
  });

  if (!product) {
    notFound();
  }

  return (
    <main className="max-w-3xl mx-auto py-10 px-4">
      <Link href="/products" className="text-sm text-blue-600 hover:underline">
        ← Back to products
      </Link>

      <h1 className="text-3xl font-bold mt-4 mb-2">{product.title}</h1>
      <p className="text-gray-600 mb-4">Store: {product.vendor.name}</p>

      <p className="text-2xl font-semibold mb-8">
        ${(product.priceCents / 100).toFixed(2)}
      </p>

      <div className="border-t pt-4 text-sm text-gray-500">
        <p>This is a placeholder product page from the new system.</p>
      </div>
    </main>
  );
}
