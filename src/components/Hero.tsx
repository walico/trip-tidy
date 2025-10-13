"use client";

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const slides = [
  {
    id: 1,
    image: "/images/bg1.jpg",
    title: "Smart Little Things for Everyday Life.",
    subtitle: "From clever finds to practical must-haves, we bring you products that add simplicity and style to daily living.",
    button1: "Shop Now",
    button2: "Browse Collections"
  },
  {
    id: 2,
    image: "/images/bg2.jpg",
    title: "Essential Finds for Your Everyday Adventures",
    subtitle: "Discover practical solutions and clever gadgets that make every day a little more convenient and stylish.",
    button1: "Explore Travel Gear",
    button2: "View New Arrivals"
  },
  {
    id: 3,
    image: "/images/bg3.jpeg",
    title: "Little Touches for a Better Day",
    subtitle: "Simple yet thoughtful products that enhance your daily routine with ease and enjoyment.",
    button1: "Shop Best Sellers",
    button2: "Learn More"
  }
];

export default function Hero() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHoverDevice, setIsHoverDevice] = useState(false);
  
  useEffect(() => {
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
      <Swiper
        modules={[Autoplay, EffectFade, Navigation, Pagination]}
        effect={'fade'}
        loop={true}
        speed={1000}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
          el: '.hero-pagination',
          renderBullet: function (index: number, className: string) {
            return `<span class="${className} inline-block w-2.5 h-2.5 mx-1 rounded-full bg-white/50 transition-all duration-300"></span>`;
          },
        }}
        navigation={{
          nextEl: '.hero-swiper-button-next',
          prevEl: '.hero-swiper-button-prev',
        }}
        className="h-[70vh] min-h-[500px] sm:min-h-[600px] w-full"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id} className="relative">
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
                src={slide.image}
                alt=""
                fill
                priority
                className="object-cover"
                sizes="100vw"
              />
            </motion.div>
            
            <div className="absolute inset-0 bg-black/30" />
            
            <div className="absolute inset-0 flex items-center justify-center text-center px-4 sm:px-6">
              <div className="max-w-4xl w-full px-2">
                <motion.h1 
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-semibold tracking-tight text-white leading-[1]"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                >
                  {slide.title}
                </motion.h1>
                <motion.p 
                  className="mt-4 text-white/90 text-sm sm:text-base px-2 sm:px-0"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                >
                  {slide.subtitle}
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
                    {slide.button1}
                  </Link>
                  <Link 
                    href="/collections" 
                    className="w-full sm:w-auto text-center border border-white text-white hover:border-none hover:bg-[var(--color-primary)] hover:text-white transition-colors px-6 py-3 sm:px-8 sm:py-3 text-sm sm:text-base font-medium rounded-md"
                  >
                    {slide.button2}
                  </Link>
                </motion.div>
              </div>
            </div>
          </SwiperSlide>
        ))}

        {/* Navigation Buttons */}
        <div className="hero-swiper-button-prev absolute left-4 top-1/2 -translate-y-1/2 z-10 cursor-pointer bg-white/20 hover:bg-white/30 w-10 h-10 rounded-full flex items-center justify-center transition-colors">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </div>
        <div className="hero-swiper-button-next absolute right-4 top-1/2 -translate-y-1/2 z-10 cursor-pointer bg-white/20 hover:bg-white/30 w-10 h-10 rounded-full flex items-center justify-center transition-colors">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>

        {/* Pagination */}
        <div className="hero-pagination absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center" />
      </Swiper>
    </motion.section>
  );
}