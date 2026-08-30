const ANILIST_URL = "https://graphql.anilist.co";

const MEDIA_FIELDS_SMALL = `
  id
  idMal
  title { romaji english }
  coverImage { extraLarge large }
  format status episodes averageScore
  nextAiringEpisode { airingAt episode }
`;

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

export async function getTrending(page = 1, perPage = 20) {
  return browseAnime(page, perPage, "TRENDING_DESC");
}

export async function getPopular(page = 1, perPage = 20) {
  return browseAnime(page, perPage, "POPULARITY_DESC");
}

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

export async function getAnimeById(id) {
  const q = `query($id:Int){Media(id:$id,type:ANIME){${MEDIA_FIELDS}} Page(perPage:1){airingSchedules(mediaId:$id,notYetAired:false,sort:TIME_DESC){episode}}}`;
  const data = await gql(q, { id: parseInt(id) });
  const media = data.Media;
  const latestAired =
    data.Page && data.Page.airingSchedules && data.Page.airingSchedules[0];
  if (latestAired) media.latestAired = latestAired.episode;
  return media;
}

export async function getTopAiring(page = 1, perPage = 10) {
  const q = `query($page:Int,$perPage:Int){Page(page:$page,perPage:$perPage){media(type:ANIME,status:RELEASING,sort:POPULARITY_DESC){id title{romaji english} coverImage{extraLarge large} bannerImage description genres format status episodes averageScore nextAiringEpisode{airingAt episode}}}}`;
  return (await gql(q, { page, perPage })).Page.media;
}

export async function fetchSuggestions(query) {
  const q = `query($search:String){Page(page:1,perPage:6){media(type:ANIME,search:$search,sort:SEARCH_MATCH){id title{romaji english}coverImage{large}format averageScore}}}`;
  const data = await gql(q, { search: query });
  return data.Page.media;
}
