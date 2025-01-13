"use client"

import React from 'react';

interface VideoPlayerProps {
  url: string;
  className?: string;
}

const VideoPlayer = ({ url, className = "" }: VideoPlayerProps) => {
  // Convert Google Drive sharing URL to embed URL
  const getVideoUrl = (url: string) => {
    if (!url) {
      console.error('No URL provided to VideoPlayer');
      return '';
    }
    
    try {
      const fileId = url.match(/[-\w]{25,}/);
      if (fileId) {
        return `https://drive.google.com/file/d/${fileId[0]}/preview`;
      }
      return url;
    } catch (error) {
      console.error('Error processing video URL:', error);
      return '';
    }
  };

  if (!url) {
    return <div className={`${className} flex items-center justify-center bg-zinc-800`}>
      No video URL provided
    </div>;
  }

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