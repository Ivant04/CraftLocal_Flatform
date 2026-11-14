import React, { createContext, useContext, useState, useCallback } from 'react';

interface NearbyModalContextType {
  isOpen: boolean;
  openNearbyModal: () => void;
  closeNearbyModal: () => void;
  toggleNearbyModal: () => void;
  // Itinerary Planner Modal
  isItineraryOpen: boolean;
  itineraryDestination?: string;
  openItineraryModal: (destination?: string) => void;
  closeItineraryModal: () => void;
}

const NearbyModalContext = createContext<NearbyModalContextType>({
  isOpen: false,
  openNearbyModal: () => {},
  closeNearbyModal: () => {},
  toggleNearbyModal: () => {},
  isItineraryOpen: false,
  itineraryDestination: undefined,
  openItineraryModal: () => {},
  closeItineraryModal: () => {},
});

export const NearbyModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isItineraryOpen, setIsItineraryOpen] = useState(false);
  const [itineraryDestination, setItineraryDestination] = useState<string | undefined>(undefined);

  const openNearbyModal = useCallback(() => setIsOpen(true), []);
  const closeNearbyModal = useCallback(() => setIsOpen(false), []);
  const toggleNearbyModal = useCallback(() => setIsOpen((prev) => !prev), []);

  const openItineraryModal = useCallback((destination?: string) => {
    setItineraryDestination(destination);
    setIsItineraryOpen(true);
  }, []);

  const closeItineraryModal = useCallback(() => {
    setIsItineraryOpen(false);
    setItineraryDestination(undefined);
  }, []);

  return (
    <NearbyModalContext.Provider
      value={{
        isOpen,
        openNearbyModal,
        closeNearbyModal,
        toggleNearbyModal,
        isItineraryOpen,
        itineraryDestination,
        openItineraryModal,
        closeItineraryModal,
      }}
    >
      {children}
    </NearbyModalContext.Provider>
  );
};

export const useNearbyModal = () => useContext(NearbyModalContext);
export default NearbyModalContext;
