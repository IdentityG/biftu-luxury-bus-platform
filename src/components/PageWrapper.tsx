'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export function PageWrapper({
  children,
  overHero = false,
  showChrome = true,
}: {
  children: React.ReactNode;
  overHero?: boolean;
  showChrome?: boolean;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-white">
      {showChrome && <Navbar overHero={overHero} />}
      <AnimatePresence mode="wait">
        <motion.main
          key={pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28 }}
        >
          {children}
        </motion.main>
      </AnimatePresence>
      {showChrome && <Footer />}
    </div>
  );
}
