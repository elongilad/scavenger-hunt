"use client"

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from './ui/button';
import { Card, CardHeader, CardContent } from './ui/card';

interface QRCodeGeneratorProps {
  stationId: string;
}

const QRCodeGenerator = ({ stationId }: QRCodeGeneratorProps) => {
  // Get the base URL from window location
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const qrValue = `${baseUrl}/?station=${stationId}`;

  const downloadQR = () => {
    const svg = document.getElementById('qr-code');
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      
      const downloadLink = document.createElement("a");
      downloadLink.download = `station-${stationId}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <Card>
      <CardHeader>Station QR Code</CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div className="bg-white p-4 rounded">
          <QRCodeSVG
            id="qr-code"
            value={qrValue}
            size={200}
            level="H"
            includeMargin={true}
            bgColor="#FFFFFF"
            fgColor="#000000"
          />
        </div>
        <div className="text-sm text-gray-500 text-center mb-2">
          QR Code URL: {qrValue}
        </div>
        <Button onClick={downloadQR} className="w-full md:w-auto">
          Download QR Code
        </Button>
      </CardContent>
    </Card>
  );
};

export default QRCodeGenerator;