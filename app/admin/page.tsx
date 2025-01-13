"use client"

import React, { useState } from 'react';
import Image from 'next/image';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/lib/supabase';

interface RouteStep {
  team_code: string;
  station_id: string;
  next_video_url: string;
  step_order: number;
}

const GameInterface = () => {
  const [teamCode, setTeamCode] = useState('');
  const [currentStep, setCurrentStep] = useState<RouteStep | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('route_steps')
        .select('*')
        .eq('team_code', teamCode.toUpperCase())
        .order('step_order')
        .limit(1);

      if (error) throw error;

      if (data && data[0]) {
        setCurrentStep(data[0]);
        setError('');
      } else {
        setError('קוד גישה שגוי. נסה שנית.');
      }
    } catch (error) {
      setError('שגיאה במערכת. אנא נסה שנית.');
      console.error(error);
    }
    setLoading(false);
  };

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
          {!currentStep ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Input
                  type="text"
                  value={teamCode}
                  onChange={(e) => setTeamCode(e.target.value)}
                  placeholder="הזן קוד גישה"
                  className="bg-zinc-800 border-zinc-700 text-white text-right pr-10"
                />
                <div className="absolute left-2 top-1/2 -translate-y-1/2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-blue-900 hover:bg-blue-800 transition-colors"
                disabled={loading}
              >
                אימות קוד גישה
              </Button>
            </form>
          ) : (
            <div className="mt-4 space-y-4">
              <div className="aspect-video bg-zinc-800 rounded-lg overflow-hidden relative border border-zinc-700">
                <Image 
                  src={currentStep.next_video_url}
                  alt="תדרוך משימה"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4 bg-zinc-800 rounded-lg border border-zinc-700 relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="font-bold mb-2 text-blue-400 decrypt-text">עדכון משימה:</h3>
                  <p className="text-white decrypt-text">
                    צפה בסרטון למציאת היעד הבא
                  </p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent animate-pulse"></div>
              </div>
              <Button 
                onClick={() => setCurrentStep(null)}
                className="w-full bg-blue-900 hover:bg-blue-800 transition-colors"
              >
                הזן קוד חדש
              </Button>
            </div>
          )}

          {error && (
            <Alert variant="destructive" className="bg-red-900/50 border-red-800">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading && (
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GameInterface;