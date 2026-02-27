import { useEffect, useState } from "react";
import { useLanyard } from "@/hooks/useLanyard";
import type { Activity } from "@/types";

const getActivityImage = (activity: Activity) => {
  const appId = activity.application_id;
  const assetId = activity.assets?.large_image;
  if (!assetId) return null;
  if (assetId.startsWith("mp:external/")) {
    return `https://media.discordapp.net/${assetId.replace("mp:", "")}`;
  }
  if (appId) return `https://cdn.discordapp.com/app-assets/${appId}/${assetId}.png`;
  return null;
};

const STATUS_COLORS: Record<string, string> = {
  online: "bg-green-500",
  idle: "bg-yellow-500",
  dnd: "bg-red-500",
  offline: "bg-gray-500",
};

const STATUS_LABELS: Record<string, string> = {
  online: "Online",
  idle: "Idle",
  dnd: "Do Not Disturb",
  offline: "Offline",
};

export function DiscordStatus() {
  const { data, status, error } = useLanyard();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (ms: number) => {
    if (ms < 0) ms = 0;
    const s = Math.floor((ms / 1000) % 60);
    const m = Math.floor((ms / 1000 / 60) % 60);
    const h = Math.floor(ms / 1000 / 60 / 60);
    return `${h > 0 ? `${h}:` : ""}${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const calculateProgress = (start: number, end: number) => {
    const total = end - start;
    const current = now - start;
    return Math.min(Math.max((current / total) * 100, 0), 100);
  };

  const codingActivity = data?.activities.find((a) =>
    ["Visual Studio Code", "IntelliJ IDEA", "Android Studio", "Neovim"].includes(a.name)
  );
  const spotifyActivity = data?.activities.find((a) => a.type === 2 && a.name === "Spotify");
  const spotifyFromActivity = spotifyActivity
    ? {
        track_id: spotifyActivity.sync_id || "",
        timestamps:
          spotifyActivity.timestamps?.start && spotifyActivity.timestamps?.end
            ? { start: spotifyActivity.timestamps.start, end: spotifyActivity.timestamps.end }
            : null,
        song: spotifyActivity.details || "Listening on Spotify",
        artist: spotifyActivity.state || "",
        album_art_url: spotifyActivity.assets?.large_image
          ? spotifyActivity.assets.large_image.startsWith("spotify:")
            ? `https://i.scdn.co/image/${spotifyActivity.assets.large_image.replace("spotify:", "")}`
            : getActivityImage(spotifyActivity) || ""
          : "",
        album: spotifyActivity.assets?.large_text || "",
      }
    : null;
  const spotify = data?.spotify || spotifyFromActivity;
  const gameActivity = data?.activities.find(
    (a) => a.type === 0 && !codingActivity && a.name !== "Custom Status"
  );
  const customStatus = data?.activities.find((a) => a.type === 4);
  const avatarUrl = data
    ? `https://cdn.discordapp.com/avatars/${data.discord_user.id}/${data.discord_user.avatar}.png?size=512`
    : null;

  const discordStatus = data?.discord_status || "offline";
  const statusColor = STATUS_COLORS[discordStatus] || STATUS_COLORS.offline;

  return (
    <div className="h-full relative overflow-hidden border-[3px] border-black bg-black rounded-xl shadow-brutal group/discord">
      <div className="absolute inset-0 z-0">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Background"
            className="w-full h-full object-cover opacity-60 group-hover/discord:scale-105 transition-transform duration-700 blur-[2px]"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-black opacity-70" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/30" />
      </div>

      <div className="relative z-10 h-full p-4 pb-3 flex flex-col justify-end gap-3">
        <div className="rounded-xl bg-white/10 border border-white/10 backdrop-blur-md p-3 shadow-lg">
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/10">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 127.14 96.36" fill="currentColor" className="opacity-80">
                  <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.11,77.11,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.89,105.89,0,0,0,126.6,80.22c2.91-27.55-13.53-51.36-18.9-72.15ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
                </svg>
                <h3 className="font-bold text-sm leading-none">{data ? data.discord_user.username : "Discord"}</h3>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${statusColor} animate-pulse`} />
                <span className="text-[10px] font-medium text-white/70 uppercase tracking-wide">
                  {data ? STATUS_LABELS[discordStatus] : status === "connecting" ? "Connecting..." : "Offline"}
                </span>
              </div>
            </div>
          </div>

          <div className="min-h-[40px] flex items-center">
            {!data ? (
              <div className="w-full flex items-center gap-3 text-white/70 py-1">
                <div className="w-4 h-4 border-2 border-white/40 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-semibold">
                  {error || "Loading Discord status..."}
                </p>
              </div>
            ) : gameActivity ? (
              <div className="w-full">
                <div className="flex items-center gap-3">
                  {getActivityImage(gameActivity) && (
                    <img src={getActivityImage(gameActivity)!} className="w-10 h-10 rounded-md bg-black/20 object-cover shrink-0" alt="Game" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wide mb-0.5">Playing</p>
                    <p className="text-sm text-white font-bold truncate">{gameActivity.name}</p>
                    {gameActivity.timestamps?.start && (
                      <p className="text-[10px] text-white/60 font-mono mt-0.5">
                        {formatTime(now - gameActivity.timestamps.start)} elapsed
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : codingActivity ? (
              <div className="w-full">
                <div className="flex items-start gap-3">
                  {getActivityImage(codingActivity) ? (
                    <img src={getActivityImage(codingActivity)!} className="w-10 h-10 rounded-md bg-black/20 shrink-0" alt="Lang" />
                  ) : (
                    <div className="w-10 h-10 p-2 bg-blue-500/20 text-blue-400 rounded-md flex items-center justify-center shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
                      </svg>
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold text-blue-300 uppercase tracking-wide mb-0.5">Working on {codingActivity.name}</p>
                    <p className="text-xs text-white font-semibold truncate">{codingActivity.details || "No file details"}</p>
                    {codingActivity.state && <p className="text-[11px] text-white/70 truncate">{codingActivity.state}</p>}
                  </div>
                </div>
              </div>
            ) : spotify ? (
              <div className="w-full">
                <div className="flex items-start gap-3 mb-2">
                  {spotify.album_art_url ? (
                    <img src={spotify.album_art_url} className="w-10 h-10 rounded-md shrink-0" alt="Album" />
                  ) : (
                    <div className="w-10 h-10 rounded-md bg-white/10 shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold text-green-400 uppercase tracking-wide mb-0.5">Listening to Spotify</p>
                    <p className="text-xs text-white font-semibold truncate">{spotify.song}</p>
                    <p className="text-[11px] text-white/70 truncate">by {spotify.artist}</p>
                  </div>
                </div>
                {spotify.timestamps && (
                  <div className="w-full space-y-1">
                    <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all duration-1000 ease-linear"
                        style={{ width: `${calculateProgress(spotify.timestamps.start, spotify.timestamps.end)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-white/40 font-mono">
                      <span>{formatTime(now - spotify.timestamps.start)}</span>
                      <span>{formatTime(spotify.timestamps.end - spotify.timestamps.start)}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full flex items-center gap-2 text-white/60 py-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
                <p className="text-xs italic truncate">&quot;{customStatus?.state || "Currently chilling..."}&quot;</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
