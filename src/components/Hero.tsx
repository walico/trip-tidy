"use client";

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function Hero() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHoverDevice, setIsHoverDevice] = useState(false);
  
  useEffect(() => {
    // Check if device supports hover (not touch devices)
    const hasHover = typeof window !== 'undefined' ? 
      window.matchMedia('(hover: hover)').matches : 
      false;
    setIsHoverDevice(hasHover);

    const handleMouseMove = (e: MouseEvent) => {
      if (!hasHover) return;
      
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      });
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  return (
    <motion.section 
      className="relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="relative h-[70vh] min-h-[500px] sm:min-h-[600px] w-full">
        <motion.div 
          className="absolute inset-0"
          animate={isHoverDevice ? {
            x: mousePosition.x * 0.5,
            y: mousePosition.y * 0.5,
            scale: 1.1
          } : {}}
          transition={{ 
            type: 'spring', 
            stiffness: 50, 
            damping: 20,
          }}
        >
          <Image
            src="/images/bg1.jpg"
            alt="Lifestyle hero with travel gear"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        </motion.div>
        
        <div className="absolute inset-0 bg-black/30" />
        
        <motion.div 
          className="absolute inset-0 flex items-center justify-center text-center px-4 sm:px-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          <div className="max-w-4xl w-full px-2">
            <motion.h1 
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-semibold tracking-tight text-white leading-[1]"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              Smart Little Things for Everyday Life.
            </motion.h1>
            <motion.p 
              className="mt-4 text-white/90 text-sm sm:text-base px-2 sm:px-0"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              From clever finds to practical must-haves, we bring you products that add simplicity and style to daily living.
            </motion.p>
            <motion.div 
              className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto px-2 sm:px-0"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <Link 
                href="/products" 
                className="w-full sm:w-auto text-center bg-[var(--color-primary)] text-white px-6 py-3 sm:px-8 sm:py-3 text-sm sm:text-base font-medium rounded-md transition-colors hover:bg-[var(--color-primary-dark)]"
              >
                Shop Now
              </Link>
              <Link 
                href="/collections" 
                className="w-full sm:w-auto text-center border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-colors px-6 py-3 sm:px-8 sm:py-3 text-sm sm:text-base font-medium rounded-md"
              >
                Browse Collections
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}