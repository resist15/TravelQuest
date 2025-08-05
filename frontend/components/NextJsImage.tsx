import Image from "next/image";
import {
  isImageSlide,
  isImageFitCover,
  useLightboxProps,
  useLightboxState,
  RenderSlideProps,
  RenderThumbnailProps,
  Slide,
} from "yet-another-react-lightbox";

// Define slide with additional fields for better type safety
interface CustomSlide extends Slide {
  width: number;
  height: number;
  blurDataURL?: string;
}

function isNextJsImage(slide: Slide): slide is CustomSlide {
  return (
    isImageSlide(slide) &&
    typeof slide.width === "number" &&
    typeof slide.height === "number"
  );
}

export function NextJsImage({ slide, offset, rect }: RenderSlideProps) {
  const {
    on: { click },
    carousel: { imageFit },
  } = useLightboxProps();
  const { currentIndex } = useLightboxState();

  if (!isNextJsImage(slide)) return null;

  const cover = isImageFitCover(slide, imageFit);

  const width = !cover
    ? Math.round(Math.min(rect.width, (rect.height / slide.height) * slide.width))
    : rect.width;

  const height = !cover
    ? Math.round(Math.min(rect.height, (rect.width / slide.width) * slide.height))
    : rect.height;

  return (
    <div style={{ position: "relative", width, height }}>
      <Image
        fill
        alt=""
        src={slide.src}
        loading="eager"
        draggable={false}
        placeholder={slide.blurDataURL ? "blur" : undefined}
        blurDataURL={slide.blurDataURL}
        style={{
          objectFit: cover ? "cover" : "contain",
          cursor: click ? "pointer" : undefined,
        }}
        sizes={`${Math.ceil((width / window.innerWidth) * 100)}vw`}
        onClick={offset === 0 ? () => click?.({ index: currentIndex }) : undefined}
      />
    </div>
  );
}

export function NextJsThumbnail({ slide }: RenderThumbnailProps) {
  if (!slide || typeof slide !== "object" || !("src" in slide)) return null;

  const src = (slide as Slide).src;
  const blurDataURL = isNextJsImage(slide) ? slide.blurDataURL : undefined;

  return (
    <div style={{ position: "relative", width: 100, height: 70 }}>
      <Image
        src={src}
        alt=""
        fill
        style={{ objectFit: "cover" }}
        placeholder={blurDataURL ? "blur" : undefined}
        blurDataURL={blurDataURL}
      />
    </div>
  );
}
