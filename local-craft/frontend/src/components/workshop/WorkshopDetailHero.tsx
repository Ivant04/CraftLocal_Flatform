import React from 'react';
import type { Workshop } from '../../types/workshop.type';

const WorkshopDetailHero: React.FC<{ workshop: Workshop }> = ({ workshop }) => (
  <div className="relative h-[400px] md:h-[500px]">
    <img src={workshop.images[0] || '/src/assets/images/pottery-workshop.jpg'} alt={workshop.title} className="w-full h-full object-cover" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
    <div className="absolute bottom-8 left-0 right-0 max-w-[1280px] mx-auto px-5 md:px-8 lg:px-16">
      <span className="px-3 py-1 bg-white/90 rounded-full text-xs font-semibold text-primary mb-4 inline-block">{workshop.category}</span>
      <h1 className="font-headline-lg text-headline-lg text-white text-shadow-subtle">{workshop.title}</h1>
    </div>
  </div>
);

export default WorkshopDetailHero;
