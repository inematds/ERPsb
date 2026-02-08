import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withTenantApi } from '@/core/tenant/tenant.middleware';
import { prisma } from '@/lib/prisma';

const importContactsSchema = z.object({
  contacts: z.array(
    z.object({
      name: z.string().min(1),
      phone: z.string().min(8),
    }),
  ).min(1, 'Selecione pelo menos um contato'),
});

export async function POST(request: NextRequest) {
  return withTenantApi(request, async () => {
    const body = await request.json();
    const parsed = importContactsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { contacts } = parsed.data;

    // Normalize phone numbers for comparison (digits only)
    const normalizePhone = (phone: string) => phone.replace(/\D/g, '');

    const phonesToCheck = contacts.map((c) => normalizePhone(c.phone));

    // Find existing clients by phone
    const existing = await prisma.cliente.findMany({
      where: {
        phone: { in: phonesToCheck },
      },
      select: { phone: true },
    });

    const existingPhones = new Set(existing.map((e: { phone: string }) => normalizePhone(e.phone)));

    // Filter out duplicates
    const newContacts = contacts.filter(
      (c) => !existingPhones.has(normalizePhone(c.phone)),
    );

    // Create new clients
    let imported = 0;
    for (const contact of newContacts) {
      await prisma.cliente.create({
        data: {
          tenantId: '', // auto-injected by tenant extension
          name: contact.name,
          phone: normalizePhone(contact.phone),
        },
      });
      imported++;
    }

    return NextResponse.json({
      data: {
        imported,
        duplicates: contacts.length - imported,
        total: contacts.length,
      },
    });
  });
}
