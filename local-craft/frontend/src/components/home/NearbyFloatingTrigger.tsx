import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useNearbyModal } from '../../context/NearbyModalContext';

const NearbyFloatingTrigger: React.FC = () => {
  const { isOpen, toggleNearbyModal } = useNearbyModal();

  // If chat box is currently open, don't show the floating trigger button
  if (isOpen) return null;

  return (
    <aside aria-label="Trợ lý AI CraftLocal" className="fixed bottom-6 right-6 z-40">
      <button
        type="button"
        onClick={toggleNearbyModal}
        className="w-12 h-12 md:w-13 md:h-13 rounded-full bg-[#964824] hover:bg-[#7D3B1D] text-white flex items-center justify-center shadow-[0_8px_25px_rgba(150,72,36,0.35)] hover:shadow-[0_10px_30px_rgba(150,72,36,0.45)] border border-white/20 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
        title="Trò chuyện với Trợ lý AI CraftLocal"
        aria-label="Mở Trợ lý AI CraftLocal"
      >
        <MessageCircle size={22} className="text-white" />
      </button>
    </aside>
  );
};

export default NearbyFloatingTrigger;
