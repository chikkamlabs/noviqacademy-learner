import Image from 'next/image';

export default function ExploreAttract() {
  return (
    <div className="w-full">
      <div className="relative w-full h-48 sm:h-64 md:h-80 lg:h-96 rounded-2xl overflow-hidden shadow-xs border border-soft-orange/30">
        {/* Responsive Background Image */}
        <Image
          src="/learnerexplore1.png"
          alt="Take your first course"
          fill
          priority
          className="object-cover object-center"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
        />

        {/* Subtle gradient overlay to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-pure-white/40 via-transparent to-transparent sm:from-pure-white/30" />

        {/* Responsive Text over the image */}
        <div className="absolute inset-0 flex items-center justify-start p-6 sm:p-10 md:p-14">
          <div className="max-w-xl">
            <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-dark-black tracking-tight leading-tight">
              Take your first course
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}
