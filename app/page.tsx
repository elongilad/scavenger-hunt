"use client"

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Camera } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  
  const searchParams = useSearchParams();
  const stationParam = searchParams.get('station');

  useEffect(() => {
    const loadStations = async () => {
      try {
        const { data, error } = await supabase
          .from('stations')
          .select('*');

        if (error) throw error;

        const stationsRecord = (data || []).reduce((acc, station) => {
          acc[station.id] = {
            ...station,
            videoUrl: station.video_url,
            routes: station.routes || {}
          };
          return acc;
        }, {} as Record<string, Station>);

        setStations(stationsRecord);
        setLoading(false);

        if (stationParam && stationsRecord[stationParam]) {
          setCurrentStation(stationsRecord[stationParam]);
        }
      } catch (error) {
        console.error('Error loading stations:', error);
        setError('שגיאה בטעינת הנתונים. אנא נסה שנית.');
        setLoading(false);
      }
    };

    loadStations();
  }, [stationParam]);

  const onScanSuccess = useCallback((decodedText: string) => {
    const stationId = decodedText.split('station=')[1];
    const station = stations[stationId];
    if (station) {
      setCurrentStation(station);
      setShowScanner(false);
      setError('');
    } else {
      setError('קוד QR לא חוקי! נסה שנית.');
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
      setError('יש לסרוק קוד QR תחילה!');
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
      setError('קוד גישה שגוי. נסה שנית.');
      setShowVideo(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-md mx-auto p-4">
        <Card className="bg-zinc-900 text-white border border-zinc-800">
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <span className="decrypt-text">מאמת הרשאות...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <Card className="bg-zinc-900 text-white border border-zinc-800">
        <CardHeader className="text-center text-2xl font-bold border-b border-zinc-800 bg-gradient-to-r from-zinc-900 to-zinc-800">
          <div className="flex items-center justify-center gap-2">
            <span>🔒</span>
            <span className="glitch" data-text="מערכת גישה מאובטחת">מערכת גישה מאובטחת</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 rtl">
          {!currentStation && !showScanner && (
            <div className="text-center">
              <Button 
                onClick={() => setShowScanner(true)}
                className="bg-zinc-700 hover:bg-zinc-600 transition-colors"
              >
                <Camera className="ml-2 h-4 w-4" />
                סריקת קוד גישה
              </Button>
            </div>
          )}

          {showScanner && (
            <div className="mb-4">
              <div id="qr-reader" className="w-full border-2 border-zinc-700 rounded-lg overflow-hidden relative spy-scanner"></div>
              <Button 
                onClick={() => setShowScanner(false)}
                className="mt-2 w-full bg-red-900 hover:bg-red-800 transition-colors"
              >
                ביטול סריקה
              </Button>
            </div>
          )}

          {currentStation && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="text-center mb-4 bg-zinc-800 p-3 rounded-lg border border-zinc-700 relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="font-bold text-blue-400 decrypt-text">מיקום נוכחי:</h3>
                  <p className="text-xl decrypt-text">{currentStation.name}</p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent animate-pulse"></div>
              </div>
              
              <div className="relative">
                <Input
                  type="text"
                  placeholder="הזן קוד גישה"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white text-right pr-10"
                />
                <div className="absolute left-2 top-1/2 -translate-y-1/2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-blue-900 hover:bg-blue-800 transition-colors"
              >
                אימות קוד גישה
              </Button>
            </form>
          )}

          {error && (
            <Alert variant="destructive" className="bg-red-900/50 border-red-800">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {showVideo && stationData && (
            <div className="mt-4 space-y-4">
              <div className="aspect-video bg-zinc-800 rounded-lg overflow-hidden relative border border-zinc-700">
                <Image 
                  src={stationData.videoUrl}
                  alt="תדרוך משימה"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4 bg-zinc-800 rounded-lg border border-zinc-700 relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="font-bold mb-2 text-blue-400 decrypt-text">עדכון משימה:</h3>
                  <p className="text-white decrypt-text">
                    {Object.values(stationData.routes)[0]?.nextClue || "המשימה הושלמה!"}
                  </p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent animate-pulse"></div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default function Home() {
  return <ScavengerHuntStation />;
}