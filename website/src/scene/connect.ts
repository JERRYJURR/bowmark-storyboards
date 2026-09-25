/**
 * F4 — "Works where you already are." Transcribed from v5's `dest()` and
 * `renderVals()` (the `assistants` / `codeTools` lists and the Windsurf "soon"
 * tag). v5 stores each destination's steps as one newline-separated string;
 * here the intro line and the numbered steps are split so they can be marked
 * up as a paragraph and an ordered list. Wording is unchanged.
 *
 * These are the prototype's commands and addresses. Nothing on the page runs
 * them — they are only shown and copied.
 */

export type ConnectGroup = 'Assistants' | 'In your code';

/** Which glyph to draw beside the destination. Brand marks only where the
 *  export ships one (see `TARGET_LOGO`); everything else is a generic glyph. */
export type ConnectGlyph =
  | 'Claude'
  | 'ChatGPT'
  | 'Codex'
  | 'Cursor'
  | 'editor'
  | 'mcp'
  | 'terminal'
  | 'package'
  | 'http';

/** How the command field is labelled and whether it gets a shell prompt. */
export type CommandKind = 'address' | 'shell' | 'config' | 'request';

export interface Destination {
  name: string;
  group: ConnectGroup;
  glyph: ConnectGlyph;
  soon?: boolean;
  title: string;
  intro?: string;
  steps?: string[];
  command: string;
  kind: CommandKind;
}

export const COMMAND_LABEL: Record<CommandKind, string> = {
  address: 'Server address',
  shell: 'Terminal',
  config: 'Config',
  request: 'Endpoint',
};

export const DESTINATIONS: Destination[] = [
  {
    name: 'ChatGPT',
    group: 'Assistants',
    glyph: 'ChatGPT',
    title: 'Connect to ChatGPT',
    steps: ['Open Settings → Connectors', 'Choose “Add MCP server”', 'Paste the address below and save'],
    command: 'mcp.bowmark.ai',
    kind: 'address',
  },
  {
    name: 'Claude',
    group: 'Assistants',
    glyph: 'Claude',
    title: 'Connect to Claude',
    intro: 'Works on desktop and web.',
    steps: ['Settings → Connectors', '“Add custom connector”', 'Paste the address below'],
    command: 'mcp.bowmark.ai',
    kind: 'address',
  },
  {
    name: 'Claude Code',
    group: 'Assistants',
    glyph: 'Claude',
    title: 'Connect to Claude Code',
    intro: 'Run this once in any terminal:',
    command: 'claude mcp add bowmark npx bowmark@latest',
    kind: 'shell',
  },
  {
    name: 'Codex',
    group: 'Assistants',
    glyph: 'Codex',
    title: 'Connect to Codex',
    intro: 'Add to your Codex config:',
    command: 'mcp_servers.bowmark = { command: "npx bowmark@latest" }',
    kind: 'config',
  },
  {
    name: 'Copilot',
    group: 'Assistants',
    glyph: 'editor',
    title: 'Connect to GitHub Copilot',
    intro: 'In VS Code:',
    steps: ['Copilot → MCP servers', 'Add server with this command'],
    command: 'npx bowmark@latest',
    kind: 'shell',
  },
  {
    name: 'Cursor',
    group: 'Assistants',
    glyph: 'Cursor',
    title: 'Connect to Cursor',
    steps: ['Settings → MCP', '“New server”', 'Use this command'],
    command: 'npx bowmark@latest',
    kind: 'shell',
  },
  {
    name: 'Windsurf',
    group: 'Assistants',
    glyph: 'editor',
    soon: true,
    title: 'Windsurf — coming soon',
    intro: 'Pending review on their side. Any MCP-speaking editor works today via the generic path below.',
    command: 'npx bowmark@latest',
    kind: 'shell',
  },
  {
    name: 'anything MCP…',
    group: 'Assistants',
    glyph: 'mcp',
    title: 'Anything that speaks MCP',
    intro: 'Point any MCP client at our server address, or run the local bridge:',
    command: 'mcp.bowmark.ai',
    kind: 'address',
  },
  {
    name: 'npx bowmark',
    group: 'In your code',
    glyph: 'terminal',
    title: 'Run it with npx',
    intro: 'One command, no install, no account:',
    command: 'npx bowmark connect',
    kind: 'shell',
  },
  {
    name: 'npm install bowmark',
    group: 'In your code',
    glyph: 'package',
    title: 'Install from npm',
    intro: 'Add it to your project like any other library:',
    command: 'npm install bowmark',
    kind: 'shell',
  },
  {
    name: 'pip install bowmark',
    group: 'In your code',
    glyph: 'package',
    title: 'Install from pip',
    intro: 'Same library, same capabilities, in Python:',
    command: 'pip install bowmark',
    kind: 'shell',
  },
  {
    name: 'raw HTTP',
    group: 'In your code',
    glyph: 'http',
    title: 'Raw HTTP',
    intro: 'Everything is one POST away — typed JSON in, typed JSON out:',
    command: 'POST https://api.bowmark.ai/v1/call',
    kind: 'request',
  },
];

export const CONNECT_GROUPS: ConnectGroup[] = ['Assistants', 'In your code'];

/** Paper 8JR titles the section "Install for free" (was v5's "Works where
 *  you already are."). */
export const CONNECT_COPY = {
  title: 'Install for free',
  sub: 'No account needed.',
  footPrefix: 'No account needed. Deeper docs on',
  footLink: 'GitHub',
} as const;
