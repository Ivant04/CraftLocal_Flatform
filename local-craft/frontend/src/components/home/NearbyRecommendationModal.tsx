import React from 'react';
import AiChatBox from '../chat/AiChatBox';

interface NearbyRecommendationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * NearbyRecommendationModal is now powered by the CraftLocal AI Chat Box,
 * providing conversational, location-based, and weather-aware craft discovery.
 */
export const NearbyRecommendationModal: React.FC<NearbyRecommendationModalProps> = ({
  isOpen,
  onClose,
}) => {
  return <AiChatBox isOpen={isOpen} onClose={onClose} />;
};

export default NearbyRecommendationModal;
