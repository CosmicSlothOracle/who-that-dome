export type PlaybackMode = "connect" | "deeplink";

export type Decade = "90" | "00" | "10";

export type Pool = {
  id: string;
  name: string;
  description: string;
  edition?: string;
  decade?: Decade;
};

export type Song = {
  id: string;
  poolId: string;
  spotifyTrackId: string;
  title: string;
  artist: string;
  album: string;
  year: number;
  coverUrl?: string;
  edition?: string;
  decade?: Decade;
  city?: string;
  explicit?: boolean;
  yearNote?: string;
  artworkFile?: string;
};

export type Catalog = {
  pools: Pool[];
  songs: Song[];
};

export type GuessCategory = "artist" | "title" | "verse" | "album" | "year" | "city";

export type Player = {
  id: string;
  name: string;
  score: number;
};

export type GameState = {
  version: 2;
  players: Player[];
  poolIds: string[];
  currentCardId: string | null;
  usedCardIds: string[];
  revealed: Record<GuessCategory, boolean>;
  awardedTo: Partial<Record<GuessCategory, string>>;
  firstVoicePlayerId: string | null;
  yearExact: boolean;
  createdAt: string;
};

export type SpotifyDevice = {
  id: string | null;
  name: string;
  type: string;
  is_active: boolean;
  is_restricted: boolean;
};

export type PlaybackResult =
  | { ok: true; mode: PlaybackMode }
  | { ok: false; code: string; message: string };

export type CardMappingRow = {
  card_id: string;
  edition: string;
  decade: string;
  artist: string;
  title: string;
  album: string;
  year: number;
  year_note: string;
  city: string;
  explicit: boolean;
  spotify_track_id: string;
  qr_content: string;
  qr_svg: string;
  qr_png: string;
  artwork_file: string;
};
