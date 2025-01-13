"use client"

import React, { useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import mermaid from 'mermaid';

interface StationRoute {
  nextStation: string;
  password: string;
  nextClue: string;
  videoUrl: string;
}

interface Station {
  id: string;
  name: string;
  routes: Record<string, StationRoute>;
}

interface RouteVisualizerProps {
  stations: Record<string, Station>;
}

const RouteVisualizer = ({ stations }: RouteVisualizerProps) => {
  useEffect(() => {
    // Initialize mermaid once
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      flowchart: {
        curve: 'basis',
        defaultRenderer: 'dagre-wrapper'
      },
      themeVariables: {
        nodeBorder: '#475569',
        mainBkg: '#2A303C',
        nodeTextColor: '#ffffff',
      },
      securityLevel: 'loose'
    });

    const renderDiagram = async () => {
      const colors = [
        '#FF6B6B',  // Red
        '#4ECDC4',  // Cyan
        '#FFD93D',  // Yellow
        '#95D44A',  // Green
        '#A78BFA'   // Purple
      ];

      let linkIndex = 0;

      // Build diagram definition
      let diagramDef = 'graph TD\n';
      
      // Add nodes first
      Object.entries(stations).forEach(([id, station]: [string, Station]) => {
        diagramDef += `  ${id}["${station.name}"]\n`;
      });

      // Add connections and styles
      Object.entries(stations).forEach(([stationId, station]: [string, Station]) => {
        Object.entries(station.routes).forEach(([, route]: [string, StationRoute]) => {
          const color = colors[linkIndex % colors.length];
          diagramDef += `  ${stationId} -->|"${route.password}"| ${route.nextStation}\n`;
          diagramDef += `  style ${stationId}${route.nextStation} stroke:${color},color:${color}\n`;
          linkIndex++;
        });
      });

      try {
        const element = document.getElementById('mermaid-diagram');
        if (element) {
          // Clear previous content
          element.innerHTML = '';
          
          // Create new diagram container
          const container = document.createElement('div');
          container.className = 'mermaid';
          container.textContent = diagramDef;
          element.appendChild(container);
          
          // Render the new diagram
          await mermaid.run();
        }
      } catch (error) {
        console.error('Mermaid rendering error:', error);
        // Add fallback rendering or error message if needed
      }
    };

    if (Object.keys(stations).length > 0) {
      renderDiagram();
    }
  }, [stations]);

  return (
    <Card className="bg-zinc-900 text-white border border-zinc-800">
      <CardContent className="p-6">
        <div className="bg-zinc-800 p-4 rounded-lg overflow-x-auto">
          <div id="mermaid-diagram" className="min-h-[200px]" />
        </div>
      </CardContent>
    </Card>
  );
};

export default RouteVisualizer;