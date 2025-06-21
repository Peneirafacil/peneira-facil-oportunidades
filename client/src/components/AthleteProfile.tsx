import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AthleteProfileProps {
  athlete: {
    name: string;
    bio: string;
    state: string;
    age: number;
    position: string;
    modality: string;
    gender: string;
    clubHistory: Array<{
      clubName: string;
      startYear: number;
      endYear?: number;
      level: string;
    }>;
    videos: Array<{
      id: number;
      title?: string;
      thumbnailUrl?: string;
    }>;
  };
}

export default function AthleteProfile({ athlete }: AthleteProfileProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2);
  };

  return (
    <Card className="overflow-hidden card-hover">
      {/* Profile Header */}
      <div className="relative p-6 gradient-primary text-white">
        <Avatar className="w-20 h-20 mx-auto border-4 border-white shadow-lg">
          <AvatarImage src="/placeholder-avatar.jpg" />
          <AvatarFallback className="text-2xl bg-white text-primary">
            {getInitials(athlete.name)}
          </AvatarFallback>
        </Avatar>
        
        <h3 className="text-center mt-4 text-xl font-bold text-white">
          {athlete.name}
        </h3>
        <p className="text-center text-sm text-white/80 mt-1 line-clamp-2">
          {athlete.bio}
        </p>
        
        {/* Stats */}
        <div className="flex justify-center space-x-6 mt-4">
          <div className="text-center">
            <div className="text-white font-bold">📍</div>
            <div className="text-xs text-white/80">{athlete.state}</div>
          </div>
          <div className="text-center">
            <div className="text-white font-bold">📅</div>
            <div className="text-xs text-white/80">{athlete.age} anos</div>
          </div>
          <div className="text-center">
            <div className="text-white font-bold">🎯</div>
            <div className="text-xs text-white/80">{athlete.position}</div>
          </div>
          <div className="text-center">
            <div className="text-white font-bold">
              {athlete.gender === 'Feminino' ? '🚻' : '🏟️'}
            </div>
            <div className="text-xs text-white/80">
              {athlete.gender === 'Feminino' ? 'Feminino' : athlete.modality}
            </div>
          </div>
        </div>
      </div>
      
      {/* Club History */}
      <CardContent className="p-6">
        <h4 className="font-bold mb-3 text-caps">CLUBES E TIMES QUE JÁ PASSOU</h4>
        <div className="space-y-2 mb-6">
          {athlete.clubHistory.slice(0, 2).map((club, index) => (
            <div key={index} className="flex justify-between items-center p-2 bg-muted rounded-lg">
              <span className="text-sm font-medium">{club.clubName}</span>
              <span className="text-xs text-muted-foreground">
                {club.startYear}-{club.endYear || new Date().getFullYear()}
              </span>
            </div>
          ))}
          {athlete.clubHistory.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-2">
              Nenhum clube cadastrado
            </p>
          )}
        </div>
        
        {/* Video Highlights */}
        <h4 className="font-bold mb-3 text-caps">VÍDEOS EM DESTAQUE</h4>
        <div className="grid grid-cols-2 gap-2">
          {athlete.videos.length > 0 ? (
            athlete.videos.slice(0, 2).map((video) => (
              <div
                key={video.id}
                className="w-full h-20 bg-muted rounded-lg cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center"
                onClick={() => {/* Handle video play */}}
              >
                <div className="text-center text-muted-foreground">
                  <div className="text-2xl mb-1">▶️</div>
                  <div className="text-xs">Vídeo</div>
                </div>
              </div>
            ))
          ) : (
            <>
              <div className="w-full h-20 bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <div className="text-lg mb-1">📹</div>
                  <div className="text-xs">Vídeo 1</div>
                </div>
              </div>
              <div className="w-full h-20 bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <div className="text-lg mb-1">🎬</div>
                  <div className="text-xs">Vídeo 2</div>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
