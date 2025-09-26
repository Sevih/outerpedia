// /src/app/api/pull-sim/route.ts
import { NextResponse } from 'next/server';
import { createBanner } from '@/lib/createBanner.cjs';

type Body = {
  kind: 'all' | 'premium_standard' | 'limited_rateup' | 'regular_focus';
  focus?: string[];             // slugs
  action: 'one' | 'ten' | 'exchange';
  // grantMileage ignoré côté serveur (stateless)
  exchangeSlug?: string;        // pour choisir l’unité focus (optionnel)
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const { kind, action, exchangeSlug } = body;
    const focus = Array.isArray(body.focus) ? body.focus.filter(Boolean) : [];

    // ⚠️ Pas de mileageStore / pas d’état global
    const banner = await createBanner({ kind, focus });

    if (action === 'one') {
      const pull = banner.drawOne(); // pure RNG
      return NextResponse.json(
        { ok: true, action, pull },
        { headers: { 'Cache-Control': 'no-store' } }
      );
    }

    if (action === 'ten') {
      const { pulls } = banner.drawTen(); // pure RNG
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
      // Ne gère PAS de mileage ici; renvoie juste l’entrée focus
      if (!focus.length && !exchangeSlug) {
        return NextResponse.json(
          { ok: false, error: 'No focus selected.' },
          { status: 400 }
        );
      }
      const result = banner.exchangeForFocus(exchangeSlug);
      return NextResponse.json(
        { ok: true, action, result },
        { headers: { 'Cache-Control': 'no-store' } }
      );
    }

    return NextResponse.json({ ok: false, error: 'Unknown action' }, { status: 400 });
  } catch (e: unknown) {
    const err = e instanceof Error ? e.message : 'Server error';
    return NextResponse.json({ ok: false, error: err }, { status: 500 });
  }
}
