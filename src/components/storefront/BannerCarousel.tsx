import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Banner } from "@/hooks/useThemeSettings";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface BannerCarouselProps {
  banners: Banner[];
}

export default function BannerCarousel({ banners }: BannerCarouselProps) {
  const isMobile = useIsMobile();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const filteredBanners = banners.filter((banner) =>
    isMobile ? banner.device_type === "mobile" : banner.device_type === "desktop"
  );

  const goTo = useCallback((index: number) => {
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 600);
  }, []);

  useEffect(() => {
    if (filteredBanners.length <= 1) return;
    const interval = setInterval(() => {
      goTo((currentIndex + 1) % filteredBanners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [filteredBanners.length, currentIndex, goTo]);

  if (filteredBanners.length === 0) return null;

  const goToPrevious = () => goTo((currentIndex - 1 + filteredBanners.length) % filteredBanners.length);
  const goToNext = () => goTo((currentIndex + 1) % filteredBanners.length);

  return (
    <div className="relative w-full overflow-hidden">
      <div
        className="flex transition-transform duration-600 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)`, transitionDuration: '600ms' }}
      >
        {filteredBanners.map((banner) => (
          <div key={banner.id} className="w-full flex-shrink-0">
            {banner.link_url ? (
              <Link to={banner.link_url}>
                <img
                  src={banner.image_url}
                  alt="Promotional banner"
                  className="h-auto w-full object-cover"
                  style={{ maxHeight: isMobile ? "300px" : "520px" }}
                />
              </Link>
            ) : (
              <img
                src={banner.image_url}
                alt="Promotional banner"
                className="h-auto w-full object-cover"
                style={{ maxHeight: isMobile ? "300px" : "520px" }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {filteredBanners.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/70 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:scale-110"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5 text-neutral-800" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/70 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:scale-110"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5 text-neutral-800" />
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {filteredBanners.length > 1 && (
        <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
          {filteredBanners.map((_, index) => (
            <button
              key={index}
              onClick={() => goTo(index)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                index === currentIndex
                  ? "w-7 bg-white shadow-sm"
                  : "w-2 bg-white/50 hover:bg-white/75"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
