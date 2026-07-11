import { motion } from "framer-motion";

export default function BurgerLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      {/* 3D Burger Image with Bounce Animation */}
      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
        className="relative w-32 h-32 sm:w-40 sm:h-40 mb-6 drop-shadow-2xl"
      >
        <div className="w-full h-full rounded-full overflow-hidden border-4 border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
          <img 
            src="/3d-burger.png" 
            alt="Loading..." 
            className="w-full h-full object-cover"
          />
        </div>
        {/* Subtle shadow underneath the bouncing burger */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-16 h-3 bg-black/20 rounded-[100%] blur-sm pointer-events-none" />
      </motion.div>
      
      <p className="text-amber-500 font-bold text-lg tracking-widest uppercase animate-pulse">
        Preparing your menu...
      </p>
    </div>
  );
}
