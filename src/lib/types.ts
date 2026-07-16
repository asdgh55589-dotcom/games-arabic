// Shared API response types — single source of truth for backend → frontend contract.

export interface Author {
  id: string
  username: string
  email: string
  avatarUrl: string | null
  bio: string | null
  youtubeUrl: string | null
  twitterUrl: string | null
  discordUrl: string | null
  role: string
  joinedAt: string
}

export interface GameSummary {
  id: string
  slug: string
  name: string
  tagline: string
  thumbnailUrl: string
  bannerUrl: string
  logoUrl: string | null
  category: string
  platform: string  // PC | PS1 | PS2 | PS3 | PS4
  releaseYear: number
  modCount: number
  totalDownloads: number
  totalEndorsements: number
  featured: boolean
  createdAt: string
  updatedAt: string
}

export interface GameDetail extends GameSummary {
  description: string
  categories: Category[]
}

export interface Category {
  id: string
  name: string
  slug: string
}

export interface ModSummary {
  id: string
  slug: string
  name: string
  summary: string
  thumbnailUrl: string
  imageUrl: string
  galleryUrls: string
  version: string
  fileSize: string
  fileFormat: string
  downloads: number
  endorsements: number
  views: number
  comments: number
  rating: number
  ratingCount: number
  tags: string
  series: string  // اسم السلسلة (مثل God of War)
  translationType: string  // official | unofficial
  compatibility: string  // التوافق
  translationTeam: string  // فريق التعريب
  isFeatured: boolean
  isTrending: boolean
  isLatest: boolean
  releaseDate: string
  updatedAt: string
  createdAt: string
  author: Author
  game: { name: string; slug: string; platform: string }
  category: { name: string; slug: string } | null
}

export interface ModDetail extends ModSummary {
  description: string
  author: Author
  game: GameSummary
  category: Category | null
}

export interface PaginatedMods {
  mods: ModSummary[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface SearchResponse {
  mods: ModSummary[]
  games: GameSummary[]
}

export interface SiteStats {
  games: number
  mods: number
  downloads: number
  endorsements: number
  users: number
}

export interface SeriesSummary {
  name: string
  count: number
  downloads: number
  endorsements: number
  thumbnailUrl: string
}

export interface HomeData {
  stats: SiteStats
  featuredGames: GameSummary[]
  trendingMods: ModSummary[]
  latestMods: ModSummary[]
  topEndorsed: ModSummary[]
  topSeries: SeriesSummary[]
  modsByPlatform: Record<string, ModSummary[]>
  tickerMods: ModSummary[]
}

export interface EndorseResponse {
  endorsed: boolean
  endorsements: number
}

export interface DownloadResponse {
  downloads: number
}

export interface AuthorModsResponse {
  author: Author
  mods: ModSummary[]
}

export interface ApiError {
  error: string
}
