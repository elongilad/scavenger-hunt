"use client"

import React from 'react';
import { Card, CardContent } from './ui/card';

interface RouteVisualizerProps {
  stations: Record<string, Station>;
}

const RouteVisualizer = ({ stations }: RouteVisualizerProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="mermaid">
          {`graph TD
            ${Object.entries(stations).map(([stationId, station]) => {
              return Object.entries(station.routes).map(([fromStation, route]) => {
                return `${stationId}[${station.name}] -->|${route.password}| ${route.nextStation}`
              }).join('\n')
            }).join('\n')}
          `}
        </div>
      </CardContent>
    </Card>
  );
};

export default RouteVisualizer;