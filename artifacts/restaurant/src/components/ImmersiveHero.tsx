import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import type { MenuItem } from "@/types";

const FALLBACK_COLORS = ["#F4845F", "#6BBF7A", "#E882B4", "#6EB5FF", "#F9A826", "#8C52FF"];

interface ImmersiveHeroProps {
  items: MenuItem[];
}

export default function ImmersiveHero({ items }: ImmersiveHeroProps) {
  const { settings } = useSettings();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  
  // Create a safe items array with at least 1 item to prevent crash
  const safeItems = items && items.length > 0 ? items : [
    { id: "1", name: "Menu Coming Soon", description: "Delicious food is on its way!", image: "", price: 0 } as MenuItem
  ];
  const N = safeItems.length;

  useEffect(() => {
    // Preload images (skip if not available)
    safeItems.forEach((item) => {
      if (item.image) {
        const img = new Image();
        img.src = item.image;
      }
    });
    
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [safeItems]);

  const navigate = (dir: 'next' | 'prev') => {
    if (isAnimating || N <= 1) return;
    setIsAnimating(true);
    if (dir === 'next') {
      setActiveIndex((prev) => (prev + 1) % N);
    } else {
      setActiveIndex((prev) => (prev - 1 + N) % N);
    }
    setTimeout(() => setIsAnimating(false), 650);
  };

  const getRole = (index: number) => {
    if (N === 1) return "center";
    if (index === activeIndex) return "center";
    if (index === (activeIndex - 1 + N) % N) return "left";
    if (index === (activeIndex + 1) % N) return "right";
    return "back";
  };

  const getItemStyle = (role: string) => {
    const base = {
      transition: "transform 650ms cubic-bezier(0.4,0,0.2,1), filter 650ms cubic-bezier(0.4,0,0.2,1), opacity 650ms cubic-bezier(0.4,0,0.2,1), left 650ms cubic-bezier(0.4,0,0.2,1), height 650ms cubic-bezier(0.4,0,0.2,1), bottom 650ms cubic-bezier(0.4,0,0.2,1)",
      willChange: "transform, filter, opacity, left, height, bottom"
    };
    
    // Shifted higher and reduced scale to prevent cropping at bottom
    switch (role) {
      case "center":
        return {
          ...base,
          transform: `translateX(-50%) scale(${isMobile ? 1 : 1.15})`,
          filter: "blur(0px)",
          opacity: 1,
          zIndex: 20,
          left: "50%",
          height: isMobile ? "40%" : "55%",
          bottom: isMobile ? "45%" : "30%" // raised up significantly to show scroll text
        };
      case "left":
        return {
          ...base,
          transform: "translateX(-50%) scale(0.9)",
          filter: "blur(2px)",
          opacity: 0.85,
          zIndex: 10,
          left: isMobile ? "10%" : "25%",
          height: isMobile ? "16%" : "28%",
          bottom: isMobile ? "45%" : "30%"
        };
      case "right":
        return {
          ...base,
          transform: "translateX(-50%) scale(0.9)",
          filter: "blur(2px)",
          opacity: 0.85,
          zIndex: 10,
          left: isMobile ? "90%" : "75%",
          height: isMobile ? "16%" : "28%",
          bottom: isMobile ? "45%" : "30%"
        };
      case "back":
      default:
        return {
          ...base,
          transform: "translateX(-50%) scale(0.8)",
          filter: "blur(4px)",
          opacity: N > 3 ? 0.3 : 0, // fade out if many items, hide if <4
          zIndex: 5,
          left: "50%",
          height: isMobile ? "13%" : "22%",
          bottom: isMobile ? "45%" : "30%"
        };
    }
  };

  const activeItem = safeItems[activeIndex];
  const activeColor = FALLBACK_COLORS[activeIndex % FALLBACK_COLORS.length];

  return (
    <div 
      className="relative w-full overflow-hidden transition-colors duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]"
      style={{ backgroundColor: activeColor, fontFamily: "'Inter', sans-serif" }}
    >
      <div className="relative w-full h-[100vh] overflow-hidden">
        
        {/* Grain overlay */}
        <div className="absolute inset-0 pointer-events-none z-50 opacity-40 mix-blend-overlay" 
          style={{ backgroundSize: '200px 200px', backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E")` }}>
        </div>

        {/* Giant ghost text */}
        <div 
          className="absolute inset-x-0 flex items-center justify-center pointer-events-none select-none z-[2]"
          style={{ top: '6%' }} // shifted way up
        >
          <h1 
            className="text-white/60 uppercase leading-none whitespace-nowrap tracking-[-0.02em]" 
            style={{ fontFamily: "'Anton', sans-serif", fontSize: "clamp(90px, 28vw, 380px)", fontWeight: 400 }}
          >
            DELICIOUS
          </h1>
        </div>

        {/* Top-left brand label — above DELICIOUS text */}
        <div className="absolute top-4 left-4 sm:top-5 sm:left-8 z-[60]">
          <span className="text-white text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/15">
            {settings?.name || "BHOOKH EXPRESS"}
          </span>
        </div>

        {/* Carousel */}
        <div className="absolute inset-0 z-[3]">
          {safeItems.map((item, i) => {
            const role = getRole(i);

            return (
              <div 
                key={i} 
                className="absolute transition-all duration-650 ease-[cubic-bezier(0.4,0,0.2,1)]"
                style={{...getItemStyle(role), aspectRatio: '4/5'}}
              >
                {item.image ? (
                  <div className="w-full h-full rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)] border-4 border-white/20">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      draggable={false}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-3 rounded-b-3xl">
                      <p className="text-white font-bold text-sm text-center truncate drop-shadow-lg">{item.name}</p>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full bg-black/20 flex items-center justify-center text-4xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] text-white/50">
                    🍽️
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom-left text + nav buttons */}
        <div className="absolute bottom-28 left-4 sm:bottom-28 sm:left-12 lg:left-24 z-[60] max-w-[340px] bg-black/30 p-5 rounded-3xl backdrop-blur-md border border-white/20 shadow-2xl">
          <p className="font-bold uppercase tracking-widest mb-2 text-lg sm:text-[22px] text-white drop-shadow-md truncate">
            {activeItem.name}
          </p>
          <p className="text-sm text-white/90 leading-relaxed mb-5 drop-shadow-sm line-clamp-3">
            {activeItem.description || "Freshly prepared and extremely delicious. Order your favorites right now and experience the taste!"}
          </p>
          
          <div className="flex items-center justify-between gap-2 mt-2">
            <div className="flex gap-2 sm:gap-4">
              <button 
                onClick={() => navigate('prev')}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white/30 text-white flex items-center justify-center bg-gradient-to-br from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 hover:scale-110 shadow-lg transition-all duration-150 shrink-0"
              >
                <ArrowLeft size={20} strokeWidth={2.5} />
              </button>
              <button 
                onClick={() => navigate('next')}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white/30 text-white flex items-center justify-center bg-gradient-to-br from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 hover:scale-110 shadow-lg transition-all duration-150 shrink-0"
              >
                <ArrowRight size={20} strokeWidth={2.5} />
              </button>
            </div>
            
            <Link href="/menu" className="flex items-center justify-center gap-1.5 sm:gap-2 group text-white hover:text-white transition-colors duration-200 bg-white/10 px-4 py-2 sm:px-5 sm:py-3 rounded-2xl sm:rounded-3xl backdrop-blur-md shadow-inner border border-white/20 hover:bg-white/20 hover:scale-105 shrink-0 ml-auto">
              <span 
                className="uppercase leading-none tracking-[-0.02em] drop-shadow-md whitespace-nowrap"
                style={{ fontFamily: "'Anton', sans-serif", fontSize: "clamp(16px, 3vw, 24px)", fontWeight: 400 }}
              >
                ORDER NOW
              </span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform drop-shadow-md shrink-0" strokeWidth={2.5} />
            </Link>
          </div>
        </div>


        {/* Scroll Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[60] flex flex-col items-center animate-bounce text-white drop-shadow-lg">
          <span className="text-xs sm:text-sm font-bold tracking-widest uppercase mb-1 drop-shadow-md bg-black/40 px-4 py-1.5 rounded-full backdrop-blur-sm">Scroll to Menu 👇</span>
          <div className="w-0.5 h-6 sm:h-8 bg-gradient-to-b from-white/90 to-transparent rounded-full" />
        </div>

      </div>
    </div>
  );
}
