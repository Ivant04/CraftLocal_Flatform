import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { NearbyModalProvider, useNearbyModal } from '../../context/NearbyModalContext';
import NearbyRecommendationModal from '../home/NearbyRecommendationModal';
import NearbyFloatingTrigger from '../home/NearbyFloatingTrigger';
import ItineraryModal from '../itinerary/ItineraryModal';

const MainLayoutContent: React.FC = () => {
  const {
    isOpen,
    closeNearbyModal,
    isItineraryOpen,
    itineraryDestination,
    closeItineraryModal,
  } = useNearbyModal();

  return (
    <div className="min-h-screen flex flex-col bg-craft-contour">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />

      {/* Floating Action Button to open AI Chat Assistant */}
      <NearbyFloatingTrigger />

      {/* AI Chat Box Modal */}
      <NearbyRecommendationModal isOpen={isOpen} onClose={closeNearbyModal} />

      {/* 1-Day Itinerary Planner & Editor Modal */}
      <ItineraryModal
        isOpen={isItineraryOpen}
        onClose={closeItineraryModal}
        initialDestination={itineraryDestination}
      />
    </div>
  );
};

const MainLayout: React.FC = () => (
  <NearbyModalProvider>
    <MainLayoutContent />
  </NearbyModalProvider>
);

export default MainLayout;
