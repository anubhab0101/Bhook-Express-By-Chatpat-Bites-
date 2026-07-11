export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-5">
      {/* GIF Loader */}
      <div className="w-64 h-64 sm:w-80 sm:h-80">
        <img 
          src="https://cdn.dribbble.com/userupload/20415545/file/original-223850a9924f9e04b1001e3d075bf68f.gif" 
          alt="Loading..." 
          className="w-full h-full object-contain pointer-events-none select-none"
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
        />
      </div>
    </div>
  );
}
