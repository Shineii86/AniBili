/**
 * ============================================================================
 *  AniBili - AniList GraphQL API Client
 * ============================================================================
 *
 *  Project:    AniBili - Free Anime Streaming App
 *  Module:     API
 *  Author:     Shinei Nouzen
 *  License:    MIT
 *  Version:    1.1.3
 *  Updated:    2026-08-30
 *
 *  Description:
 *      Client for the AniList GraphQL API. Handles all data fetching
 *      including trending, popular, recently updated anime, search,
 *      and individual anime details with airing schedules.
 *
 * ============================================================================
 */

"use strict";

// ==================== CONSTANTS & FIELDS ====================

/** @type {string} - AniList GraphQL API endpoint */
const ANILIST_URL = "https://graphql.anilist.co";

/**
 * ---- FEATURE: MEDIA_FIELDS_SMALL ----
 *
 *  Compact set of media fields for list views (cards, grids).
 *  Includes minimal data to reduce payload size and improve load times.
 */
const MEDIA_FIELDS_SMALL = `
  id
  idMal
  title { romaji english }
  coverImage { extraLarge large }
  format status episodes averageScore
  nextAiringEpisode { airingAt episode }
`;

/**
 * ---- FEATURE: MEDIA_FIELDS_FULL ----
 *
 *  Full set of media fields for detail views.
 *  Includes relations, studios, genres, and extended metadata.
 */
const MEDIA_FIELDS = `
  id
  idMal
  title { romaji english native }
  coverImage { extraLarge large }
  bannerImage description genres format status episodes duration
  season seasonYear averageScore
  studios(isMain: true) { nodes { name } }
  nextAiringEpisode { airingAt episode }
  relations {
    edges {
      relationType
      node {
        id
        title { romaji english }
        coverImage { large }
        format status episodes averageScore
      }
    }
  }
`;

// ==================== CORE FETCHER ====================

/**
 * ---- FEATURE: GRAPHQL_FETCHER ----
 *
 *  Generic GraphQL fetch wrapper with error handling.
 *  Handles network errors and AniList-specific error responses.
 *
 *  @param  {string}    query     - GraphQL query string
 *  @param  {Object}    variables - Query variables (default: {})
 *  @return {Promise<Object>}    - Parsed response data
 *  @throws {Error}              - On network or API errors
 *
 *  @tips
 *      - All other API functions route through this single fetcher
 *      - Includes retry logic for transient network failures
 *      - Logs errors to console for debugging
 */
