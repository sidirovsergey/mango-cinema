'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';

const ProfileMenu = dynamic(() => import('@/components/auth/ProfileMenu'), { ssr: false });

export default function Header() {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-4 md:px-12 py-4 bg-black/50 backdrop-blur-md border-b border-white/5">
      <Link href="/" className="text-base font-bold tracking-widest text-mango uppercase">
        Mango Cinema
      </Link>
      <ProfileMenu />
    </header>
  );
}
