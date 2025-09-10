import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VideoPlayer from './VideoPlayer';
import { Play, Upload, Zap, Download, Settings, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const StreamingDashboard: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const { toast } = useToast();

  // Demo video URLs (replace with your actual streaming URLs)
  const demoVideos = [
    {
      id: 1,
      title: 'Demo: Adaptive Streaming',
      src: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
      poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&h=450&fit=crop',
      type: 'HLS'
    },
    {
      id: 2,
      title: 'Sample Video Stream',
      src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      poster: 'https://images.unsplash.com/photo-1489599511866-3b5e20dcaaea?w=800&h=450&fit=crop',
      type: 'MP4'
    }
  ];

  const handleStreamStart = () => {
    setIsStreaming(true);
    toast({
      title: "Stream Started",
      description: "Your video is now streaming with adaptive bitrate",
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      toast({
        title: "Video Loaded",
        description: "Ready for chunked streaming",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  StreamPlex
                </h1>
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                PWA Ready
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="default" className="bg-gradient-primary hover:opacity-90">
                <TrendingUp className="h-4 w-4 mr-2" />
                Analytics
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="player" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="player">Video Player</TabsTrigger>
            <TabsTrigger value="upload">Upload & Stream</TabsTrigger>
            <TabsTrigger value="settings">Configuration</TabsTrigger>
          </TabsList>

          <TabsContent value="player" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {demoVideos.map((video) => (
                <VideoPlayer
                  key={video.id}
                  src={video.src}
                  title={video.title}
                  poster={video.poster}
                  enableChunking={video.type === 'HLS'}
                />
              ))}
            </div>

            {videoUrl && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Your Uploaded Video</h2>
                <VideoPlayer
                  src={videoUrl}
                  title="Your Custom Video"
                  enableChunking={false}
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="upload" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="bg-gradient-card border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Upload className="h-5 w-5" />
                    <span>Upload Video</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="video-upload">Select Video File</Label>
                    <Input
                      id="video-upload"
                      type="file"
                      accept="video/*"
                      onChange={handleFileUpload}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="video-url">Or Enter Video URL</Label>
                    <Input
                      id="video-url"
                      type="url"
                      placeholder="https://example.com/video.m3u8"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <Button 
                    onClick={handleStreamStart}
                    disabled={!videoUrl}
                    className="w-full bg-gradient-primary hover:opacity-90"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Streaming
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-border/50">
                <CardHeader>
                  <CardTitle>Streaming Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Zap className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Adaptive Bitrate</span>
                      </div>
                      <Badge variant="secondary">HLS/DASH</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Download className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Video Chunking</span>
                      </div>
                      <Badge variant="secondary">Optimized</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Settings className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Quality Control</span>
                      </div>
                      <Badge variant="secondary">Auto</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="bg-gradient-card border-border/50">
                <CardHeader>
                  <CardTitle>Streaming Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="chunk-size">Chunk Size (seconds)</Label>
                    <Input
                      id="chunk-size"
                      type="number"
                      defaultValue="10"
                      min="1"
                      max="30"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="buffer-length">Buffer Length (seconds)</Label>
                    <Input
                      id="buffer-length"
                      type="number"
                      defaultValue="30"
                      min="10"
                      max="60"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="quality-levels">Quality Levels</Label>
                    <Input
                      id="quality-levels"
                      defaultValue="240p,480p,720p,1080p"
                      className="mt-2"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-border/50">
                <CardHeader>
                  <CardTitle>PWA Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">Offline Support</span>
                    <Badge variant="secondary">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">Service Worker</span>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">Cache Strategy</span>
                    <Badge variant="secondary">Network First</Badge>
                  </div>
                  <Button variant="outline" className="w-full">
                    Clear Cache
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StreamingDashboard;