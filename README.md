# Thinking GIFs Extension for Pi Agent

This pi agent extension displays **actual GIF images** (rendered as colored ANSI blocks) while the agent is thinking! It randomly selects from your `gifs/` directory and shows the first frame as beautiful terminal pixel art.

## Features

- 🎨 **Actual GIF rendering** - Shows real images as colored ANSI blocks using chafa
- 🦄 **Random selection** - Picks a random GIF from your collection each time
- ✨ **Universal compatibility** - Works in pi's interactive TUI mode
- 🔄 **Automatic display** - Shows when agent starts thinking, hides when done
- ⚡ **Lifecycle integration** - Hooks into agent events seamlessly
- 🎭 **Beautiful output** - Colored pixel art representation of your GIF's first frame
- 💭 **Animated indicator** - "Thinking..." message pulses while agent is processing

## Location

The extension is located in `extensions/thinking-gifs/index.ts` in this repository. To load it into a running pi instance without auto-loading, use the `-e` flag with the full path:

```bash
# From this repository directory
pi -e ./extensions/thinking-gifs/index.ts

# Or with full path
pi -e /Users/dara/dev/dara-pi-agent-theme/extensions/thinking-gifs/index.ts
```

## Usage

### Automatic Mode (Recommended!)

The extension automatically takes over your terminal with an animated GIF when the agent starts thinking:

1. Start pi with the extension loaded (using `-e` flag as shown above)
2. Send a prompt to the agent
3. **Watch the animated unicorn GIF take over your screen!** 🦄
4. The animation **automatically stops** when the agent finishes thinking or starts executing tools
5. You're returned to the pi interface with the response

### Manual Testing

You can also test the GIF display manually:

```bash
# Inside pi, type:
/thinking-gif

# The GIF will play for 30 seconds, or press Ctrl+C to stop early
```

## Adding More GIFs

Simply add any `.gif` files to the `gifs/` directory. The extension will randomly select one each time the agent thinks.

Current GIFs:
- `The_unicorn_in_Motion-anim.gif`
- `unicorn-rainbow.gif`

## How It Works

The extension uses:
- **chafa** to render GIF frames as ANSI colored blocks
- **Widget system** - Displays the GIF in a widget below the editor
- **message_update** event to detect when the agent begins streaming
- **message_end** event to detect when the agent finishes
- **tool_execution_start** event to hide the GIF when tools are executing

## Technical Details

### Image Rendering

The extension uses chafa to render the first frame of a randomly selected GIF:

```bash
chafa --size=${width}x${height} --stretch --symbols block --color-space rgb --dither none [gif-file]
```

The rendered output is then displayed as a widget below the editor in pi's TUI, with an animated "Thinking..." indicator that updates every 500ms.

This gives us:
- ✅ **Real image rendering** using Unicode half-blocks (▀▄) with ANSI colors
- ✅ **Works in pi's interactive mode** - integrates with the TUI widget system
- ✅ **Colored pixel art** representation of your GIF's first frame
- ✅ **Visual feedback** - Animated "Thinking..." message while processing

## Testing

### Automated Test

Run the test script to verify the extension is properly configured:

```bash
./extensions/thinking-gifs/test.sh
```

This will check:
- ✅ chafa is installed
- ✅ gifs/ directory exists with GIF files
- ✅ Extension file is present
- ✅ chafa can render GIFs

### Manual Test

You can manually test the GIF display inside pi:

```bash
# Start pi with the extension
pi -e ./extensions/thinking-gifs/index.ts

# Inside pi, type:
/thinking-gif

# The GIF will play for 30 seconds, or press Ctrl+C to stop early
```

### Visual Preview

To see what a GIF looks like when rendered, run chafa directly:

```bash
chafa --size=50x15 --stretch --symbols block --color-space rgb --dither none gifs/unicorn-rainbow.gif
```

## Credits

- Built using the [pi coding agent](https://github.com/badlogic/pi-mono) extension system
- GIF rendering via [chafa](https://github.com/hpjansson/chafa)
