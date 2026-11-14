
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Navigation,
  ExternalLink,
  Crosshair,
  Maximize2,
  Minimize2,
  MapPin,
  Sparkles,
} from 'lucide-react';
import type { NearbyPlace } from '../../types/recommendation.type';
import { formatCurrencyShort } from '../../utils/formatCurrency';

interface NearbyCraftMapProps {
  userLocation: {
    lat: number;
    lng: number;
    name: string;
  };
  places: NearbyPlace[];
  selectedPlaceId?: string | null;
  onSelectPlace?: (place: NearbyPlace) => void;
  onMapClickLocation?: (coords: { lat: number; lng: number }) => void;
  radiusKm?: number;
  className?: string;
}

/**
 * Generates vector SVG path for craft marker types.
 * Pure SVG vectors without emojis according to Modern Heritage design standards.
 */
function getPlaceIconSvg(type: string): string {
  switch (type) {
    case 'CRAFT_STORE':
      return `<path d="M6 2L3 6V20C3 20.53 3.21 21.04 3.58 21.41C3.95 21.78 4.46 22 5 22H19C19.53 22 20.04 21.78 20.41 21.41C20.78 21.04 21 20.53 21 20V6L18 2H6Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M3 6H21" stroke="currentColor" stroke-width="1.8"/><path d="M16 10C16 12.21 14.21 14 12 14C9.79 14 8 12.21 8 10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>`;
    case 'CRAFT_VILLAGE':
      return `<path d="M3 9.5L12 3L21 9.5V20C21 20.55 20.55 21 20 21H4C3.45 21 3 20.55 3 20V9.5Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M9 21V12H15V21" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>`;
    case 'LOCAL_EXPERIENCE':
      return `<path d="M17 8H18C19.1 8 20 8.9 20 10C20 11.1 19.1 12 18 12H17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" fill="none"/><path d="M3 8H17V13C17 16.3 14.3 19 11 19H7C3.7 19 1 16.3 1 13V8H3Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" fill="none"/>`;
    default:
      // Workshop Pottery Vase
      return `<path d="M8 3H16M7 6H17M6 10C5 13 6 16 8 19C10 21 14 21 16 19C18 16 19 13 18 10L17 6H7L6 10Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
  }
}

/**
 * Creates custom Modern Heritage SVG markers for Google Maps layer.
 */
function createCustomPin(color: string, placeType: string, isUser: boolean = false): L.DivIcon {
  if (isUser) {
    return L.divIcon({
      className: 'custom-user-marker',
      html: `
        <div style="position: relative; width: 34px; height: 44px; display: flex; flex-direction: column; align-items: center; cursor: grab; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.4));">
          <svg width="34" height="44" viewBox="0 0 34 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 0C7.61 0 0 7.61 0 17C0 29.75 17 44 17 44C17 44 34 29.75 34 17C34 7.61 26.39 0 17 0Z" fill="#EA4335"/>
            <circle cx="17" cy="17" r="7.5" fill="#FFFFFF"/>
            <circle cx="17" cy="17" r="4.2" fill="#B31412"/>
          </svg>
          <div style="position: absolute; bottom: -2px; width: 14px; height: 4px; background: rgba(0,0,0,0.3); border-radius: 50%; filter: blur(1.5px);"></div>
        </div>
      `,
      iconSize: [34, 44],
      iconAnchor: [17, 44],
      popupAnchor: [0, -44],
    });
  }

  const svgInner = getPlaceIconSvg(placeType);

  return L.divIcon({
    className: 'custom-craft-marker',
    html: `
      <div style="position: relative; cursor: pointer; filter: drop-shadow(0 4px 6px rgba(61,43,31,0.35)); transition: transform 0.2s ease;">
        <svg width="34" height="42" viewBox="0 0 34 42" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17 0C7.61 0 0 7.61 0 17C0 29.75 17 42 17 42C17 42 34 29.75 34 17C34 7.61 26.39 0 17 0Z" fill="${color}"/>
          <circle cx="17" cy="16" r="11.5" fill="#FAF7F2"/>
          <g transform="translate(6, 5) scale(0.9)" color="${color}">
            ${svgInner}
          </g>
        </svg>
      </div>
    `,
    iconSize: [34, 42],
    iconAnchor: [17, 42],
    popupAnchor: [0, -42],
  });
}

const NearbyCraftMap: React.FC<NearbyCraftMapProps> = ({
  userLocation,
  places,
  selectedPlaceId,
  onSelectPlace,
  onMapClickLocation,
  radiusKm = 5,
  className = '',
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const circleRef = useRef<L.Circle | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
  const [activePopupPlace, setActivePopupPlace] = useState<NearbyPlace | null>(null);

  // Initialize map and tile layers
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [userLocation.lat, userLocation.lng],
        zoom: radiusKm <= 2 ? 14 : radiusKm <= 5 ? 13 : 12,
        zoomControl: false,
        attributionControl: false,
      });

      // Compact attribution bottom right
      L.control
        .attribution({ position: 'bottomright', prefix: '© Google Maps' })
        .addTo(map);

      // Custom zoom control top right
      L.control.zoom({ position: 'topright' }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Apply Google Maps Tile Layer
    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
    }

    const tileUrl =
      mapType === 'satellite'
        ? 'https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}' // Google Hybrid Satellite
        : 'https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'; // Google Standard Roadmap

    const googleLayer = L.tileLayer(tileUrl, {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      attribution: '© Google Maps',
    }).addTo(map);

    tileLayerRef.current = googleLayer;

    // Handle map click to set custom user location
    map.off('click');
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (onMapClickLocation) {
        onMapClickLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    });

    // Clear previous markers & circle
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();
    if (circleRef.current) {
      circleRef.current.remove();
      circleRef.current = null;
    }

    // 1. Add User Location Marker (Red Google Maps Pin - Draggable)
    const userMarker = L.marker([userLocation.lat, userLocation.lng], {
      icon: createCustomPin('#EA4335', 'USER', true),
      draggable: true,
      zIndexOffset: 1000,
    })
      .addTo(map)
      .bindPopup(`
        <div style="font-family: inherit; font-size: 13px; color: #3D2B1F; padding: 2px;">
          <div style="display: flex; align-items: center; gap: 5px; margin-bottom: 3px;">
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #EA4335;"></span>
            <p style="font-weight: 800; color: #EA4335; margin: 0;">Vị trí bạn đã chọn</p>
          </div>
          <p style="margin: 0; color: #5A4A41; font-size: 12px; font-weight: 600;">${userLocation.name}</p>
          <p style="margin: 4px 0 0 0; color: #7A6255; font-size: 10px;">(Kéo thả ghim hoặc nhấp vào bất kỳ điểm nào trên bản đồ để đổi địa chỉ)</p>
        </div>
      `);

    userMarker.on('dragend', (e: any) => {
      const pos = e.target.getLatLng();
      if (onMapClickLocation) {
        onMapClickLocation({ lat: pos.lat, lng: pos.lng });
      }
    });

    markersRef.current.set('user', userMarker);

    // 2. Add Radius Circle
    const circle = L.circle([userLocation.lat, userLocation.lng], {
      radius: radiusKm * 1000,
      color: '#EA4335',
      weight: 1.5,
      opacity: 0.35,
      fillColor: '#EA4335',
      fillOpacity: 0.04,
      dashArray: '4, 6',
    }).addTo(map);
    circleRef.current = circle;

    // 3. Add Place Markers
    const bounds = L.latLngBounds([[userLocation.lat, userLocation.lng]]);

    places.forEach((place) => {
      const { lat, lng } = place.coordinates;
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

      bounds.extend([lat, lng]);

      // Choose color by place type
      let pinColor = '#964824'; // default Terracotta
      if (place.type === 'CRAFT_STORE') {
        pinColor = '#384B3F'; // Forest Green
      } else if (place.type === 'CRAFT_VILLAGE') {
        pinColor = '#D4A373'; // Amber Gold
      } else if (place.type === 'LOCAL_EXPERIENCE') {
        pinColor = '#A0522D';
      }

      const marker = L.marker([lat, lng], {
        icon: createCustomPin(pinColor, place.type, false),
      }).addTo(map);

      // Popup HTML content
      const popupHtml = `
        <div style="font-family: inherit; width: 230px; padding: 0; border-radius: 12px; overflow: hidden;">
          <img src="${place.image}" alt="${place.name}" style="width: 100%; height: 100px; object-fit: cover; border-radius: 8px 8px 0 0; display: block;" onerror="this.src='/images/fallback-craft.jpg'"/>
          <div style="padding: 10px;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 4px; margin-bottom: 4px;">
              <span style="font-size: 10px; font-weight: 700; color: ${pinColor}; background: rgba(150, 72, 36, 0.1); padding: 2px 6px; border-radius: 4px;">
                ${place.typeLabel}
              </span>
              <span style="font-size: 11px; font-weight: 800; color: #964824;">${place.distanceLabel}</span>
            </div>
            <h4 style="font-size: 13px; font-weight: 700; color: #3D2B1F; margin: 0 0 4px 0; line-height: 1.3;">
              ${place.name}
            </h4>
            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; margin-bottom: 8px;">
              <span style="color: #D97706; font-weight: 700; display: inline-flex; align-items: center; gap: 3px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#D97706" stroke="#D97706" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                ${place.rating}
              </span>
              <span style="color: #7A6255; font-weight: 600;">${place.priceLabel || 'Miễn phí'}</span>
            </div>
            <div style="display: flex; gap: 6px;">
              <a href="${place.detailUrl}" style="flex: 1; text-align: center; background: #964824; color: #FFFFFF; font-size: 11px; font-weight: 700; padding: 6px 4px; border-radius: 6px; text-decoration: none;">
                Xem chi tiết
              </a>
              <a href="${place.directionsUrl}" target="_blank" rel="noopener noreferrer" style="flex: 1; text-align: center; background: #384B3F; color: #FFFFFF; font-size: 11px; font-weight: 700; padding: 6px 4px; border-radius: 6px; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 4px;">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
                Chỉ đường
              </a>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, { maxWidth: 260, minWidth: 230, closeButton: false });

      marker.on('click', () => {
        setActivePopupPlace(place);
        if (onSelectPlace) onSelectPlace(place);
      });

      markersRef.current.set(place.id, marker);
    });

    // Center view
    if (places.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    } else {
      map.setView([userLocation.lat, userLocation.lng], 14);
    }
  }, [userLocation, places, radiusKm, onSelectPlace, onMapClickLocation, mapType]);

  // Handle selected place from outside (e.g. clicking card in recommendation list)
  useEffect(() => {
    if (!selectedPlaceId || !mapInstanceRef.current) return;
    const marker = markersRef.current.get(selectedPlaceId);
    if (marker) {
      const latLng = marker.getLatLng();
      mapInstanceRef.current.setView(latLng, 15, { animate: true });
      marker.openPopup();
    }
  }, [selectedPlaceId]);

  const handleCenterUser = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 14, { animate: true });
    const userMarker = markersRef.current.get('user');
    if (userMarker) userMarker.openPopup();
  };

  const closestPlace = places[0];
  const directionsToClosest = closestPlace?.directionsUrl;

  return (
    <div
      className={`relative rounded-3xl overflow-hidden border border-[#EAD8CC] shadow-md bg-[#FAF7F2] ${isFullscreen ? 'fixed inset-4 z-50 rounded-2xl shadow-2xl' : 'w-full h-[440px] md:h-[500px]'
        } ${className}`}
    >
      {/* Top Map Action Toolbar */}
      <div className="absolute top-3 left-3 right-3 z-[400] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-[#EAD8CC] shadow-sm text-xs font-bold text-[#3D2B1F]">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          <span className="truncate max-w-[180px] sm:max-w-[260px]">{userLocation.name}</span>
          <span className="text-[#964824] font-semibold text-[11px]">({places.length} điểm quanh {radiusKm}km)</span>
        </div>

        <div className="pointer-events-auto flex items-center gap-1.5">
          {/* Google Maps Layer Toggle */}
          <div className="flex items-center bg-white/95 rounded-xl border border-[#EAD8CC] p-0.5 shadow-sm">
            <button
              type="button"
              onClick={() => setMapType('roadmap')}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${mapType === 'roadmap'
                  ? 'bg-[#964824] text-white shadow-xs'
                  : 'text-[#5A4A41] hover:text-[#964824]'
                }`}
            >
              Đường phố
            </button>
            <button
              type="button"
              onClick={() => setMapType('satellite')}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${mapType === 'satellite'
                  ? 'bg-[#964824] text-white shadow-xs'
                  : 'text-[#5A4A41] hover:text-[#964824]'
                }`}
            >
              Vệ tinh
            </button>
          </div>

          <button
            type="button"
            onClick={handleCenterUser}
            className="p-2 rounded-xl bg-white/95 hover:bg-white border border-[#EAD8CC] text-[#3D2B1F] hover:text-[#964824] shadow-sm transition-colors cursor-pointer"
            title="Về lại vị trí bạn đã chọn"
            aria-label="Về vị trí hiện tại"
          >
            <Crosshair size={16} />
          </button>

          {directionsToClosest && (
            <a
              href={directionsToClosest}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-[#384B3F] hover:bg-[#2C3B32] text-white text-xs font-bold shadow-sm transition-colors"
            >
              <Navigation size={13} />
              <span>Chỉ đường</span>
            </a>
          )}

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl bg-white/95 hover:bg-white border border-[#EAD8CC] text-[#3D2B1F] shadow-sm transition-colors cursor-pointer"
            title={isFullscreen ? 'Thu nhỏ bản đồ' : 'Phóng to toàn màn hình'}
            aria-label={isFullscreen ? 'Thu nhỏ' : 'Phóng to'}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* Leaflet Map DOM Node */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Map Legend Bar */}
      <div className="absolute bottom-3 left-3 z-[400] flex flex-wrap items-center gap-2 px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-[#EAD8CC] shadow-xs text-[11px] font-semibold text-[#5A4A41]">
        <div className="flex items-center gap-1.5 text-[#EA4335] font-bold">
          <MapPin size={13} className="text-[#EA4335]" />
          <span>Google Maps</span>
        </div>
        <div className="flex items-center gap-1 border-l border-stone-200 pl-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#964824]" />
          <span>Workshop</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#384B3F]" />
          <span>Cửa hàng &amp; Xưởng</span>
        </div>
        {onMapClickLocation && (
          <div className="flex items-center gap-1.5 text-[#964824] font-bold border-l border-stone-200 pl-2">
            <Crosshair size={12} className="text-[#964824]" />
            <span>Kéo thả ghim hoặc nhấp bản đồ để lấy địa chỉ chính xác</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default NearbyCraftMap;

