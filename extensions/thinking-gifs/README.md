# Thinking GIFs Extension

A pi coding agent extension that displays beautiful GIF visualizations while the agent is thinking.

## Quick Start

```bash
# From the repository root
pi -e ./extensions/thinking-gifs/index.ts
```

## Features

- 🎨 Renders GIF images as colored ANSI pixel art using chafa
- 🦄 Randomly selects from your GIF collection  
- 💭 **Automatically shows ANIMATED GIF when agent starts thinking** (takes over terminal!)
- 🔄 **Automatically stops and returns to pi when agent finishes** or starts executing tools
- ⚡ Full-screen animation experience - see the magic while waiting!
- 🎬 `/thinking-gif` command for manual testing

## Requirements

- **chafa** - Terminal graphics library
  ```bash
  brew install chafa
  ```

- GIF files in `gifs/` directory (relative to where you run pi)

## Usage

### Automatic Display (The Magic! ✨)

The extension **automatically takes over your terminal** with a fully animated GIF when the agent starts thinking:

1. Start pi with the extension loaded
2. Ask the agent a question
3. **Watch your terminal transform into an animated unicorn show!** 🦄
4. The animation **automatically stops** and returns to pi when the agent finishes
5. See the response in the normal pi interface

**This is the main feature!** You get full-screen animated feedback automatically while the agent works.

### Manual Testing Command

Test the animation manually:

```bash
/thinking-gif
```

This command shows the same animated GIF but with a 30-second timeout. Useful for:
- Testing your GIF collection
- Seeing what the automatic mode will look like
- Taking a unicorn break! 🦄

## How It Works

### Automatic Display (Widget Mode)

The extension hooks into pi's lifecycle events:

- `message_update` - Detects when agent starts thinking → shows GIF
- `message_end` - Detects when agent finishes → hides GIF
- `tool_execution_start` - Detects when tools run → hides GIF

The GIF is rendered using chafa (first frame only) and displayed as a widget below the editor, with an animated "Thinking..." message that updates every 500ms.

### Manual Display (Interactive Mode)

The `/thinking-gif` command uses the `tui.stop()` / `tui.start()` pattern:

1. Stops the pi TUI to release the terminal
2. Runs `chafa --animate` with `stdio: 'inherit'` to hand full control to chafa
3. chafa displays the animated GIF directly in your terminal
4. When interrupted (Ctrl+C), control returns to pi
5. TUI restarts and resumes normal operation

This is the same pattern used by the `interactive-shell.ts` extension for running vim, htop, etc.

## Adding More GIFs

Simply place any `.gif` files in the `gifs/` directory. The extension will randomly select one each time.

## Architecture

```typescript
// Key components:
- getRandomGif()      // Selects a random GIF from gifs/
- renderGifFrame()    // Uses chafa to render the first frame
- startGif()          // Displays GIF as a widget
- stopGif()           // Clears the widget
```

## File Structure

```
extensions/thinking-gifs/
├── index.ts         # Main extension code
├── package.json     # Extension metadata
├── README.md        # This file
└── test.sh          # Test script
```

## Development

Test the extension:

```bash
./extensions/thinking-gifs/test.sh
```

## Credits

Built using:
- [pi coding agent](https://github.com/badlogic/pi-mono) extension system
- [chafa](https://github.com/hpjansson/chafa) for terminal graphics
