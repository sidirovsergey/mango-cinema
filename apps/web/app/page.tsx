import VerticalPlayer from '@/components/VerticalPlayer';
import { EPISODES } from '@/lib/episodes';

export default function Home() {
  return <VerticalPlayer episodes={EPISODES} />;
}
