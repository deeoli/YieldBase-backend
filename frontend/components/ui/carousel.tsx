'use client';

import * as React from 'react';
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from 'embla-carousel-react';

import { cn } from '@/lib/utils';

type CarouselApi = UseEmblaCarouselType[1];

type CarouselProps = {
  opts?: Parameters<typeof useEmblaCarousel>[0];
  plugins?: Parameters<typeof useEmblaCarousel>[1];
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>;

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: CarouselApi;
  orientation: 'horizontal' | 'vertical';
};

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

export function useCarousel() {
  const context = React.useContext(CarouselContext);
  if (!context) {
    throw new Error('useCarousel must be used within a <Carousel />');
  }
  return context;
}

export const Carousel = React.forwardRef<HTMLDivElement, CarouselProps>(
  (
    {
      orientation = 'horizontal',
      className,
      children,
      opts,
      plugins,
      ...props
    },
    ref,
  ) => {
    const [carouselRef, api] = useEmblaCarousel(
      {
        axis: orientation === 'horizontal' ? 'x' : 'y',
        ...opts,
      },
      plugins,
    );

    const contextValue = React.useMemo(
      () => ({
        carouselRef,
        api,
        orientation,
      }),
      [carouselRef, api, orientation],
    );

    return (
      <CarouselContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={cn('relative', className)}
          {...props}
        >
          <div ref={carouselRef} className="overflow-hidden">
            {children}
          </div>
        </div>
      </CarouselContext.Provider>
    );
  },
);
Carousel.displayName = 'Carousel';

export const CarouselContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { orientation } = useCarousel();

  return (
    <div
      ref={ref}
      className={cn(
        'flex',
        orientation === 'horizontal' ? '-ml-4' : '-mt-4 flex-col',
        className,
      )}
      {...props}
    />
  );
});
CarouselContent.displayName = 'CarouselContent';

export const CarouselItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { orientation } = useCarousel();

  return (
    <div
      ref={ref}
      className={cn(
        'min-w-0 shrink-0 grow-0 basis-full pl-4',
        orientation === 'vertical' && 'pt-4',
        className,
      )}
      {...props}
    />
  );
});
CarouselItem.displayName = 'CarouselItem';

type CarouselButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

const CarouselButton = React.forwardRef<HTMLButtonElement, CarouselButtonProps>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded-full border border-border-grey bg-white text-sm text-text-dark shadow-sm transition-colors hover:bg-background-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
      {...props}
    />
  ),
);
CarouselButton.displayName = 'CarouselButton';

export const CarouselPrevious = React.forwardRef<
  HTMLButtonElement,
  CarouselButtonProps
>(({ className, ...props }, ref) => {
  const { api, orientation } = useCarousel();

  return (
    <CarouselButton
      ref={ref}
      className={cn(
        'absolute',
        orientation === 'horizontal'
          ? 'left-2 top-1/2 -translate-y-1/2'
          : 'left-1/2 top-2 -translate-x-1/2',
        className,
      )}
      onClick={() => api?.scrollPrev()}
      {...props}
    >
      ‹
    </CarouselButton>
  );
});
CarouselPrevious.displayName = 'CarouselPrevious';

export const CarouselNext = React.forwardRef<
  HTMLButtonElement,
  CarouselButtonProps
>(({ className, ...props }, ref) => {
  const { api, orientation } = useCarousel();

  return (
    <CarouselButton
      ref={ref}
      className={cn(
        'absolute',
        orientation === 'horizontal'
          ? 'right-2 top-1/2 -translate-y-1/2'
          : 'bottom-2 left-1/2 -translate-x-1/2',
        className,
      )}
      onClick={() => api?.scrollNext()}
      {...props}
    >
      ›
    </CarouselButton>
  );
});
CarouselNext.displayName = 'CarouselNext';


