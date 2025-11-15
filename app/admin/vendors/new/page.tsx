// app/admin/vendors/new/page.tsx
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function createVendor(formData: FormData) {
  'use server';

  const name = (formData.get('name') as string | null)?.trim();
  const slugRaw = (formData.get('slug') as string | null)?.trim();
  const description =
    (formData.get('description') as string | null)?.trim() ?? '';
  const contactEmail =
    (formData.get('contactEmail') as string | null)?.trim() ?? '';
  const location =
    (formData.get('location') as string | null)?.trim() ?? '';
  const defaultCommissionRaw =
    (formData.get('defaultCommission') as string | null)?.trim() ?? '';

  if (!name) {
    throw new Error('Name is required');
  }

  const baseSlug = slugify(slugRaw || name);
  let slug = baseSlug || `vendor-${Date.now()}`;

  // ensure unique slug
  let suffix = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.vendor.findUnique({ where: { slug } });
    if (!existing) break;
    slug = `${baseSlug}-${suffix++}`;
  }

  let defaultCommission: number | null = null;
  if (defaultCommissionRaw) {
    const val = Number(defaultCommissionRaw);
    if (!Number.isNaN(val) && val > 0 && val <= 1) {
      defaultCommission = val;
    }
  }

  await prisma.vendor.create({
    data: {
      name,
      slug,
      description: description || null,
      contactEmail: contactEmail || null,
      location: location || null,
      defaultCommission,
      // status defaults to PENDING; you can change it in edit screen
    },
  });

  revalidatePath('/admin/vendors');
  redirect('/admin/vendors');
}

export default function NewVendorPage() {
  return (
    <main className="max-w-xl mx-auto py-10 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Add Vendor</h1>
        <Link href="/admin/vendors" className="text-sm text-blue-600 hover:underline">
          ← Back to list
        </Link>
      </div>

      <form action={createVendor} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="name">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="w-full border rounded px-3 py-2 text-sm"
            placeholder="e.g. Tried and True"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="slug">
            Slug (optional)
          </label>
          <input
            id="slug"
            name="slug"
            type="text"
            className="w-full border rounded px-3 py-2 text-sm"
            placeholder="e.g. tried-and-true (leave blank to auto-generate)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="contactEmail">
            Contact Email (optional)
          </label>
          <input
            id="contactEmail"
            name="contactEmail"
            type="email"
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="location">
            Location (optional)
          </label>
          <input
            id="location"
            name="location"
            type="text"
            className="w-full border rounded px-3 py-2 text-sm"
            placeholder="e.g. Missouri, USA"
          />
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-1"
            htmlFor="defaultCommission"
          >
            Default Commission to Vendor (0–1, optional)
          </label>
          <input
            id="defaultCommission"
            name="defaultCommission"
            type="number"
            min="0"
            max="1"
            step="0.01"
            className="w-full border rounded px-3 py-2 text-sm"
            placeholder="e.g. 0.70 for 70%"
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
            placeholder="Tell buyers what this store focuses on..."
          />
        </div>

        <button
          type="submit"
          className="inline-flex items-center justify-center rounded bg-black text-white px-4 py-2 text-sm font-semibold hover:bg-gray-800"
        >
          Create Vendor
        </button>
      </form>
    </main>
  );
}
