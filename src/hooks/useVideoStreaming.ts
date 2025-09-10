import { useState, useEffect, useCallback } from 'react';
import Hls from 'hls.js';

interface StreamingConfig {
  chunkSize: number;
  bufferLength: number;
  maxBufferLength: number;
  enableAdaptive: boolean;
  qualityLevels: string[];
}

interface StreamingStats {
  currentBitrate: number;
  droppedFrames: number;
  bufferLevel: number;
  networkSpeed: number;
  chunkCount: number;
}

const useVideoStreaming = (videoElement: HTMLVideoElement | null, config: StreamingConfig) => {
  const [hls, setHls] = useState<Hls | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [currentQuality, setCurrentQuality] = useState('Auto');
  const [availableQualities, setAvailableQualities] = useState<string[]>([]);
  const [streamingStats, setStreamingStats] = useState<StreamingStats>({
    currentBitrate: 0,
    droppedFrames: 0,
    bufferLevel: 0,
    networkSpeed: 0,
    chunkCount: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsSupported(Hls.isSupported());
  }, []);

  const initializeHLS = useCallback((src: string) => {
    if (!videoElement || !isSupported) return;

    const hlsInstance = new Hls({
      enableWorker: true,
      lowLatencyMode: false,
      backBufferLength: 90,
      maxBufferLength: config.bufferLength,
      maxMaxBufferLength: config.maxBufferLength,
      progressive: true,
      debug: false,
      // Chunking configuration
      fragLoadingTimeOut: 20000,
      fragLoadingMaxRetry: 6,
      fragLoadingRetryDelay: 500,
      // Adaptive bitrate settings
      abrEwmaFastLive: 3.0,
      abrEwmaSlowLive: 9.0,
      abrMaxWithRealBitrate: false,
      maxStarvationDelay: 4,
      maxLoadingDelay: 4,
    });

    hlsInstance.loadSource(src);
    hlsInstance.attachMedia(videoElement);

    // Event listeners for monitoring streaming performance
    hlsInstance.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
      setIsLoading(false);
      setError(null);
      
      // Extract available quality levels
      const qualities = data.levels.map((level, index) => {
        const height = level.height || 0;
        if (height >= 1080) return '1080p';
        if (height >= 720) return '720p';
        if (height >= 480) return '480p';
        if (height >= 360) return '360p';
        return '240p';
      });
      
      setAvailableQualities(['Auto', ...qualities]);
    });

    hlsInstance.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
      const level = hlsInstance.levels[data.level];
      const quality = level.height >= 1080 ? '1080p' : 
                     level.height >= 720 ? '720p' : 
                     level.height >= 480 ? '480p' : 
                     level.height >= 360 ? '360p' : '240p';
      
      setCurrentQuality(quality);
      setStreamingStats(prev => ({
        ...prev,
        currentBitrate: level.bitrate,
      }));
    });

    hlsInstance.on(Hls.Events.FRAG_LOADED, (event, data) => {
      setStreamingStats(prev => ({
        ...prev,
        chunkCount: prev.chunkCount + 1,
        networkSpeed: data.frag.duration ? data.frag.byteLength / data.frag.duration * 8 : 0, // Estimate network speed
        bufferLevel: videoElement.buffered.length > 0 ? videoElement.buffered.end(0) - videoElement.currentTime : 0,
      }));
    });

    hlsInstance.on(Hls.Events.ERROR, (event, data) => {
      console.error('HLS Error:', data);
      
      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            setError('Network error occurred while streaming');
            hlsInstance.startLoad();
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            setError('Media error occurred');
            hlsInstance.recoverMediaError();
            break;
          default:
            setError('Fatal error occurred');
            hlsInstance.destroy();
            break;
        }
      }
    });

    setHls(hlsInstance);
  }, [videoElement, isSupported, config]);

  const changeQuality = useCallback((quality: string) => {
    if (!hls) return;

    if (quality === 'Auto') {
      hls.currentLevel = -1; // Enable automatic quality selection
    } else {
      const qualityIndex = availableQualities.findIndex(q => q === quality) - 1; // -1 because 'Auto' is not in levels
      if (qualityIndex >= 0 && qualityIndex < hls.levels.length) {
        hls.currentLevel = qualityIndex;
      }
    }
    setCurrentQuality(quality);
  }, [hls, availableQualities]);

  const destroy = useCallback(() => {
    if (hls) {
      hls.destroy();
      setHls(null);
    }
  }, [hls]);

  const seekToChunk = useCallback((chunkIndex: number) => {
    if (!hls || !videoElement) return;
    
    const chunkDuration = config.chunkSize;
    const targetTime = chunkIndex * chunkDuration;
    videoElement.currentTime = targetTime;
  }, [hls, videoElement, config.chunkSize]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      destroy();
    };
  }, [destroy]);

  // Update stats periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (videoElement && videoElement.getVideoPlaybackQuality) {
        const playbackQuality = videoElement.getVideoPlaybackQuality();
        setStreamingStats(prev => ({
          ...prev,
          droppedFrames: playbackQuality.droppedVideoFrames,
        }));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [videoElement]);

  return {
    hls,
    isSupported,
    currentQuality,
    availableQualities,
    streamingStats,
    isLoading,
    error,
    initializeHLS,
    changeQuality,
    destroy,
    seekToChunk,
  };
};

export default useVideoStreaming;