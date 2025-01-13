"use client"

import React, { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AuthWrapper from '@/components/AuthWrapper';
import QRCodeGenerator from '@/components/QRCodeGenerator';
import RouteVisualizer from '@/components/RouteVisualizer';

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

const AdminInterface = () => {
  const [stations, setStations] = useState<Record<string, Station>>({});
  const [currentStation, setCurrentStation] = useState<Station | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadStations();
  }, []);

  const loadStations = async () => {
    try {
      const { data, error } = await supabase
        .from('stations')
        .select('*')
        .order('created_at');

      if (error) throw error;

      const stationsRecord = (data || []).reduce((acc, station) => {
        acc[station.id] = {
          ...station,
          routes: station.routes || {}
        };
        return acc;
      }, {} as Record<string, Station>);

      setStations(stationsRecord);
    } catch (error) {
      setError('Error loading stations');
      console.error(error);
    }
  };

  const handleAddStation = () => {
    const newStation: Station = {
      id: '',
      name: '',
      routes: {}
    };
    setCurrentStation(newStation);
  };

  const handleSaveStation = async () => {
    try {
      if (!currentStation) return;

      const { error } = await supabase
        .from('stations')
        .upsert({
          id: currentStation.id,
          name: currentStation.name,
          routes: currentStation.routes
        });

      if (error) throw error;

      setMessage('Station saved successfully!');
      loadStations();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setError('Error saving station');
      console.error(error);
    }
  };

  const handleDeleteStation = async (stationId: string) => {
    if (!confirm('Are you sure you want to delete this station?')) return;

    try {
      const { error } = await supabase
        .from('stations')
        .delete()
        .eq('id', stationId);

      if (error) throw error;

      setMessage('Station deleted successfully!');
      setCurrentStation(null);
      loadStations();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setError('Error deleting station');
      console.error(error);
    }
  };

  const handleAddRoute = () => {
    if (currentStation) {
      const updatedStation = { ...currentStation };
      updatedStation.routes[''] = {
        nextStation: '',
        password: '',
        nextClue: '',
        videoUrl: ''
      };
      setCurrentStation(updatedStation);
    }
  };

  return (
    <AuthWrapper>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Scavenger Hunt Admin</h1>
        
        {message && (
          <Alert className="mb-4 bg-green-100 border-green-400">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>Stations</CardHeader>
            <CardContent>
              <Button onClick={handleAddStation}>Add New Station</Button>
              <div className="mt-4 space-y-2">
                {Object.values(stations).map(station => (
                  <div 
                    key={station.id}
                    className="p-2 border rounded hover:bg-gray-100 flex justify-between items-center"
                  >
                    <span 
                      className="cursor-pointer flex-grow"
                      onClick={() => setCurrentStation(station)}
                    >
                      {station.name || station.id}
                    </span>
                    <Button 
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteStation(station.id)}
                    >
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {currentStation && (
            <Card>
              <CardHeader>Edit Station</CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Station ID</label>
                    <Input 
                      value={currentStation.id}
                      onChange={(e) => setCurrentStation({
                        ...currentStation,
                        id: e.target.value
                      })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Station Name</label>
                    <Input 
                      value={currentStation.name}
                      onChange={(e) => setCurrentStation({
                        ...currentStation,
                        name: e.target.value
                      })}
                    />
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Routes</h3>
                    <Button onClick={handleAddRoute} className="mb-2">Add Route</Button>
                    
                    {Object.entries(currentStation.routes).map(([fromStation, route], index) => (
                      <div key={index} className="p-2 border rounded mb-2">
                        <Input 
                          placeholder="From Station"
                          value={fromStation}
                          className="mb-2"
                          onChange={(e) => {
                            const updatedStation = { ...currentStation };
                            const routeData = updatedStation.routes[fromStation];
                            delete updatedStation.routes[fromStation];
                            updatedStation.routes[e.target.value] = routeData;
                            setCurrentStation(updatedStation);
                          }}
                        />
                        <Input 
                          placeholder="Next Station"
                          value={route.nextStation}
                          className="mb-2"
                          onChange={(e) => {
                            const updatedStation = { ...currentStation };
                            updatedStation.routes[fromStation].nextStation = e.target.value;
                            setCurrentStation(updatedStation);
                          }}
                        />
                        <Input 
                          placeholder="Password"
                          value={route.password}
                          className="mb-2"
                          onChange={(e) => {
                            const updatedStation = { ...currentStation };
                            updatedStation.routes[fromStation].password = e.target.value;
                            setCurrentStation(updatedStation);
                          }}
                        />
                        <Input 
                          placeholder="Video URL"
                          value={route.videoUrl}
                          className="mb-2"
                          onChange={(e) => {
                            const updatedStation = { ...currentStation };
                            updatedStation.routes[fromStation].videoUrl = e.target.value;
                            setCurrentStation(updatedStation);
                          }}
                        />
                        <Input 
                          placeholder="Next Clue"
                          value={route.nextClue}
                          onChange={(e) => {
                            const updatedStation = { ...currentStation };
                            updatedStation.routes[fromStation].nextClue = e.target.value;
                            setCurrentStation(updatedStation);
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  <Button onClick={handleSaveStation}>Save Station</Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="lg:col-span-2">
            <RouteVisualizer stations={stations} />
          </div>
          
          {currentStation && (
            <div className="lg:col-span-2">
              <QRCodeGenerator stationId={currentStation.id} />
            </div>
          )}
        </div>
      </div>
    </AuthWrapper>
  );
};

export default function AdminPage() {
  return <AdminInterface />;
}