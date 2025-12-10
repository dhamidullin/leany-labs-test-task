'use client';

import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { usePopup } from '@/contexts/PopupContext';
import { createRoot } from 'react-dom/client';
import { IsigmetEntry, AirSigmetEntry } from '@/types';

function PopupContent({ data, type, onClose }: { data: any, type: string, onClose: () => void }) {
  const isSigmet = type === 'SIGMET';
  
  // Helper to format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true
    });
  };

  const altitudeText = () => {
      if (data.base || data.top) {
          const base = data.base ? `${data.base}ft` : 'SFC';
          const top = data.top ? `${data.top}ft` : 'Unknown';
          return `${base} - ${top}`;
      }
      if (data.altitudeLow1 || data.altitudeHi1) {
           const low = data.altitudeLow1 ? `${data.altitudeLow1}ft` : 'SFC';
           const high = data.altitudeHi1 ? `${data.altitudeHi1}ft` : 'Unknown';
           return `${low} - ${high}`;
      }
      return 'Unknown';
  }

  return (
    <div className="relative bg-white rounded-lg p-4 w-80 text-sm font-sans">
      <button 
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
      >
        ✕
      </button>

      <div className="flex items-center gap-2 mb-4">
        <div className={`w-3 h-3 rounded-full ${isSigmet ? 'bg-[#C0392B]' : 'bg-[#3498DB]'}`} />
        <h3 className={`font-bold ${isSigmet ? 'text-[#C0392B]' : 'text-[#3498DB]'}`}>
          {type}
        </h3>
      </div>

      <div className="space-y-2 mb-4">
        <div className="grid grid-cols-[80px_1fr] gap-2">
          <span className="font-semibold text-gray-900">Hazard:</span>
          <span className="text-gray-700">{data.hazard || 'Unknown'}</span>
        </div>
        
        <div className="grid grid-cols-[80px_1fr] gap-2">
          <span className="font-semibold text-gray-900">Altitude:</span>
          <span className="text-gray-700">{altitudeText()}</span>
        </div>

        <div className="grid grid-cols-[80px_1fr] gap-2">
          <span className="font-semibold text-gray-900">Valid From:</span>
          <span className="text-gray-700">{formatDate(data.validTimeFrom)}</span>
        </div>

        <div className="grid grid-cols-[80px_1fr] gap-2">
          <span className="font-semibold text-gray-900">Valid To:</span>
          <span className="text-gray-700">{formatDate(data.validTimeTo)}</span>
        </div>
      </div>

      <div className="bg-gray-50 p-3 rounded text-xs text-gray-600 leading-relaxed max-h-32 overflow-y-auto">
        <span className="font-semibold block mb-1">Raw Text:</span>
        {data.rawSigmet || data.rawAirSigmet}
      </div>
    </div>
  );
}

export default function MapPopup({ map }: { map: maplibregl.Map }) {
  const { popupData, closePopup } = usePopup();
  const popupRef = useRef<maplibregl.Popup | null>(null);

  useEffect(() => {
    if (!popupData) {
      if (popupRef.current) {
        popupRef.current.remove();
        popupRef.current = null;
      }
      return;
    }

    const { data, x, y, type, lng, lat } = popupData as any; // We'll update type definition next
    
    // Create a container for the React component
    const popupNode = document.createElement('div');
    const root = createRoot(popupNode);
    
    root.render(
      <PopupContent 
        data={data} 
        type={type} 
        onClose={() => {
          closePopup();
          if (popupRef.current) popupRef.current.remove();
        }} 
      />
    );

    // If we have lat/lng (which we will add), use setLngLat, otherwise use point (less ideal for tracking)
    // But since we want it to track the map, we MUST use LngLat.
    
    if (popupRef.current) {
        popupRef.current.remove();
    }

    popupRef.current = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false,
        className: 'custom-map-popup',
        maxWidth: 'none'
    })
    .setLngLat([lng, lat])
    .setDOMContent(popupNode)
    .addTo(map);

    // Cleanup when component unmounts or data changes
    return () => {
        // We generally want to keep it open until data changes to null or new data
        // But react effect cleanup runs before next effect.
        // We'll let the next effect execution handle removal if data exists, 
        // or this cleanup if data becomes null.
        setTimeout(() => root.unmount(), 0); 
    };
  }, [popupData, map, closePopup]);

  return null;
}

