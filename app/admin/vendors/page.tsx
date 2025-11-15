// app/admin/vendors/page.tsx
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function AdminVendorsPage() {
  const vendors = await prisma.vendor.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      products: true,
    },
  });

  return (
    <main className="max-w-5xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Admin – Vendors</h1>
        <Link
          href="/admin/vendors/new"
          className="inline-flex items-center rounded bg-black text-white px-4 py-2 text-sm font-semibold hover:bg-gray-800"
        >
          + New Vendor
        </Link>
      </div>

      {vendors.length === 0 ? (
        <p>No vendors yet.</p>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 pr-4">Name</th>
              <th className="text-left py-2 pr-4">Slug</th>
              <th className="text-left py-2 pr-4">Status</th>
              <th className="text-left py-2 pr-4">Products</th>
              <th className="text-left py-2 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((vendor) => (
              <tr key={vendor.id} className="border-b align-top">
                <td className="py-2 pr-4">
                  <div className="font-medium">{vendor.name}</div>
                  {vendor.location && (
                    <div className="text-xs text-gray-500">
                      {vendor.location}
                    </div>
                  )}
                </td>
                <td className="py-2 pr-4 text-xs text-gray-600">
                  {vendor.slug}
                </td>
                <td className="py-2 pr-4">
                  <span className="inline-block rounded bg-gray-100 px-2 py-0.5 text-xs">
                    {vendor.status}
                  </span>
                </td>
                <td className="py-2 pr-4">
                  {vendor.products.length}
                </td>
                <td className="py-2 pr-4 space-x-2 text-xs">
                  <Link
                    href={`/admin/vendors/${vendor.id}`}
                    className="text-purple-600 hover:underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
