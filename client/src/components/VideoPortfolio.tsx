import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Play, Trash2, ExternalLink } from "lucide-react";

interface VideoPortfolioProps {
  profileId: number;
}

interface Video {
  id: number;
  title?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  platform?: string;
  views: number;
  likes: number;
  createdAt: string;
}

export default function VideoPortfolio({ profileId }: VideoPortfolioProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const [videoData, setVideoData] = useState({
    title: "",
    videoUrl: "",
    platform: "YouTube",
  });

  // Fetch videos
  const { data: videos, isLoading: videosLoading } = useQuery({
    queryKey: ["/api/profile", profileId, "videos"],
    enabled: !!profileId,
  });

  // Add video mutation
  const addVideoMutation = useMutation({
    mutationFn: async (data: typeof videoData) => {
      // Extract video ID and generate thumbnail based on platform
      const processedData = {
        ...data,
        thumbnailUrl: generateThumbnailUrl(data.videoUrl, data.platform),
      };
      
      return await apiRequest("POST", `/api/profile/${profileId}/videos`, processedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile", profileId, "videos"] });
      setIsVideoDialogOpen(false);
      setVideoData({
        title: "",
        videoUrl: "",
        platform: "YouTube",
      });
      toast({
        title: "Vídeo adicionado",
        description: "Vídeo adicionado ao seu portfólio com sucesso!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o vídeo",
        variant: "destructive",
      });
    },
  });

  // Delete video mutation
  const deleteVideoMutation = useMutation({
    mutationFn: async (videoId: number) => {
      return await apiRequest("DELETE", `/api/videos/${videoId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile", profileId, "videos"] });
      toast({
        title: "Vídeo removido",
        description: "Vídeo removido do seu portfólio com sucesso!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erro",
        description: "Não foi possível remover o vídeo",
        variant: "destructive",
      });
    },
  });

  const generateThumbnailUrl = (videoUrl: string, platform: string) => {
    try {
      const url = new URL(videoUrl);
      
      switch (platform) {
        case "YouTube":
          // Extract video ID from various YouTube URL formats
          let videoId = "";
          if (url.hostname.includes("youtube.com")) {
            videoId = url.searchParams.get("v") || "";
          } else if (url.hostname.includes("youtu.be")) {
            videoId = url.pathname.slice(1);
          }
          if (videoId) {
            return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
          }
          break;
          
        case "Instagram":
          // Instagram doesn't provide direct thumbnail access, use placeholder
          return "/placeholder-instagram-thumbnail.jpg";
          
        case "TikTok":
          // TikTok doesn't provide direct thumbnail access, use placeholder
          return "/placeholder-tiktok-thumbnail.jpg";
          
        default:
          return "/placeholder-video-thumbnail.jpg";
      }
    } catch {
      return "/placeholder-video-thumbnail.jpg";
    }
  };

  const getPlatformIcon = (platform?: string) => {
    switch (platform) {
      case "YouTube":
        return "📺";
      case "Instagram":
        return "📷";
      case "TikTok":
        return "🎵";
      default:
        return "🎬";
    }
  };

  const handleVideoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoData.videoUrl || !videoData.title) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }
    addVideoMutation.mutate(videoData);
  };

  const openVideoInNewTab = (videoUrl: string) => {
    window.open(videoUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-caps">VÍDEOS EM DESTAQUE</CardTitle>
          <Dialog open={isVideoDialogOpen} onOpenChange={setIsVideoDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" disabled={videos && videos.length >= 3}>
                <Plus className="h-4 w-4 mr-2" />
                ADICIONAR VÍDEO
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Vídeo</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleVideoSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Título do Vídeo *</label>
                  <Input
                    value={videoData.title}
                    onChange={(e) => setVideoData({ ...videoData, title: e.target.value })}
                    placeholder="Ex: Gols e Assistências - Temporada 2024"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Plataforma</label>
                  <Select 
                    value={videoData.platform} 
                    onValueChange={(value) => setVideoData({ ...videoData, platform: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="YouTube">YouTube</SelectItem>
                      <SelectItem value="Instagram">Instagram</SelectItem>
                      <SelectItem value="TikTok">TikTok</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">URL do Vídeo *</label>
                  <Input
                    type="url"
                    value={videoData.videoUrl}
                    onChange={(e) => setVideoData({ ...videoData, videoUrl: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Cole o link completo do seu vídeo do YouTube, Instagram ou TikTok
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="cta-button w-full"
                  disabled={addVideoMutation.isPending}
                >
                  {addVideoMutation.isPending ? "ADICIONANDO..." : "ADICIONAR VÍDEO"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {videos && videos.length >= 3 && (
          <p className="text-sm text-muted-foreground mb-4">
            Limite máximo de 3 vídeos atingido. Remova um vídeo para adicionar outro.
          </p>
        )}

        {videosLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="aspect-video w-full rounded-lg" />
            ))}
          </div>
        ) : videos && videos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video: Video) => (
              <div key={video.id} className="group relative">
                {/* Video Thumbnail */}
                <div 
                  className="aspect-video bg-muted rounded-lg cursor-pointer hover:opacity-80 transition-opacity overflow-hidden relative"
                  onClick={() => openVideoInNewTab(video.videoUrl)}
                >
                  {video.thumbnailUrl ? (
                    <img 
                      src={video.thumbnailUrl} 
                      alt={video.title || "Video thumbnail"}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to placeholder if thumbnail fails to load
                        (e.target as HTMLImageElement).src = "/placeholder-video-thumbnail.jpg";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <div className="text-3xl mb-2">{getPlatformIcon(video.platform)}</div>
                        <div className="text-sm">Vídeo</div>
                      </div>
                    </div>
                  )}
                  
                  {/* Play Overlay */}
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="h-12 w-12 text-white" />
                  </div>

                  {/* Platform Badge */}
                  <div className="absolute top-2 left-2">
                    <span className="text-lg">{getPlatformIcon(video.platform)}</span>
                  </div>

                  {/* Delete Button */}
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteVideoMutation.mutate(video.id);
                    }}
                    disabled={deleteVideoMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Video Info */}
                <div className="mt-2 space-y-1">
                  <h4 className="font-medium text-sm line-clamp-2">
                    {video.title || "Sem título"}
                  </h4>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{video.platform}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-1 text-xs"
                      onClick={() => openVideoInNewTab(video.videoUrl)}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Abrir
                    </Button>
                  </div>
                  {(video.views > 0 || video.likes > 0) && (
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      {video.views > 0 && <span>👁️ {video.views.toLocaleString()}</span>}
                      {video.likes > 0 && <span>❤️ {video.likes.toLocaleString()}</span>}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-lg font-medium mb-2">Nenhum vídeo adicionado</h3>
            <p className="text-muted-foreground mb-6">
              Adicione até 3 vídeos do YouTube, Instagram ou TikTok para mostrar suas habilidades
            </p>
            <Dialog open={isVideoDialogOpen} onOpenChange={setIsVideoDialogOpen}>
              <DialogTrigger asChild>
                <Button className="cta-button">
                  <Plus className="h-4 w-4 mr-2" />
                  ADICIONAR PRIMEIRO VÍDEO
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
