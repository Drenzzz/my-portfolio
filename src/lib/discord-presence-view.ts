import {
  DEFAULT_SPOTIFY_SONG,
  getActivityImage,
  getGameFallbackImage,
  isCodingActivity,
} from "@/lib/discord-presence"
import type { Activity, LanyardData, SpotifyData } from "@/types"

const getSpotifyActivity = (activities: Activity[]) => {
  return activities.find(
    (activity) => activity.type === 2 && activity.name === "Spotify"
  )
}

const toSpotifyData = (activity: Activity | undefined): SpotifyData | null => {
  if (!activity) {
    return null
  }

  return {
    track_id: activity.sync_id || "",
    timestamps:
      activity.timestamps?.start && activity.timestamps?.end
        ? {
            start: activity.timestamps.start,
            end: activity.timestamps.end,
          }
        : null,
    song: activity.details || DEFAULT_SPOTIFY_SONG,
    artist: activity.state || "",
    album_art_url: activity.assets?.large_image
      ? activity.assets.large_image.startsWith("spotify:")
        ? `https://i.scdn.co/image/${activity.assets.large_image.replace("spotify:", "")}`
        : getActivityImage(activity) || ""
      : "",
    album: activity.assets?.large_text || "",
  }
}

const getAvatarUrl = (presence: LanyardData | null) => {
  if (!presence?.discord_user.avatar) {
    return null
  }

  return `https://cdn.discordapp.com/avatars/${presence.discord_user.id}/${presence.discord_user.avatar}.png?size=512`
}

export const deriveDiscordPresenceView = (presence: LanyardData | null) => {
  const activities = presence?.activities ?? []

  const codingActivity = activities.find((activity) =>
    isCodingActivity(activity)
  )
  const spotifyActivity = getSpotifyActivity(activities)
  const spotify = presence?.spotify || toSpotifyData(spotifyActivity)
  const gameActivity = activities.find(
    (activity) =>
      activity.type === 0 &&
      !codingActivity &&
      activity.name !== "Custom Status" &&
      activity.name !== "Spotify"
  )
  const customStatus = activities.find((activity) => activity.type === 4)

  return {
    discordStatus: presence?.discord_status || "offline",
    avatarUrl: getAvatarUrl(presence),
    codingActivity,
    spotify,
    gameActivity,
    customStatus,
    gameImage: gameActivity
      ? getActivityImage(gameActivity) ||
        getGameFallbackImage(gameActivity.name)
      : null,
  }
}
