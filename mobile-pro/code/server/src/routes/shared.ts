import type { AppName, ArtName, ArtTone, Banner } from '@pro/api/types';

import type { DB } from '../db';

export function listBanners(db: DB, app: AppName): Banner[] {
  return (
    db.prepare('SELECT * FROM banners WHERE app = ? ORDER BY sort').all(app) as {
      id: string;
      app: AppName;
      title: string;
      subtitle: string;
      cta: string;
      art: string;
      tone: string;
      link: string | null;
    }[]
  ).map((b) => ({ ...b, art: b.art as ArtName, tone: b.tone as ArtTone }));
}
