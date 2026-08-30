import { esc } from "./utils.js";

export const EMBED_PROVIDERS = [
  {
    id: "megavid",
    name: "Megavid",
    makeUrl(episode, anilistId, lang = "sub", malId = null) {
      const idType = malId ? "mal" : "ani";
      const id = malId || anilistId;
      return `https://megavid.buzz/${idType}/${id}/${episode}/${lang}?color=%23e63946&autoplay=true`;
    },
  },
  {
    id: "anixo",
    name: "AniXo",
    makeUrl(episode, anilistId, lang = "sub") {
      return `https://anixo.buzz/embed/ani/${anilistId}/${episode}/${lang}?color=%23e63946`;
    },
  },
];

export function isAnixoUrl(url) {
  return /^https:\/\/anixo\.buzz\//.test(url);
}

export function classifyPlayerMessage(d) {
  if (!d || typeof d !== "object") return null;
  if (d.type === "watching-log")
    return { provider: "megavid", state: "playing" };
  if (d.channel === "kisskh") {
    if (d.event === "complete") return { provider: "megavid", state: "ended" };
    if (d.event === "time") return { provider: "megavid", state: "playing" };
    if (
      d.event === "error" ||
      d.event === "unavailable" ||
      d.event === "no_source"
    )
      return { provider: "megavid", state: "error", message: d.message };
    return { provider: "megavid", state: "ignored" };
  }
  if (typeof d.type === "string" && d.type.indexOf("aniko:") === 0) {
    if (d.type === "aniko:ended")
      return { provider: "anixo", state: "ended" };
    if (d.type === "aniko:ready") {
      if (d.streams > 0) return { provider: "anixo", state: "playing" };
      return {
        provider: "anixo",
        state: "error",
        message: "No video sources available.",
      };
    }
    if (
      d.type === "aniko:play" ||
      d.type === "aniko:pause" ||
      d.type === "aniko:timeupdate"
    )
      return { provider: "anixo", state: "playing" };
    if (d.type.indexOf("aniko:error") === 0)
      return { provider: "anixo", state: "error", message: d.message };
    return { provider: "anixo", state: "ignored" };
  }
  return null;
}
