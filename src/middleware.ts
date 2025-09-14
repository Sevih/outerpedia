import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const USER = process.env.DEV_AUTH_USER!;
const PASS = process.env.DEV_AUTH_PASS!;

export function middleware(request: NextRequest) {
  const host = request.headers.get('host');

  // Ne protège que dev.outerpedia.com
  if (host && host.startsWith('dev.outerpedia.com')) {
    const auth = request.headers.get('authorization');

    if (auth) {
      const [scheme, encoded] = auth.split(' ');

      if (scheme === 'Basic') {
        const buff = Buffer.from(encoded, 'base64').toString();
        const [user, pass] = buff.split(':');

        if (user === USER && pass === PASS) {
          return NextResponse.next(); // ✅ autorisé
        }
      }
    }

    return new NextResponse('Authentication required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Outerpedia Dev"',
      },
    });
  }

  return NextResponse.next(); // 🌐 autres domaines non protégés
}
