"use client"

import React from 'react';
import QRCode from 'qrcode.react';
import { Button } from './ui/button';
import { Card, CardHeader, CardContent } from './ui/card';

interface QRCodeGeneratorProps {
  stationId: string;
}

const QRCodeGenerator = ({ stationId }: QRCodeGeneratorProps) => {
  const downloadQR = () => {
    const canvas = document.getElementById('qr-code') as HTMLCanvasElement;
    const pngUrl = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");
    let downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `station-${stationId}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <Card>
      <CardHeader>Station QR Code</CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <QRCode
          id="qr-code"
          value={stationId}
          size={200}
          level="H"
        />
        <Button onClick={downloadQR}>
          Download QR Code
        </Button>
      </CardContent>
    </Card>
  );
};

export default QRCodeGenerator;