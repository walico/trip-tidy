"use client";

import Image from 'next/image';
import Link from 'next/link';
import { motion, useTransform, useViewportScroll } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface Slide {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  button1: string;
  button2: string;
}

const slides: Slide[] = [
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
  const [isMounted, setIsMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useViewportScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);
  
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const handleSlideChange = (swiper: any) => {
    setActiveIndex(swiper.realIndex);
  };

 const slideVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: "easeOut" as const
    }
  })
};

  return (
    <motion.section 
      ref={containerRef}
      className="relative overflow-hidden bg-gray-100"
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
          delay: 8000,
          disableOnInteraction: false,
        }}
        onSlideChange={handleSlideChange}
        pagination={{
          clickable: true,
          el: '.hero-pagination',
          bulletClass: 'hero-bullet',
          bulletActiveClass: 'hero-bullet-active',
          renderBullet: (index, className) => {
            return `<span class="${className} inline-block w-3 h-3 mx-1.5 rounded-full bg-white/50 transition-all duration-300 hover:bg-white/80"></span>`;
          },
        }}
        navigation={{
          nextEl: '.hero-swiper-button-next',
          prevEl: '.hero-swiper-button-prev',
        }}
        className="h-[70vh] min-h-[600px] w-full relative"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={slide.id} className="relative">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute inset-0">
                <Image
                  src={slide.image}
                  alt=""
                  fill
                  priority
                  className="object-cover"
                  sizes="100vw"
                  quality={90}
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/30 to-transparent" />
                <div className="absolute inset-0 bg-black/30 mix-blend-multiply" />
              </div>
            </div>
            
            <div className="absolute inset-0 flex items-center justify-center text-center px-4 sm:px-6 lg:px-8">
              <div className="max-w-5xl w-full px-2 sm:px-4">
                <motion.div
                  className="space-y-4 sm:space-y-6"
                  initial="hidden"
                  animate={activeIndex === index ? "visible" : "hidden"}
                  custom={0}
                  variants={slideVariants}
                >
                  <motion.h1 
                    className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight drop-shadow-lg"
                    custom={1}
                    variants={slideVariants}
                  >
                    {slide.title}
                  </motion.h1>
                  <motion.p 
                    className="max-w-3xl mx-auto text-white/90 text-base sm:text-lg md:text-xl font-light leading-relaxed"
                    custom={2}
                    variants={slideVariants}
                  >
                    {slide.subtitle}
                  </motion.p>
                </motion.div>

                <motion.div 
                  className="mt-4 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto px-2"
                  custom={3}
                  variants={slideVariants}
                  initial="hidden"
                  animate={activeIndex === index ? "visible" : "hidden"}
                >
                  <Link 
                    href="/products" 
                    className="w-full sm:w-auto text-center bg-(--primary) text-white px-8 py-3.5 text-sm sm:text-base font-medium rounded-full transition-all duration-300 hover:opacity-90 hover:shadow-lg hover:scale-105 transform"
                  >
                    {slide.button1}
                  </Link>
                  <Link 
                    href="/collections" 
                    className="w-full sm:w-auto text-center border-2 border-white text-white hover:bg-white/10 transition-all duration-300 px-8 py-3.5 text-sm sm:text-base font-medium rounded-full hover:shadow-lg hover:scale-105 transform"
                  >
                    {slide.button2}
                  </Link>
                </motion.div>
              </div>
            </div>
          </SwiperSlide>
        ))}

        {/* Navigation Buttons */}
        <div className="hero-swiper-button-prev absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-10 cursor-pointer bg-white/10 backdrop-blur-sm hover:bg-white/20 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </div>
        <div className="hero-swiper-button-next absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-10 cursor-pointer bg-white/10 backdrop-blur-sm hover:bg-white/20 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>

        {/* Pagination */}
        <div className="hero-pagination absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center" />
      </Swiper>

      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-white text-sm font-medium flex flex-col items-center space-y-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <span className="block animate-bounce">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </span>
        <span>Scroll to explore</span>
      </motion.div>
      
      <style jsx global>{`
        .hero-bullet {
          width: 10px;
          height: 10px;
          opacity: 0.7;
          transition: all 0.3s ease;
        }
        .hero-bullet-active {
          width: 30px;
          background: white !important;
          opacity: 1;
          border-radius: 4px;
        }
        .hero-swiper-button-next:after,
        .hero-swiper-button-prev:after {
          content: '' !important;
        }
        @media (max-width: 640px) {
          .hero-bullet {
            width: 8px;
            height: 8px;
          }
          .hero-bullet-active {
            width: 24px;
          }
        }
      `}</style>
    </motion.section>
  );
}