import { NextResponse } from 'next/server';
import { IS_DEV } from '@/lib/admin/guard';
import type { GuideDraft } from '@/lib/admin/guide-draft';
import { addGuideVersion, loadGuideDraft, saveGuideDraft } from '@/lib/admin/guide-store';
import {
  isEditableGeneralGuide,
  saveFreeHeroes,
  savePremiumLimited,
  type FreeHeroesData,
  type PremiumLimitedData,
} from '@/lib/admin/general-guide-store';

type Body =
  | { op: 'save'; draft: GuideDraft }
  | { op: 'save'; data: FreeHeroesData | PremiumLimitedData }
  | { op: 'add-version'; newKey: string; fromKey: string };

// Outil local : 403 en prod, écriture fichier seulement en dev.
export async function POST(
  req: Request,
  { params }: { params: Promise<{ category: string; slug: string }> },
) {
  if (!IS_DEV) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const { category, slug } = await params;
  const body = (await req.json()) as Body;

  // Guides GÉNÉRAUX à fragment éditable : payload bespoke (`data`), store dédié
  // dispatché par slug.
  if (category === 'general-guides') {
    if (body.op !== 'save' || !('data' in body))
      return NextResponse.json({ error: 'op inconnue' }, { status: 400 });
    if (!isEditableGeneralGuide(slug))
      return NextResponse.json({ error: 'guide non éditable' }, { status: 400 });
    const errors =
      slug === 'premium-limited'
        ? await savePremiumLimited(body.data as PremiumLimitedData)
        : await saveFreeHeroes(body.data as FreeHeroesData);
    if (errors.length) return NextResponse.json({ ok: false, errors }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  if (body.op === 'save' && 'draft' in body) {
    const errors = await saveGuideDraft(category, slug, body.draft);
    if (errors.length) return NextResponse.json({ ok: false, errors }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  if (body.op === 'add-version') {
    const errors = addGuideVersion(category, slug, body.newKey, body.fromKey);
    if (errors.length) return NextResponse.json({ ok: false, errors }, { status: 400 });
    // Recharge le guide (la nouvelle version est découverte au scan) pour que
    // le client remplace son état sans deviner la forme dupliquée.
    return NextResponse.json({ ok: true, draft: loadGuideDraft(category, slug) });
  }

  return NextResponse.json({ error: 'op inconnue' }, { status: 400 });
}
