"use client"

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Camera } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Card, CardHeader, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { supabase } from '@/lib/supabase';

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

const ScavengerHuntStation = () => {
  const [password, setPassword] = useState('');
  const [showVideo, setShowVideo] = useState(false);
  const [error, setError] = useState('');
  const [stationData, setStationData] = useState<Station | null>(null);
  const [currentStation, setCurrentStation] = useState<Station | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [stations, setStations] = useState<Record<string, Station>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStations = async () => {
      try {
        const { data, error } = await supabase
          .from('stations')
          .select('*');

        if (error) throw error;

        const stationsRecord = (data || []).reduce((acc: Record<string, Station>, station) => {
          acc[station.id] = {
            ...station,
            videoUrl: station.video_url
          };
          return acc;
        }, {});

        setStations(stationsRecord);
        setLoading(false);
      } catch (error) {
        console.error('Error loading stations:', error);
        setError('Error loading stations. Please try again later.');
        setLoading(false);
      }
    };

    loadStations();
  }, []);

  const onScanSuccess = useCallback((decodedText: string) => {
    const station = stations[decodedText];
    if (station) {
      setCurrentStation(station);
      setShowScanner(false);
      setError('');
    } else {
      setError('Invalid QR code! Try scanning again.');
    }
  }, [stations]);

  const onScanError = (errorMessage: string) => {
    console.warn(errorMessage);
  };

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;

    if (showScanner) {
      scanner = new Html5QrcodeScanner(
        "qr-reader", 
        { 
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1
        },
        false
      );

      scanner.render(onScanSuccess, onScanError);
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(console.error);
      }
    };
  }, [showScanner, onScanSuccess]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStation) {
      setError('Please scan a QR code first!');
      return;
    }

    const matchingRoute = Object.values(currentStation.routes).find(
      route => route.password.toUpperCase() === password.toUpperCase()
    );

    if (matchingRoute) {
      const nextStation = stations[matchingRoute.nextStation];
      setStationData(nextStation);
      setShowVideo(true);
      setError('');
    } else {
      setError('Incorrect password. Try again!');
      setShowVideo(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-md mx-auto p-4">
        <Card className="bg-slate-800 text-white">
          <CardContent className="p-8 text-center">
            Loading mission data...
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <Card className="bg-slate-800 text-white">
        <CardHeader className="text-center text-2xl font-bold border-b border-slate-700">
          🕵️‍♂️ TOP SECRET: Operation Birthday Cake 🎂
        </CardHeader>
        <CardContent className="space-y-4">
          {!currentStation && !showScanner && (
            <div className="text-center">
              <Button 
                onClick={() => setShowScanner(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Camera className="mr-2 h-4 w-4" />
                Scan Security Clearance
              </Button>
            </div>
          )}

          {showScanner && (
            <div className="mb-4">
              <div id="qr-reader" className="w-full"></div>
              <Button 
                onClick={() => setShowScanner(false)}
                className="mt-2 w-full bg-red-600 hover:bg-red-700"
              >
                Cancel Scanning
              </Button>
            </div>
          )}

          {currentStation && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="text-center mb-4 bg-slate-700 p-3 rounded-lg">
                <h3 className="font-bold text-blue-400">Current Location:</h3>
                <p className="text-xl">{currentStation.name}</p>
              </div>
              <Input
                type="text"
                placeholder="Enter security clearance code"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                Access Next Mission
              </Button>
            </form>
          )}

          {error && (
            <Alert variant="destructive" className="bg-red-900 border-red-700">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {showVideo && stationData && (
            <div className="mt-4 space-y-4">
              <div className="aspect-video bg-slate-700 rounded-lg overflow-hidden relative">
                <Image 
                  src={stationData.videoUrl}
                  alt="Mission Briefing"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4 bg-slate-700 rounded-lg border border-slate-600">
                <h3 className="font-bold mb-2 text-blue-400">Mission Update:</h3>
                <p className="text-white">
                  {Object.values(stationData.routes)[0]?.nextClue || "Mission Complete!"}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ScavengerHuntStation;