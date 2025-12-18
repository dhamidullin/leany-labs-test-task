'use client';

import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { usePopup } from '@/contexts/PopupContext';
import { createRoot } from 'react-dom/client';

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
    if (data.base !== undefined || data.top !== undefined) {
      const base = data.base !== null ? `${data.base}ft` : 'SFC';
      const top = data.top !== null ? `${data.top}ft` : 'Unknown';
      return `${base} - ${top}`;
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
        {data.rawText}
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

    const { data, type, lng, lat } = popupData as any; // We'll update type definition next

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

    if (popupRef.current) {
      popupRef.current.remove();
    }

    const popup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      className: 'custom-map-popup',
      maxWidth: 'none'
    })
      .setLngLat([lng, lat])
      .setDOMContent(popupNode)
      .addTo(map);

    popupRef.current = popup;

    popup.getElement().style.visibility = 'hidden';
    setTimeout(() => {
      popup.setLngLat([lng, lat])
      popup.getElement().style.visibility = 'visible';
    }, 0);

    return () => {
      setTimeout(() => root.unmount(), 0);
    };
  }, [popupData, map, closePopup]);

  return null;
}
