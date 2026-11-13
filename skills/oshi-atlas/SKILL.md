---
name: oshi-atlas
description: Use the Oshi Atlas tools to answer questions about VTubers, singers, songs, covers, anime and game titles, characters, and figures or other merchandise — who sang what, where to listen, which figures exist for a character, and what they cost. Use it whenever the user names an artist, song, character, title or figure, or pastes a YouTube link, and wants connections, listening links or merchandise.
---

# Oshi Atlas

Oshi Atlas is one catalog that connects songs, artists, titles (anime, games and other IP), characters and figures. Its tools come only from the `oshi-atlas` MCP server at `https://figure-curator.com/mcp`. Use `resolve_identity` and `get_relationships`; do not call the withdrawn `resolve_entity` or `get_related` tools. The catalog is curated, not exhaustive: a missing result means the catalog has no such connection yet, never that none exists.

## Find the entity first

Start with `resolve_identity`. It takes a name, a YouTube link or an `entityId`, and returns either one resolved entity or several candidates.

- With several candidates, show them and let the user choose. Do not pick one silently.
- Narrow with `kinds` (for example `["artist"]` or `["work"]`) when the user's words make the kind clear.
- Keep the returned `entityId` (such as `artist:…`, `work:…`, `character:…`, `figure:…`). Use it with `get_relationships`; the listening and figure tools take the IDs described below.

## Follow connections one step at a time

Call `get_relationships` with an `entityId`, optional `target` (`music`, `figures`, `all`) and optional `limit` (1–40) to see what is directly connected: songs and artists, or titles, characters and figures. It returns a bounded preview, not the whole graph. Do not pass pagination cursors or relation-type filters.

- Move outward one hop per call, from the result you actually need, instead of expanding everything.
- When `truncated` is true, say the list is partial and give the catalog URL for the full list.
- A shared performer is not evidence of song-specific merchandise or costumes. Only state connections the tool returned.

## Listening links

Call `get_listening_links` with the ID after `work:` and `version` set to `original` or `cover`.

- For a cover, pass `coverArtistId`. Never substitute the original or another singer's cover.
- `preferredPlatform` is `youtube_music` (default), `youtube` or `spotify`. If `selected` is `null`, the catalog has no link for that platform; say so rather than switching platforms.
- YouTube Music links are derived from YouTube video IDs and are not checked for playback.

## Figures and prices

Use `search_figures` for a character, title, brand or product name, following `nextCursor` with the same query. Use `get_figure` with the ID after `figure:` (or a product ID from search) for release details and offers.

Prices and stock are observations with timestamps. Report the time each one was observed, and do not present an old observation as current.

## Suggest a missing artist (asks the user first)

When `resolve_identity` finds no artist the user asked about, you may offer to suggest it with `suggest_discovery`. This explicitly submits an artist for investigation. Search tools can also record anonymous demand signals for discovery; neither action directly changes the public catalog.

1. Tell the user exactly what would be sent: the artist's name and, if they give one, the official YouTube channel address (`/channel/UC…` or `/@handle`). Nothing else — no conversation text and no personal details.
2. Call `suggest_discovery` only after the user agrees.
3. Report the `suggestionId`. A suggestion is reviewed by a person and may be declined; it never changes the catalog immediately.

Use `get_discovery_status` with that ID when the user asks later. Lookups run a few times a day and review is manual, so a status can stay the same for days.

## Cite the catalog

Never send conversation text or personal details as search input.

Link the catalog pages the tools return for every artist, song, character or figure you mention, so the user can check the source.
