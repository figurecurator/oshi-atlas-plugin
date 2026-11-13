# Oshi Atlas

![Oshi Atlas](assets/icon.png)

Oshi Atlas lets Claude and ChatGPT explore one catalog that connects songs, artists, anime and game titles, characters and figures. Ask who sang a song, which covers exist and where to listen, which figures exist for a character, or what a figure currently costs, and the assistant answers from the catalog with links to its pages.

The catalog behind it is shared by [Music Curator](https://music-curator.app) and [Figure Curator](https://figure-curator.com), both run by RainbowSoft.

## What the plugin contains

This repository is one plugin packaged for two hosts. Both point at the same server and share the skill, README, license and icon.

| Host | Manifest | MCP config |
| --- | --- | --- |
| Claude (Claude Code, claude.ai, Cowork) | `.claude-plugin/plugin.json` | `.mcp.json` |
| ChatGPT and Codex | `plugin.json` | `mcp.json` |

- **An MCP connector** to the remote server `https://figure-curator.com/mcp/atlas`. It needs no account or API key.
- **A skill** (`oshi-atlas`) that tells the assistant how to use the tools well: resolve a name first, follow connections one step at a time, keep covers distinct from originals, report when prices were observed, and ask before sending a suggestion.

The plugin has no hooks, no scripts and nothing that runs on your machine.

## Tools

| Tool | What it does | Sends data to keep? |
| --- | --- | --- |
| `resolve_identity` | Find an artist, song, title, character or figure from a name, YouTube link or ID | No |
| `get_relationships` | List what is directly connected to an entity | No |
| `get_listening_links` | Links to an original recording or a cover on YouTube Music, YouTube or Spotify | No |
| `search_figures` | Search figures by character, title, brand or product name | No |
| `get_figure` | Release details and observed offers for one figure | No |
| `suggest_discovery` | Suggest an artist the catalog lacks, for review | Yes, see below |
| `get_discovery_status` | Check where a suggestion stands | No |

## Data and privacy

Every tool call goes to `figure-curator.com` over HTTPS. Read-only lookups send only the search text or ID that the assistant passes in.

`suggest_discovery` is the only tool that stores anything. It sends an artist's name (up to 80 characters) and, optionally, the address of that artist's official YouTube channel. Oshi Atlas stores the suggestion without any information about who sent it, and a person reviews it before anything is added to the catalog. The skill tells the assistant to explain what will be sent and to wait for your agreement before calling it.

See the [privacy policy](https://figure-curator.com/privacy) and [terms](https://figure-curator.com/terms).

## Install

### Claude Code

```
/plugin marketplace add figurecurator/oshi-atlas-plugin
/plugin install oshi-atlas@rainbowsoft
```

### ChatGPT and Codex

Add Oshi Atlas from the ChatGPT plugin directory once it is listed. The portable `plugin.json` and `mcp.json` at the repository root are the ChatGPT package; they point at the same endpoint with no authentication.

Then try: "Find music and related figures for Hoshimachi Suisei."

## Support

Open an issue at <https://github.com/figurecurator/oshi-atlas-plugin/issues> or email contact@rainbowsoft.co.kr.

## License

MIT. See [LICENSE](LICENSE).
