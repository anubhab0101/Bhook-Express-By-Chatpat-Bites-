export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-amber-50 dark:bg-amber-950 gap-5">
      <div className="relative w-24 h-24 animate-pulse">
        <div className="absolute left-3 right-3 top-3 h-5 rounded-full bg-amber-700 shadow-md" />
        <div className="absolute left-5 right-5 top-8 h-3 rounded-full bg-emerald-500" />
        <div className="absolute left-4 right-4 top-12 h-4 rounded-full bg-yellow-300" />
        <div className="absolute left-5 right-5 top-16 h-3 rounded-full bg-red-500" />
        <div className="absolute left-3 right-3 top-[76px] h-5 rounded-full bg-amber-800 shadow-md" />
      </div>
      <p className="text-amber-900 dark:text-amber-100 text-sm font-bold tracking-wide animate-bounce">
        Preparing your menu...
      </p>
    </div>
  );
}
