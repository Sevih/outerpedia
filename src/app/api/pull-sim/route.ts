import { NextResponse } from 'next/server';
import { createBanner } from '@/lib/createBanner.cjs';

// Types partagés
type Kind = 'all' | 'premium_standard' | 'limited_rateup' | 'regular_focus';

type Body = {
  kind: Kind;
  focus?: string[];                 // slugs
  action: 'one' | 'ten' | 'exchange';
  exchangeSlug?: string;            // slug explicite pour l'exchange (fallback: focus[0])
};

type PoolEntry = {
  slug: string;
  rarity: number;
  id?: string;
  name?: string;
  element?: string;
  class?: string;
  badge?: string | null;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const { kind, action, exchangeSlug } = body;
    const focus = Array.isArray(body.focus) ? body.focus.filter(Boolean) : [];

    // Serveur stateless : pas de mileage ici.
    const banner = await createBanner({ kind, focus });

    if (action === 'one') {
      const pull = banner.drawOne();
      return NextResponse.json(
        { ok: true, action, pull },
        { headers: { 'Cache-Control': 'no-store' } }
      );
    }

    if (action === 'ten') {
      const { pulls } = banner.drawTen();
      const stats = {
        total: pulls.length,
        star1: pulls.filter(p => p.rarity === 1).length,
        star2: pulls.filter(p => p.rarity === 2).length,
        star3: pulls.filter(p => p.rarity === 3).length,
      };
      return NextResponse.json(
        { ok: true, action, pulls, stats },
        { headers: { 'Cache-Control': 'no-store' } }
      );
    }

    if (action === 'exchange') {
      const slug = exchangeSlug || focus[0];
      if (!slug) {
        return NextResponse.json(
          { ok: false, error: 'No focus selected.' },
          { status: 400 }
        );
      }

      try {
        // 1) Essaye SANS argument : beaucoup d’implémentations utilisent this.focus en interne
        const result = banner.exchangeForFocus();
        // Optionnel: si tu veux t'assurer que c'est bien le bon slug,
        // vérifie result.pick.slug et sinon continue sur le fallback ci-dessous.
        return NextResponse.json(
          { ok: true, action, result },
          { headers: { 'Cache-Control': 'no-store' } }
        );
      } catch {
        // 2) Fallback : cherche le perso 3★ par slug dans les pools de la bannière
        try {
          // @ts-expect-error: pools est exposé par createBanner.cjs
          const entry = banner.pools?.star3?.find((e: PoolEntry) => e.slug === slug);
          if (!entry) {
            return NextResponse.json(
              { ok: false, error: 'Unknown focus.' },
              { status: 400 }
            );
          }
          const result = { rarity: 3 as const, pick: entry };
          return NextResponse.json(
            { ok: true, action, result },
            { headers: { 'Cache-Control': 'no-store' } }
          );
        } catch {
          return NextResponse.json(
            { ok: false, error: 'Unknown focus.' },
            { status: 400 }
          );
        }
      }
    }


    return NextResponse.json({ ok: false, error: 'Unknown action' }, { status: 400 });
  } catch (e: unknown) {
    const err = e instanceof Error ? e.message : 'Server error';
    return NextResponse.json({ ok: false, error: err }, { status: 500 });
  }
}
