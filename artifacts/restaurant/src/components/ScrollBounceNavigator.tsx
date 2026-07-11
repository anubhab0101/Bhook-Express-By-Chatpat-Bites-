import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { motion, useAnimation } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface ScrollBounceNavigatorProps {
  target: string;
  text: string;
}

/**
 * Placed at the bottom of a page.
 * When user reaches this area AND keeps scrolling (5+ scroll ticks at bottom),
 * a bounce animation plays and then navigates to `target`.
 */
export default function ScrollBounceNavigator({ target, text }: ScrollBounceNavigatorProps) {
  const [, navigate] = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollCountRef = useRef(0);
  const isVisibleRef = useRef(false);
  const hasNavigatedRef = useRef(false);
  const [progress, setProgress] = useState(0); // 0 to 1
  const [bouncing, setBouncing] = useState(false);
  const controls = useAnimation();

  const REQUIRED_SCROLLS = 5; // user must scroll 5 times at the bottom

  useEffect(() => {
    // Intersection observer to detect when this section is visible
    const observer = new IntersectionObserver(
      (entries) => {
        isVisibleRef.current = entries[0].isIntersecting;
        if (!entries[0].isIntersecting) {
          // Reset when scrolled away
          scrollCountRef.current = 0;
          setProgress(0);
        }
      },
      { threshold: 0.5 }
    );

    if (containerRef.current) observer.observe(containerRef.current);

    // Listen for wheel events when this section is visible
    const handleWheel = (e: WheelEvent) => {
      if (!isVisibleRef.current || hasNavigatedRef.current) return;
      
      // Only count downward scrolls
      if (e.deltaY > 0) {
        scrollCountRef.current += 1;
        const newProgress = Math.min(scrollCountRef.current / REQUIRED_SCROLLS, 1);
        setProgress(newProgress);

        if (scrollCountRef.current >= REQUIRED_SCROLLS) {
          // Trigger bounce and navigate
          hasNavigatedRef.current = true;
          setBouncing(true);
          
          controls.start({
            y: [0, 40, -10, 5, 0],
            transition: { duration: 0.5, ease: "easeInOut" }
          }).then(() => {
            navigate(target);
            window.scrollTo(0, 0);
          });
        }
      }
    };

    // Also handle touch scroll for mobile
    let lastTouchY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      lastTouchY = e.touches[0].clientY;
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (!isVisibleRef.current || hasNavigatedRef.current) return;
      const currentY = e.touches[0].clientY;
      const diff = lastTouchY - currentY;
      if (diff > 10) { // swiping up = scrolling down
        scrollCountRef.current += 1;
        lastTouchY = currentY;
        const newProgress = Math.min(scrollCountRef.current / REQUIRED_SCROLLS, 1);
        setProgress(newProgress);

        if (scrollCountRef.current >= REQUIRED_SCROLLS) {
          hasNavigatedRef.current = true;
          setBouncing(true);
          controls.start({
            y: [0, 40, -10, 5, 0],
            transition: { duration: 0.5, ease: "easeInOut" }
          }).then(() => {
            navigate(target);
            window.scrollTo(0, 0);
          });
        }
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [controls, navigate, target]);

  // Reset on mount (if user navigates back)
  useEffect(() => {
    hasNavigatedRef.current = false;
    scrollCountRef.current = 0;
    setProgress(0);
    setBouncing(false);
  }, []);

  return (
    <motion.div
      ref={containerRef}
      animate={controls}
      className="py-16 flex flex-col items-center justify-center gap-4 bg-gradient-to-t from-muted/50 to-transparent"
    >
      {/* Progress dots */}
      <div className="flex gap-2 mb-2">
        {Array.from({ length: REQUIRED_SCROLLS }).map((_, i) => (
          <div
            key={i}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              i < Math.ceil(progress * REQUIRED_SCROLLS)
                ? "bg-amber-500 scale-125 shadow-lg shadow-amber-500/50"
                : "bg-muted-foreground/30"
            }`}
          />
        ))}
      </div>

      {/* Text */}
      <p className="text-sm text-muted-foreground font-bold tracking-widest uppercase text-center">
        {bouncing ? "Loading..." : text}
      </p>

      {/* Bouncing arrow */}
      <div className={`transition-all duration-300 ${bouncing ? "scale-150 text-amber-500" : "animate-bounce text-muted-foreground/60"}`}>
        <ChevronDown className="w-6 h-6" />
      </div>

      {/* Progress bar */}
      <div className="w-32 h-1.5 bg-muted-foreground/20 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </motion.div>
  );
}
