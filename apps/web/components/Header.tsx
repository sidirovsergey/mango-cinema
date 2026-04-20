import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 flex items-center px-4 py-3 bg-black/90 backdrop-blur border-b border-white/5">
      <Link href="/" className="text-base font-bold tracking-widest text-mango uppercase">
        Mango Cinema
      </Link>
    </header>
  );
}