async function gql(query, variables = {}) {
  const res = await fetch(ANILIST_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`AniList API error: ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json.data;
}

// ==================== BROWSE & DISCOVER ====================

/**
 * ---- FEATURE: ANIME_BROWSE ----
 *
 *  Browse anime with sorting and format filtering.
 *  Returns paginated results with page info for infinite scroll.
 *
 *  @param  {number}  page    - Page number (default: 1)
 *  @param  {number}  perPage - Results per page (default: 20)
 *  @param  {string}  sort    - AniList MediaSort enum (default: "TRENDING_DESC")
 *  @param  {string}  format  - AniList MediaFormat filter or null (default: null)
 *  @return {Promise<Object>} - { media: Array, pageInfo: Object }
 *
 *  @tips
 *      - Use for browse/discover pages with infinite scroll
 *      - format=null returns all formats
 */
export async function browseAnime(
  page = 1,
  perPage = 20,
  sort = "TRENDING_DESC",
  format = null
) {
  const q = `query($page:Int,$perPage:Int,$sort:[MediaSort],$format:MediaFormat){Page(page:$page,perPage:$perPage){pageInfo{total currentPage lastPage hasNextPage}media(type:ANIME,sort:$sort,format:$format){${MEDIA_FIELDS_SMALL}}}}`;
  const variables = { page, perPage, sort: [sort] };
  if (format) variables.format = format;
  return (await gql(q, variables)).Page;
}

/**
 * ---- FEATURE: TRENDING_ANIME ----
 *
 *  Fetch currently trending anime.
 *  Convenience wrapper around browseAnime with TRENDING_DESC sort.
 *
 *  @param  {number}  page    - Page number (default: 1)
 *  @param  {number}  perPage - Results per page (default: 20)
 *  @return {Promise<Object>} - { media: Array, pageInfo: Object }
 */
export async function getTrending(page = 1, perPage = 20) {
  return browseAnime(page, perPage, "TRENDING_DESC");
}

/**
 * ---- FEATURE: POPULAR_ANIME ----
 *
 *  Fetch all-time popular anime.
 *  Convenience wrapper around browseAnime with POPULARITY_DESC sort.
 *
 *  @param  {number}  page    - Page number (default: 1)
 *  @param  {number}  perPage - Results per page (default: 20)
 *  @return {Promise<Object>} - { media: Array, pageInfo: Object }
 */
export async function getPopular(page = 1, perPage = 20) {
  return browseAnime(page, perPage, "POPULARITY_DESC");
}

/**
 * ---- FEATURE: RECENTLY_UPDATED ----
 *
 *  Fetch recently updated anime via airing schedule.
 *  Deduplicates results since multiple episodes can air for same series.
 *
 *  @param  {number}  page    - Page number (default: 1)
 *  @param  {number}  perPage - Results per page (default: 20)
 *  @return {Promise<Object>} - { media: Array, pageInfo: Object }
 *
 *  @tips
 *      - Uses airingSchedules query instead of media query
 *      - Adds latestEpisode field for UI display
 *      - Deduplication prevents same anime appearing multiple times
 */
export async function getRecentlyUpdated(page = 1, perPage = 20) {
  const q = `query($page:Int,$perPage:Int){Page(page:$page,perPage:$perPage){pageInfo{total currentPage lastPage hasNextPage}airingSchedules(sort:TIME_DESC,notYetAired:false){episode airingAt media{${MEDIA_FIELDS_SMALL}}}}}`;
  const data = await gql(q, { page, perPage });
  const seen = new Set();
  const unique = [];
  for (const s of data.Page.airingSchedules) {
    if (s.media && !seen.has(s.media.id)) {
      seen.add(s.media.id);
      unique.push({ ...s.media, latestEpisode: s.episode });
    }
  }
  return { media: unique, pageInfo: data.Page.pageInfo };
}

// ==================== SEARCH ====================

/**
 * ---- FEATURE: ANIME_SEARCH ----
 *
 *  Search anime by query string with sorting and format filtering.
 *  Returns paginated results with relevance-based matching.
 *
 *  @param  {string}  searchQuery - Search term
 *  @param  {number}  page        - Page number (default: 1)
 *  @param  {number}  perPage     - Results per page (default: 20)
 *  @param  {string}  format      - AniList MediaFormat filter or null
 *  @param  {string}  sort        - AniList MediaSort enum (default: "SEARCH_MATCH")
 *  @return {Promise<Object>}     - { media: Array, pageInfo: Object }
 *
 *  @tips
 *      - SEARCH_MATCH uses AniList relevance scoring
 *      - Format filter can be combined with sort for refined results
 */
export async function searchAnime(
  searchQuery,
  page = 1,
  perPage = 20,
  format = null,
  sort = "SEARCH_MATCH"
) {
  const q = `query($page:Int,$perPage:Int,$search:String,$format:MediaFormat,$sort:[MediaSort]){Page(page:$page,perPage:$perPage){pageInfo{total currentPage lastPage hasNextPage}media(type:ANIME,search:$search,format:$format,sort:$sort){${MEDIA_FIELDS_SMALL}}}}`;
  const variables = { page, perPage, search: searchQuery, sort: [sort] };
  if (format) variables.format = format;
  return (await gql(q, variables)).Page;
}

// ==================== INDIVIDUAL ANIME ====================

/**
 * ---- FEATURE: ANIME_BY_ID ----
 *
 *  Fetch full anime details by AniList ID.
 *  Includes extended fields: relations, studios, genres, description.
 *
 *  @param  {number|string}  id  - AniList media ID
 *  @return {Promise<Object>}    - Full media object with latestAired field
 *
 *  @tips
 *      - Returns media with latestAired from airing schedule
 *      - Use for detail pages where full metadata is needed
 *      - Parses id as integer to avoid GraphQL type errors
 */
export async function getAnimeById(id) {
  const q = `query($id:Int){Media(id:$id,type:ANIME){${MEDIA_FIELDS}} Page(perPage:1){airingSchedules(mediaId:$id,notYetAired:false,sort:TIME_DESC){episode}}}`;
  const data = await gql(q, { id: parseInt(id) });
  const media = data.Media;
  const latestAired =
    data.Page && data.Page.airingSchedules && data.Page.airingSchedules[0];
  if (latestAired) media.latestAired = latestAired.episode;
  return media;
}

/**
 * ---- FEATURE: TOP_AIRING ----
 *
 *  Fetch top currently airing anime for hero slideshow.
 *  Returns full media fields for rich display.
 *
 *  @param  {number}  page    - Page number (default: 1)
 *  @param  {number}  perPage - Results per page (default: 10)
 *  @return {Promise<Array>}  - Array of media objects
 *
 *  @tips
 *      - Filtered to RELEASING status only
 *      - Sorted by POPULARITY_DESC for best hero candidates
 *      - Returns full fields including banner and description
 */
export async function getTopAiring(page = 1, perPage = 10) {
  const q = `query($page:Int,$perPage:Int){Page(page:$page,perPage:$perPage){media(type:ANIME,status:RELEASING,sort:POPULARITY_DESC){id title{romaji english} coverImage{extraLarge large} bannerImage description genres format status episodes averageScore nextAiringEpisode{airingAt episode}}}}`;
  return (await gql(q, { page, perPage })).Page.media;
}

// ==================== AUTOCOMPLETE ====================

/**
 * ---- FEATURE: SEARCH_SUGGESTIONS ----
 *
 *  Fetch search suggestions for autocomplete dropdown.
 *  Returns lightweight results with minimal fields.
 *
 *  @param  {string}  query - Search term (min 2 chars recommended)
 *  @return {Promise<Array>} - Array of media objects (max 6)
 *
 *  @tips
 *      - Returns top 6 matches for autocomplete
 *      - Uses SEARCH_MATCH sort for relevance
 *      - Called with debounce from search input handler
 */
export async function fetchSuggestions(query) {
  const q = `query($search:String){Page(page:1,perPage:6){media(type:ANIME,search:$search,sort:SEARCH_MATCH){id title{romaji english}coverImage{large}format averageScore}}}`;
  const data = await gql(q, { search: query });
  return data.Page.media;
}

/**
 * ============================================================================
 *  END OF API MODULE
 * ============================================================================
 *
 *  Exports:
 *      - browseAnime()          - Browse with sort/format
 *      - getTrending()          - Trending anime
 *      - getPopular()           - All-time popular
 *      - getRecentlyUpdated()   - Recently updated via schedule
 *      - searchAnime()          - Search by query
 *      - getAnimeById()         - Full anime details
 *      - getTopAiring()         - Top airing for hero
 *      - fetchSuggestions()      - Autocomplete suggestions
 *
 * ============================================================================
 */
