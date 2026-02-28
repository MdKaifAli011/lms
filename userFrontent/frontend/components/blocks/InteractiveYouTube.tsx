'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  ExternalLink, 
  Share2, 
  Copy, 
  Check,
  Clock,
  Eye,
  Film,
  Youtube
} from 'lucide-react'

interface YouTubeData {
  url: string
  title?: string
  description?: string
  startTime?: number
  endTime?: number
  autoplay?: boolean
  controls?: boolean
  mute?: boolean
  loop?: boolean
}

interface InteractiveYouTubeProps {
  data: YouTubeData
  className?: string
  aspectRatio?: '16:9' | '4:3' | '1:1' | '21:9'
  maxWidth?: string
  showInfo?: boolean
  allowFullscreen?: boolean
}

export function InteractiveYouTube({
  data,
  className,
  aspectRatio = '16:9',
  maxWidth = '100%',
  showInfo = true,
  allowFullscreen = true,
}: InteractiveYouTubeProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(data.mute || false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [videoInfo, setVideoInfo] = useState<{
    title: string
    duration: string
    views: string
    thumbnail: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Extract YouTube video ID
  const getVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
      /youtube\.com\/embed\/([^"&?\/\s]{11})/,
      /youtube\.com\/v\/([^"&?\/\s]{11})/
    ]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match && match[1]) {
        return match[1]
      }
    }

    return null
  }

  // Get aspect ratio classes
  const getAspectRatioClass = (ratio: string) => {
    switch (ratio) {
      case '16:9': return 'aspect-video'
      case '4:3': return 'aspect-[4/3]'
      case '1:1': return 'aspect-square'
      case '21:9': return 'aspect-[21/9]'
      default: return 'aspect-video'
    }
  }

  // Build YouTube embed URL
  const buildEmbedUrl = (videoId: string): string => {
    const params = new URLSearchParams({
      rel: '0',
      modestbranding: '1',
      fs: allowFullscreen ? '1' : '0',
      autoplay: data.autoplay ? '1' : '0',
      mute: isMuted ? '1' : '0',
      loop: data.loop ? '1' : '0',
      controls: data.controls !== false ? '1' : '0',
      start: String(data.startTime || 0),
      end: String(data.endTime || ''),
      cc_lang_pref: 'en',
      cc_load_policy: '1',
      iv_load_policy: '3',
      showinfo: showInfo ? '1' : '0',
    })

    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`
  }

  // Fetch video info using YouTube API
  const fetchVideoInfo = async (videoId: string) => {
    try {
      // Note: In production, you'd want to use a server-side API key
      // This is a simplified version using oembed
      const response = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
      )
      
      if (response.ok) {
        const data = await response.json()
        setVideoInfo({
          title: data.title,
          duration: '', // oembed doesn't provide duration
          views: '', // oembed doesn't provide views
          thumbnail: data.thumbnail_url
        })
      }
    } catch (err) {
      console.error('Failed to fetch video info:', err)
    }
  }

  // Handle play/pause
  const togglePlayPause = () => {
    if (iframeRef.current) {
      const message = isPlaying ? 'pause' : 'play'
      iframeRef.current.contentWindow?.postMessage(
        JSON.stringify({ event: 'command', func: message }),
        'https://www.youtube.com'
      )
      setIsPlaying(!isPlaying)
    }
  }

  // Handle mute/unmute
  const toggleMute = () => {
    if (iframeRef.current) {
      const message = isMuted ? 'unMute' : 'mute'
      iframeRef.current.contentWindow?.postMessage(
        JSON.stringify({ event: 'command', func: message }),
        'https://www.youtube.com'
      )
      setIsMuted(!isMuted)
    }
  }

  // Handle fullscreen
  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen()
        setIsFullscreen(true)
      } else {
        document.exitFullscreen()
        setIsFullscreen(false)
      }
    }
  }

  // Copy video URL
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(data.url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy URL:', err)
    }
  }

  // Share video
  const shareVideo = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: videoInfo?.title || 'YouTube Video',
          text: data.description || 'Check out this video',
          url: data.url,
        })
      } catch (err) {
        console.error('Share failed:', err)
        copyToClipboard()
      }
    } else {
      copyToClipboard()
    }
  }

  // Format duration
  const _formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  // Format views
  const formatViews = (views: string): string => {
    const num = parseInt(views)
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M views`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K views`
    }
    return `${num} views`
  }

  // Initialize
  useEffect(() => {
    const videoId = getVideoId(data.url)
    if (videoId) {
      fetchVideoInfo(videoId)
    } else {
      setError('Invalid YouTube URL')
    }
  }, [data.url])

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const videoId = getVideoId(data.url)
  const embedUrl = videoId ? buildEmbedUrl(videoId) : null

  if (!videoId || error) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-6 text-center">
          <Youtube className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-semibold mb-2">YouTube Video</h3>
          <p className="text-muted-foreground mb-4">
            {error || 'Invalid YouTube URL provided'}
          </p>
          <Button
            variant="outline"
            onClick={() => window.open(data.url, '_blank')}
            className="flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Open in YouTube
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("w-full transition-all duration-200 hover:shadow-lg", className)}>
      <CardHeader className="pb-4 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-red-100 dark:bg-red-900 flex items-center justify-center flex-shrink-0">
              <Youtube className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base sm:text-lg mb-1 truncate">{videoInfo?.title || 'YouTube Video'}</CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  <Film className="w-3 h-3 mr-1" />
                  Video
                </Badge>
                {videoInfo?.views && (
                  <Badge variant="outline" className="text-xs">
                    <Eye className="w-3 h-3 mr-1" />
                    {formatViews(videoInfo.views)}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons - Responsive layout */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={shareVideo}
              className="h-8 w-8 p-0"
            >
              <Share2 className="w-4 h-4" />
            </Button>
            
            {copied ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-green-600"
              >
                <Check className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={copyToClipboard}
                className="h-8 w-8 p-0"
              >
                <Copy className="w-4 h-4" />
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(data.url, '_blank')}
              className="h-8 w-8 p-0"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-4 sm:p-6">
        {/* Video Container - Responsive aspect ratio */}
        <div
          ref={containerRef}
          className={cn(
            "relative rounded-lg overflow-hidden bg-black",
            getAspectRatioClass(aspectRatio),
            isFullscreen && "fixed inset-0 z-50 w-screen h-screen rounded-none"
          )}
          style={{ maxWidth }}
        >
          {embedUrl ? (
            <iframe
              ref={iframeRef}
              src={embedUrl}
              className="w-full h-full"
              title={videoInfo?.title || 'YouTube video player'}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Youtube className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 opacity-50" />
            </div>
          )}

          {/* Custom Controls Overlay - Responsive */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 sm:p-4">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={togglePlayPause}
                  className="h-8 w-8 p-0 text-white hover:bg-white/20"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  className="h-8 w-8 p-0 text-white hover:bg-white/20"
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </Button>
              </div>

              <div className="flex items-center gap-2">
                {allowFullscreen && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleFullscreen}
                    className="h-8 w-8 p-0 text-white hover:bg-white/20"
                  >
                    {isFullscreen ? (
                      <Minimize2 className="w-4 h-4" />
                    ) : (
                      <Maximize2 className="w-4 h-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Video Info - Responsive typography */}
        {showInfo && (data.description || videoInfo?.title) && (
          <div className="space-y-2 sm:space-y-3">
            {videoInfo?.title && (
              <h3 className="font-semibold text-base sm:text-lg">{videoInfo.title}</h3>
            )}
            
            {data.description && (
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3">
                {data.description}
              </p>
            )}
            
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {videoInfo?.duration || 'Unknown duration'}
              </span>
              {videoInfo?.views && (
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {formatViews(videoInfo.views)}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Youtube className="w-3 h-3" />
                YouTube
              </span>
            </div>
          </div>
        )}

        {/* Video Settings - Responsive layout */}
        <div className="pt-4 border-t">
          <div className="flex flex-wrap gap-2 text-xs">
            <Badge variant={data.autoplay ? "default" : "outline"}>
              Autoplay: {data.autoplay ? 'On' : 'Off'}
            </Badge>
            <Badge variant={data.controls !== false ? "default" : "outline"}>
              Controls: {data.controls !== false ? 'On' : 'Off'}
            </Badge>
            <Badge variant={data.loop ? "default" : "outline"}>
              Loop: {data.loop ? 'On' : 'Off'}
            </Badge>
            <Badge variant={isMuted ? "default" : "outline"}>
              Muted: {isMuted ? 'On' : 'Off'}
            </Badge>
            <Badge variant="outline">
              {aspectRatio}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
