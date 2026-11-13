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

The installed plugin has no hooks or local executable tools. The development
packaging script below only builds an archive for upload.

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

The portable `mcp.json` declares the endpoint. For a private ChatGPT installation,
also register that endpoint as a custom MCP server and bind its actual App ID to
the package. Uploading the portable ZIP alone does not establish that registered
connection. Merely seeing the plugin's name in chat is not proof that its tools
are available.

1. In [ChatGPT Plugins](https://chatgpt.com/plugins), choose **+ → Add custom MCP server**.
2. Name the connection **Oshi Atlas MCP**, set the server URL to
   `https://figure-curator.com/mcp/atlas`, and select **No authentication**.
3. Review the warning and create the connection. Confirm that it exposes all
   seven tools listed above, especially `suggest_discovery` and `get_discovery_status`.
4. Obtain the connection's verified `asdk_app_…` ID from its generated `.app.json`.
   The `plugin_asdk_app_…` URL identifies the connection's plugin; it is not the App ID.
5. Build an account package with Node.js 18+ and `tar` (available on current
   Windows, macOS and Linux):

   ```sh
   node scripts/package-chatgpt.mjs --app-id YOUR_VERIFIED_ATLAS_APP_ID
   ```

   The script writes `dist/oshi-atlas-<version>-account.tar.gz`. It includes the shared
   skill and icon, and adds `.app.json` plus `extensions.com.openai.apps` only to
   that ZIP. Update the existing Oshi Atlas plugin with it; keep its identity and
   private audience. Do not bind the legacy Figure Curator `/mcp` app.
6. Enable the updated plugin and test it in a new chat. Check the tool-call details:
   `resolve_identity` should answer a catalog query, and `get_discovery_status`
   should read a real suggestion ID. If the tool is absent, the connection test
   has not passed; an SDK/HTTP response is not a substitute for a chat tool call.

After changing the server's tools, use **Refresh** on the **Oshi Atlas MCP**
connection and confirm the tool list before testing again. Keep account-specific
App IDs out of the portable source. For a portable archive, run the packaging script
without `--app-id`; public directory submission uses its separate MCP setup flow.

See [OpenAI's package guidance](https://developers.openai.com/plugins/build/plugins)
and [connection testing guide](https://developers.openai.com/plugins/deploy/connect-chatgpt).

Then try: "Find music and related figures for Hoshimachi Suisei."

## Support

Open an issue at <https://github.com/figurecurator/oshi-atlas-plugin/issues> or email contact@rainbowsoft.co.kr.

## License

MIT. See [LICENSE](LICENSE).
