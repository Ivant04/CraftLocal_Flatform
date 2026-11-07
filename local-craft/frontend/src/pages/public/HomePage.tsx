import React from 'react';
import HeroSection from '../../components/home/HeroSection';
import TrustBar from '../../components/home/TrustBar';
import CategorySection from '../../components/home/CategorySection';
import FeaturedWorkshops from '../../components/home/FeaturedWorkshops';
import StorySection from '../../components/home/StorySection';
import ProductSection from '../../components/home/ProductSection';
import MapDiscovery from '../../components/home/MapDiscovery';
import HostSection from '../../components/home/HostSection';
import Newsletter from '../../components/home/Newsletter';

const HomePage: React.FC = () => (
  <>
    <HeroSection />
    <TrustBar />
    <CategorySection />
    <FeaturedWorkshops />
    <StorySection />
    <ProductSection />
    <MapDiscovery />
    <HostSection />
    <Newsletter />
  </>
);

export default HomePage;
