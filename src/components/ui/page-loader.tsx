'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

export function PageLoader() {
  const scrollPosition = useRef(0);

  useEffect(() => {
    // Save scroll position when loader mounts
    scrollPosition.current = window.scrollY;
    
    return () => {
      // Restore scroll position when loader unmounts
      window.scrollTo(0, scrollPosition.current);
    };
  }, []);

  return (
    <motion.div 
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <div className="relative w-32 h-32">
        {/* Shopping Bag */}
        <motion.div
          className="w-full h-full relative"
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            y: {
              repeat: Infinity,
              duration: 1.5,
              ease: 'easeInOut',
            },
          }}
        >
          {/* Bag Body */}
          <div className="absolute bottom-0 w-full h-3/4 bg-primary/20 rounded-b-lg border-2 border-[#be7960cc]">
            <div className="absolute -top-4 left-1/2 w-3/4 h-8 bg-background -translate-x-1/2 border-2 border-[#be7960cc] rounded-t-full"></div>
            
            {/* Handle */}
            <div className="absolute -top-6 left-1/2 w-1/2 h-4 border-2 border-[#be7960cc] bg-background -translate-x-1/2 rounded-t-lg"></div>
            
            {/* Items in cart */}
            <div className="absolute bottom-4 left-1/2 w-5/6 -translate-x-1/2 flex justify-center gap-1">
              {[1, 2, 3].map((item) => (
                <motion.div
                  key={item}
                  className="w-3 h-3 bg-[#be7960cc] rounded-full"
                  animate={{
                    y: [0, -5, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    y: {
                      repeat: Infinity,
                      duration: 1.5,
                      delay: item * 0.1,
                      ease: 'easeInOut',
                    },
                    scale: {
                      repeat: Infinity,
                      duration: 2,
                      delay: item * 0.1,
                      ease: 'easeInOut',
                    },
                  }}
                />
              ))}
            </div>
          </div>
          
          {/* Shimmer effect */}
          <motion.div 
            className="absolute top-0 left-0 w-1/2 h-full bg-white/20"
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: 'easeInOut',
            }}
          />
        </motion.div>
      </div>
      
      {/* Loading Text */}
      {/* <motion.div 
        className="mt-8 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <motion.h3 
          className="text-xl font-semibold text-foreground mb-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Loading Your Items
        </motion.h3>
        <motion.p 
          className="text-muted-foreground text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ delay: 0.6 }}
        >
          Just a moment, we're preparing your shopping experience
        </motion.p>
      </motion.div> */}
    </motion.div>
  );
}
