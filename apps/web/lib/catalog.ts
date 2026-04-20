export type Episode = {
  id: string;
  number: number;
  title: string;
  duration: number; // seconds
  videoUrl: string;
  isFree: boolean;
};

export type Series = {
  slug: string;
  title: string;
  description: string;
  tagline: string;
  genres: string[];
  posterUrl: string;
  bannerUrl: string;
  episodes: Episode[];
};

// HLS streams used as video source; player will use object-fit: cover to crop to 9:16
const HLS = [
  'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
  'https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_16x9/bipbop_16x9_variant.m3u8',
  'https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8',
  'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
  'https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_16x9/bipbop_16x9_variant.m3u8',
];

function hls(i: number): string {
  return HLS[i % HLS.length]!;
}

function picsum(seed: string, w: number, h: number): string {
  return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}

export const CATALOG: Series[] = [
  {
    slug: 'forbidden-school',
    title: 'Запретная школа',
    description:
      'Ученица элитной академии влюбляется в того, с кем нельзя.',
    tagline: 'Любовь, нарушающая все правила',
    genres: ['драма', 'романтика'],
    posterUrl: picsum('mango-forbidden-school', 400, 600),
    bannerUrl: picsum('mango-forbidden-school-banner', 600, 800),
    episodes: [
      { id: 'forbidden-school-ep-1', number: 1, title: 'Первый день', duration: 185, videoUrl: hls(0), isFree: true },
      { id: 'forbidden-school-ep-2', number: 2, title: 'Случайная встреча', duration: 192, videoUrl: hls(1), isFree: true },
      { id: 'forbidden-school-ep-3', number: 3, title: 'Запретный взгляд', duration: 178, videoUrl: hls(2), isFree: false },
      { id: 'forbidden-school-ep-4', number: 4, title: 'Тайна раскрыта', duration: 201, videoUrl: hls(3), isFree: false },
      { id: 'forbidden-school-ep-5', number: 5, title: 'Последний шанс', duration: 215, videoUrl: hls(4), isFree: false },
    ],
  },
  {
    slug: 'friends-secret',
    title: 'Секрет подруги',
    description:
      'Лучшая подруга скрывает то, что разрушит обе их жизни.',
    tagline: 'Не все тайны стоит знать',
    genres: ['драма', 'триллер'],
    posterUrl: picsum('mango-friends-secret', 400, 600),
    bannerUrl: picsum('mango-friends-secret-banner', 600, 800),
    episodes: [
      { id: 'friends-secret-ep-1', number: 1, title: 'Старая фотография', duration: 175, videoUrl: hls(0), isFree: true },
      { id: 'friends-secret-ep-2', number: 2, title: 'Ложь во спасение', duration: 188, videoUrl: hls(1), isFree: true },
      { id: 'friends-secret-ep-3', number: 3, title: 'Ночной звонок', duration: 196, videoUrl: hls(2), isFree: false },
      { id: 'friends-secret-ep-4', number: 4, title: 'Развязка', duration: 210, videoUrl: hls(3), isFree: false },
    ],
  },
  {
    slug: 'married-to-boss',
    title: 'Замужем за боссом',
    description:
      'Фиктивный брак с миллиардером превращается в настоящий.',
    tagline: 'Контракт, который изменил всё',
    genres: ['офисная романтика'],
    posterUrl: picsum('mango-married-to-boss', 400, 600),
    bannerUrl: picsum('mango-married-to-boss-banner', 600, 800),
    episodes: [
      { id: 'married-to-boss-ep-1', number: 1, title: 'Деловое предложение', duration: 182, videoUrl: hls(0), isFree: true },
      { id: 'married-to-boss-ep-2', number: 2, title: 'Первая ночь', duration: 190, videoUrl: hls(1), isFree: true },
      { id: 'married-to-boss-ep-3', number: 3, title: 'Ревность', duration: 185, videoUrl: hls(2), isFree: false },
      { id: 'married-to-boss-ep-4', number: 4, title: 'Признание', duration: 198, videoUrl: hls(3), isFree: false },
      { id: 'married-to-boss-ep-5', number: 5, title: 'Настоящий брак', duration: 220, videoUrl: hls(4), isFree: false },
    ],
  },
  {
    slug: 'against-all',
    title: 'Вопреки всему',
    description:
      'Любовь, которую все считают невозможной.',
    tagline: 'Когда мир против — сердце за',
    genres: ['мелодрама'],
    posterUrl: picsum('mango-against-all', 400, 600),
    bannerUrl: picsum('mango-against-all-banner', 600, 800),
    episodes: [
      { id: 'against-all-ep-1', number: 1, title: 'Невозможная встреча', duration: 179, videoUrl: hls(0), isFree: true },
      { id: 'against-all-ep-2', number: 2, title: 'Преграды', duration: 193, videoUrl: hls(1), isFree: true },
      { id: 'against-all-ep-3', number: 3, title: 'Вместе навсегда', duration: 187, videoUrl: hls(2), isFree: false },
      { id: 'against-all-ep-4', number: 4, title: 'Вопреки', duration: 205, videoUrl: hls(3), isFree: false },
    ],
  },
  {
    slug: 'ghost-past',
    title: 'Призрак прошлого',
    description:
      'Старая семейная тайна возвращается через 20 лет.',
    tagline: 'Прошлое не умирает',
    genres: ['мистика', 'триллер'],
    posterUrl: picsum('mango-ghost-past', 400, 600),
    bannerUrl: picsum('mango-ghost-past-banner', 600, 800),
    episodes: [
      { id: 'ghost-past-ep-1', number: 1, title: 'Старый дом', duration: 183, videoUrl: hls(0), isFree: true },
      { id: 'ghost-past-ep-2', number: 2, title: 'Тёмный коридор', duration: 196, videoUrl: hls(1), isFree: true },
      { id: 'ghost-past-ep-3', number: 3, title: 'Голос из прошлого', duration: 201, videoUrl: hls(2), isFree: false },
      { id: 'ghost-past-ep-4', number: 4, title: 'Конец тайны', duration: 218, videoUrl: hls(3), isFree: false },
    ],
  },
];
