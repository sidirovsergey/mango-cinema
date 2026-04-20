export interface Episode {
  id: number;
  title: string;
  seriesTitle: string;
  hlsUrl: string;
}

export const EPISODES: Episode[] = [
  {
    id: 1,
    title: 'Эпизод 1 — Первый день',
    seriesTitle: 'Запретная школа',
    hlsUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
  },
  {
    id: 2,
    title: 'Эпизод 2 — Секрет',
    seriesTitle: 'Запретная школа',
    hlsUrl:
      'https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_16x9/bipbop_16x9_variant.m3u8',
  },
  {
    id: 3,
    title: 'Эпизод 3 — Развязка',
    seriesTitle: 'Запретная школа',
    hlsUrl:
      'https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8',
  },
];
