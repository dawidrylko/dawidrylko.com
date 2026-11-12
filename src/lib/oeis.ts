import { z } from 'astro/zod';

export const OEIS_ROLES = ['author', 'contributor'] as const;

export const OEIS_ROLE_LABELS: Record<(typeof OEIS_ROLES)[number], string> = {
  author: 'Author',
  contributor: 'Contributor',
};

const isCalendarDate = (value: string) => {
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
};

export const oeisEntrySchema = z
  .object({
    id: z.string().regex(/^A\d{6}$/, { message: 'must be an OEIS A-number, e.g. A401670' }),
    name: z.string().trim().min(1),
    role: z.enum(OEIS_ROLES),
    contribution: z.array(z.string().trim().min(1)).min(1).optional(),
    date: z.string().refine(isCalendarDate, { message: 'must be a YYYY-MM-DD date' }).optional(),
  })
  .strict()
  .refine(data => data.role === 'author' || Boolean(data.contribution), {
    message: 'a contributor entry says what was contributed',
    path: ['contribution'],
  });

export type OeisEntry = z.infer<typeof oeisEntrySchema>;

export const oeisEntriesSchema = z.array(oeisEntrySchema).superRefine((list, ctx) => {
  const seen = new Set<string>();
  list.forEach(({ id }, index) => {
    if (seen.has(id)) ctx.addIssue({ code: 'custom', message: `duplicate id '${id}'`, path: [index, 'id'] });
    seen.add(id);
  });
});

export const oeisUrl = (id: string): string => `https://oeis.org/${id}`;

export const oeisAnchor = (id: string): string => `oeis-${id.toLowerCase()}`;

const ROLE_ORDER: Record<OeisEntry['role'], number> = { author: 0, contributor: 1 };

export function sortOeisEntries(list: OeisEntry[]): OeisEntry[] {
  return [...list].sort((a, b) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role] || b.id.localeCompare(a.id));
}
