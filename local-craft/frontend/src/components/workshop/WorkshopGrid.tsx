import React from 'react';
import type { Workshop } from '../../types/workshop.type';
import WorkshopCard from '../home/WorkshopCard';

interface WorkshopGridProps {
  workshops: Workshop[];
}

const WorkshopGrid: React.FC<WorkshopGridProps> = ({ workshops }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {workshops.map((ws) => (
      <WorkshopCard key={ws._id} workshop={ws} />
    ))}
  </div>
);

export default WorkshopGrid;
