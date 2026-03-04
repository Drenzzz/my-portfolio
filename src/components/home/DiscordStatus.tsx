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
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/30" />
      </div>

      <div className="relative z-10 h-full p-4 flex flex-col justify-end gap-3">
        <div className="rounded-xl bg-white/10 border border-white/10 backdrop-blur-md p-4 shadow-lg flex flex-col h-full justify-between">
          <div className="flex flex-col items-center justify-center mb-3 pb-4 border-b border-white/10 gap-2">
            
            {/* Centered Large Avatar for Vertical Layout */}
            {avatarUrl ? (
               <img src={avatarUrl} alt="Avatar" className="w-20 h-20 rounded-full border-4 border-black/50" />
            ) : (
               <div className="w-20 h-20 rounded-full bg-white/20 border-4 border-black/50 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 127.14 96.36" fill="currentColor" className="opacity-80">
                    <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.11,77.11,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.89,105.89,0,0,0,126.6,80.22c2.91-27.55-13.53-51.36-18.9-72.15ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
                  </svg>
               </div>
            )}

            <div className="flex flex-col items-center gap-1 mt-2">
              <h3 className="font-bold text-lg leading-none text-white tracking-wide">{data ? data.discord_user.username : "Discord"}</h3>
              <div className="flex items-center gap-2 mt-1 px-2.5 py-1 bg-black/40 rounded-full border border-white/5">
                <div className={`w-2.5 h-2.5 rounded-full ${statusColor} animate-pulse shadow-[0_0_8px_currentColor]`} />
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">
                  {data ? STATUS_LABELS[discordStatus] : status === "connecting" ? "Connecting..." : "Offline"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-end mt-2">
            {!data ? (
              <div className="w-full flex items-center justify-center gap-3 text-white/70 py-4">
                <div className="w-4 h-4 border-2 border-white/40 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-semibold">
                  {error || "Loading Discord status..."}
                </p>
              </div>
            ) : gameActivity ? (
              <div className="w-full bg-black/40 p-3 rounded-lg border border-white/10">
                <div className="flex items-center gap-3">
                  {getActivityImage(gameActivity) && (
                     <img src={getActivityImage(gameActivity)!} className="w-12 h-12 rounded-lg bg-black/20 object-cover shrink-0 shadow-md" alt="Game" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-1">Playing</p>
                    <p className="text-sm text-white font-bold truncate leading-tight">{gameActivity.name}</p>
                    {gameActivity.timestamps?.start && (
                      <p className="text-[11px] text-white/60 font-mono mt-1 w-fit bg-black/50 px-1.5 py-0.5 rounded">
                        {formatTime(now - gameActivity.timestamps.start)} elapsed
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : codingActivity ? (
              <div className="w-full bg-black/40 p-3 rounded-lg border border-white/10">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
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
                      <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest leading-none mb-1">Working on</p>
                      <p className="text-sm text-white font-bold truncate">{codingActivity.name}</p>
                    </div>
                  </div>
                  <div className="bg-black/40 p-2 rounded text-xs border border-white/5 space-y-1">
                     <p className="text-white font-medium truncate">{codingActivity.details || "No file details"}</p>
                     {codingActivity.state && <p className="text-white/70 truncate">{codingActivity.state}</p>}
                  </div>
                </div>
              </div>
            ) : spotify ? (
              <div className="w-full bg-black/40 p-3 rounded-lg border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  {spotify.album_art_url ? (
                    <img src={spotify.album_art_url} className="w-12 h-12 rounded-md shrink-0 shadow-md" alt="Album" />
                  ) : (
                    <div className="w-12 h-12 rounded-md bg-white/10 shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold text-green-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                       <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.56.387-.852.204-2.336-1.425-5.275-1.745-8.736-.955-.332.076-.65-.13-.726-.46-.076-.333.13-.65.46-.726 3.79-.865 7.03-.497 9.646 1.096.294.18.388.558.208.841zm1.218-2.618c-.226.368-.707.49-1.07.265-2.66-1.633-6.726-2.115-9.84-1.157-.406.124-.833-.105-.957-.51-.124-.407.106-.834.51-.958 3.553-1.09 8.046-.554 11.094 1.317.362.224.484.707.263 1.043zm.144-2.735C14.73 9.176 8.544 8.947 4.98 10.03c-.482.146-.99-.126-1.136-.607-.146-.48.126-.988.608-1.134 4.098-1.246 10.92-1.02 14.773 1.268.435.258.58.825.32 1.26-.26.435-.826.58-1.26.32x"/></svg>
                       Spotify
                    </p>
                    <p className="text-sm text-white font-bold truncate">{spotify.song}</p>
                    <p className="text-[11px] text-white/70 truncate">{spotify.artist}</p>
                  </div>
                </div>
                {spotify.timestamps && (
                  <div className="w-full space-y-1.5">
                    <div className="h-1.5 w-full bg-black/60 rounded-full overflow-hidden border border-white/5">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all duration-1000 ease-linear shadow-[0_0_8px_rgba(34,197,94,0.6)]"
                        style={{ width: `${calculateProgress(spotify.timestamps.start, spotify.timestamps.end)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-white/40 font-mono font-medium px-0.5">
                      <span>{formatTime(now - spotify.timestamps.start)}</span>
                      <span>{formatTime(spotify.timestamps.end - spotify.timestamps.start)}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full flex items-center justify-center gap-2 text-white/60 py-4 bg-black/20 rounded-lg border border-white/5">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
                <p className="text-xs italic truncate px-2">&quot;{customStatus?.state || "Currently chilling..."}&quot;</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
