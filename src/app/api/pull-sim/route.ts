import { NextResponse } from 'next/server';
import { createBanner} from '@/lib/createBanner.cjs';
// On importe le module CJS côté serveur :

// === Store de mileage en mémoire (simple) ===
// Remplace par une persistance réelle plus tard (DB, KV, etc.)
const mileageMap = new Map<string, number>();
const store = {
  get: (k: string) => mileageMap.get(k) ?? 0,
  set: (k: string, v: number) => mileageMap.set(k, v),
};

type Body = {
  kind: 'all' | 'premium_standard' | 'limited_rateup' | 'regular_focus';
  focus?: string[];             // slugs
  action: 'one' | 'ten' | 'exchange';
  grantMileage?: boolean;       // par défaut true; utile pour tickets event
  exchangeSlug?: string;        // optionnel pour choisir le slug à échanger
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;

    const kind = body.kind;
    const focus: string[] = Array.isArray(body.focus)
      ? body.focus.filter(Boolean)
      : [];

    // construit la bannière à la volée, en branchant le mileage store
    const banner = await createBanner({
      kind,
      focus,
      mileageStore: store,
      // mileageKeyOverride possible ici si tu veux scoper différemment
    });

    if (body.action === 'one') {
      const res = banner.drawOne({ grantMileage: body.grantMileage !== false });
      return NextResponse.json({
        ok: true,
        action: 'one',
        pull: res,
        mileage: banner.getMileage(),
      });
    }

    if (body.action === 'ten') {
      const res = banner.drawTen({ grantMileage: body.grantMileage !== false });
      return NextResponse.json({
        ok: true,
        action: 'ten',
        ...res,
        mileage: banner.getMileage(),
      });
    }

    if (body.action === 'exchange') {
      if (!banner.canExchange()) {
        return NextResponse.json(
          { ok: false, error: 'Not enough mileage or no focus set.', mileage: banner.getMileage() },
          { status: 400 }
        );
      }
      const ex = banner.exchangeForFocus(body.exchangeSlug);
      return NextResponse.json({
        ok: true,
        action: 'exchange',
        result: ex,
        mileage: banner.getMileage(),
      });
    }

    return NextResponse.json({ ok: false, error: 'Unknown action' }, { status: 400 });
  } catch (e: unknown) {
    const err = e instanceof Error ? e.message : 'Server error';
    return NextResponse.json({ ok: false, error: err }, { status: 500 });
  }
}
