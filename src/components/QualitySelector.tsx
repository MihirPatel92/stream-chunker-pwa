import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Settings, Zap, Wifi } from 'lucide-react';

interface QualitySelectorProps {
  currentQuality: string;
  availableQualities: string[];
  onQualityChange: (quality: string) => void;
  streamingStats: {
    currentBitrate: number;
    bufferLevel: number;
    networkSpeed: number;
    droppedFrames: number;
    chunkCount: number;
  };
}

const QualitySelector: React.FC<QualitySelectorProps> = ({
  currentQuality,
  availableQualities,
  onQualityChange,
  streamingStats,
}) => {
  const formatBitrate = (bitrate: number): string => {
    if (bitrate >= 1000000) {
      return `${(bitrate / 1000000).toFixed(1)}M`;
    }
    return `${(bitrate / 1000).toFixed(0)}K`;
  };

  const formatSpeed = (speed: number): string => {
    if (speed >= 1000000) {
      return `${(speed / 1000000).toFixed(1)} Mbps`;
    }
    return `${(speed / 1000).toFixed(0)} Kbps`;
  };

  const getQualityIcon = (quality: string) => {
    if (quality === 'Auto') return <Zap className="h-3 w-3" />;
    return <Wifi className="h-3 w-3" />;
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case '1080p': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case '720p': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case '480p': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case '360p': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case '240p': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-primary/20 text-primary border-primary/30';
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
            <Settings className="h-4 w-4 mr-2" />
            Quality
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-card/95 backdrop-blur border-border/50">
          <div className="p-2 border-b border-border/30">
            <div className="text-xs text-muted-foreground mb-2">Current Quality</div>
            <Badge className={`${getQualityColor(currentQuality)} text-xs`}>
              {getQualityIcon(currentQuality)}
              <span className="ml-1">{currentQuality}</span>
            </Badge>
          </div>
          
          <div className="p-2 border-b border-border/30">
            <div className="text-xs text-muted-foreground mb-2">Streaming Stats</div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Bitrate:</span>
                <span className="text-primary">{formatBitrate(streamingStats.currentBitrate)}</span>
              </div>
              <div className="flex justify-between">
                <span>Buffer:</span>
                <span className="text-primary">{streamingStats.bufferLevel.toFixed(1)}s</span>
              </div>
              <div className="flex justify-between">
                <span>Speed:</span>
                <span className="text-primary">{formatSpeed(streamingStats.networkSpeed)}</span>
              </div>
              <div className="flex justify-between">
                <span>Chunks:</span>
                <span className="text-primary">{streamingStats.chunkCount}</span>
              </div>
              {streamingStats.droppedFrames > 0 && (
                <div className="flex justify-between">
                  <span>Dropped:</span>
                  <span className="text-destructive">{streamingStats.droppedFrames}</span>
                </div>
              )}
            </div>
          </div>

          <div className="p-1">
            <div className="text-xs text-muted-foreground px-2 py-1">Available Qualities</div>
            {availableQualities.map((quality) => (
              <DropdownMenuItem
                key={quality}
                onClick={() => onQualityChange(quality)}
                className={`flex items-center justify-between cursor-pointer ${
                  currentQuality === quality ? 'bg-primary/10 text-primary' : ''
                }`}
              >
                <div className="flex items-center">
                  {getQualityIcon(quality)}
                  <span className="ml-2">{quality}</span>
                </div>
                {currentQuality === quality && (
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                )}
              </DropdownMenuItem>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default QualitySelector;