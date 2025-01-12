"use client"

import React from 'react';
import { Card, CardContent } from './ui/card';

interface StationRoute {
  nextStation: string;
  password: string;
  nextClue: string;
}

interface Station {
  id: string;
  name: string;
  videoUrl: string;
  routes: Record<string, StationRoute>;
}

interface RouteVisualizerProps {
  stations: Record<string, Station>;
}

const RouteVisualizer = ({ stations }: RouteVisualizerProps) => {
  const generateMermaidDiagram = () => {
    return Object.entries(stations).map(([stationId, station]) => 
      Object.values(station.routes).map(route => 
        `${stationId}[${station.name}] -->|${route.password}| ${route.nextStation}`
      ).join('\n')
    ).join('\n');
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mermaid">
          {`graph TD\n${generateMermaidDiagram()}`}
        </div>
      </CardContent>
    </Card>
  );
};

export default RouteVisualizer;