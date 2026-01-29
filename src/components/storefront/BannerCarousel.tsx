import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Banner } from "@/hooks/useThemeSettings";
import { useIsMobile } from "@/hooks/use-mobile";

interface BannerCarouselProps {
  banners: Banner[];
}

export default function BannerCarousel({ banners }: BannerCarouselProps) {
  const isMobile = useIsMobile();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter banners by device type
  const filteredBanners = banners.filter((banner) => 
    isMobile ? banner.device_type === "mobile" : banner.device_type === "desktop"
  );

  // Auto-advance slides
  useEffect(() => {
    if (filteredBanners.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % filteredBanners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [filteredBanners.length]);

  if (filteredBanners.length === 0) return null;

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + filteredBanners.length) % filteredBanners.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredBanners.length);
  };

  return (
    <div className="relative w-full overflow-hidden">
      {/* Banner Images */}
      <div 
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {filteredBanners.map((banner) => (
          <div key={banner.id} className="w-full flex-shrink-0">
            {banner.link_url ? (
              <Link to={banner.link_url}>
                <img
                  src={banner.image_url}
                  alt="Promotional banner"
                  className="h-auto w-full object-cover"
                  style={{ maxHeight: isMobile ? "300px" : "500px" }}
                />
              </Link>
            ) : (
              <img
                src={banner.image_url}
                alt="Promotional banner"
                className="h-auto w-full object-cover"
                style={{ maxHeight: isMobile ? "300px" : "500px" }}
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
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-md transition-all hover:bg-white hover:scale-110"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5 text-gray-800" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-md transition-all hover:bg-white hover:scale-110"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5 text-gray-800" />
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {filteredBanners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          {filteredBanners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 w-2 rounded-full transition-all ${
                index === currentIndex
                  ? "w-6 bg-white"
                  : "bg-white/50 hover:bg-white/75"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
