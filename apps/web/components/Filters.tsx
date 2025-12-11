'use client';

import Slider from 'rc-slider';
import { useFilter } from "@/contexts/FilterContext";
import { useState, useEffect } from "react";
import { useDebouncedCallback } from 'use-debounce';
import ColorCheckbox from "@/components/ColorCheckbox";
import 'rc-slider/assets/index.css';

export default function Filters() {
  const { 
    sigmet, setSigmet, 
    airsigmet, setAirsigmet,
    altitudeRange: contextAltitudeRange, setAltitudeRange: setContextAltitudeRange,
    timeFilter: contextTimeFilter, setTimeFilter: setContextTimeFilter
  } = useFilter();

  const [localAltitudeRange, setLocalAltitudeRange] = useState(contextAltitudeRange);
  const [localTimeFilter, setLocalTimeFilter] = useState(contextTimeFilter);

  // Sync local state with context if context changes externally (optional but good practice)
  useEffect(() => {
    setLocalAltitudeRange(contextAltitudeRange);
  }, [contextAltitudeRange]);

  useEffect(() => {
    setLocalTimeFilter(contextTimeFilter);
  }, [contextTimeFilter]);

  const debouncedSetAltitudeRange = useDebouncedCallback(setContextAltitudeRange, 100);
  const debouncedSetTimeFilter = useDebouncedCallback(setContextTimeFilter, 100);

  const handleAltitudeChange = (value: number | number[]) => {
    if (!Array.isArray(value))
      return

    setLocalAltitudeRange(value);
    debouncedSetAltitudeRange(value);
  };

  const handleTimeChange = (value: number | number[]) => {
    if (Array.isArray(value))
      return
    
    setLocalTimeFilter(value);
    debouncedSetTimeFilter(value);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true
    });
  };

  return (
    <div className="absolute top-6 right-6 z-10 bg-white p-4 rounded-lg shadow-md w-72">
      <h3 className="font-semibold text-gray-900 mb-3 text-sm">Layers</h3>
      <div className="flex gap-2 mb-6">
        <ColorCheckbox
          color="#C0392B"
          value={sigmet}
          onClick={() => setSigmet(!sigmet)}
          label="SIGMET"
        />

        <ColorCheckbox
          color="#3498DB"
          value={airsigmet}
          onClick={() => setAirsigmet(!airsigmet)}
          label="AIRSIGMET"
        />
      </div>

      <div className="space-y-3">
        <div>
          <h3 className="font-semibold text-gray-900 text-sm">Altitude Range</h3>
          <p className="text-gray-500 text-xs mt-1">
            {localAltitudeRange[0].toLocaleString()} ft - {localAltitudeRange[1].toLocaleString()} ft
          </p>
        </div>

        <div className="px-1">
          <Slider
            range
            min={0}
            max={48000}
            step={1000}
            value={localAltitudeRange}
            onChange={handleAltitudeChange}
            trackStyle={[{ backgroundColor: '#3B82F6', height: 4 }]}
            handleStyle={[
              { borderColor: '#3B82F6', backgroundColor: '#3B82F6', opacity: 1, height: 16, width: 16, marginTop: -6 },
              { borderColor: '#3B82F6', backgroundColor: '#3B82F6', opacity: 1, height: 16, width: 16, marginTop: -6 }
            ]}
            railStyle={{ backgroundColor: '#E5E7EB', height: 4 }}
          />
        </div>

        <hr className="border-gray-200" />

        <div>
          <h3 className="font-semibold text-gray-900 text-sm">Time Filter</h3>
          <p className="text-gray-500 text-xs mt-1">Current time</p>
        </div>

        <div className="px-1">
          <Slider
            min={new Date().getTime() - 24 * 60 * 60 * 1000} // 24 hours ago
            max={new Date().getTime() + 6 * 60 * 60 * 1000} // 6 hours ahead
            step={60 * 60 * 1000}
            value={localTimeFilter}
            onChange={handleTimeChange}
            trackStyle={{ backgroundColor: '#3B82F6', height: 4 }}
            handleStyle={{
              borderColor: '#3B82F6',
              backgroundColor: '#3B82F6',
              opacity: 1,
              height: 16,
              width: 16,
              marginTop: -6
            }}
            railStyle={{ backgroundColor: '#E5E7EB', height: 4 }}
          />
        </div>

        <p className="text-gray-500 text-xs">
          Current time: {formatTime(localTimeFilter)}
        </p>
      </div>
    </div>
  );
}
