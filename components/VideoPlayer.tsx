"use client"

import React from 'react';

interface VideoPlayerProps {
  url: string;
  className?: string;
}

const VideoPlayer = ({ url, className = "" }: VideoPlayerProps) => {
  // Convert Google Drive sharing URL to embed URL
  const getVideoUrl = (url: string) => {
    const fileId = url.match(/[-\w]{25,}/);
    if (fileId) {
      return `https://drive.google.com/file/d/${fileId[0]}/preview`;
    }
    return url;
  };

  return (
    <div className={`aspect-video w-full ${className}`}>
      <iframe
        src={getVideoUrl(url)}
        className="w-full h-full rounded-lg"
        allow="autoplay"
        allowFullScreen
      />
    </div>
  );
};

export default VideoPlayer;