# Terminal Takeover Implementation

## Summary

Implemented full terminal takeover for the `/thinking-gif` command to display **fully animated GIFs** using the pattern from pi's `interactive-shell.ts` extension.

## Changes Made

### 1. Code Changes (`extensions/thinking-gifs/index.ts`)

**Added Import:**
```typescript
import { spawnSync } from "node:child_process";
```

**Replaced `/thinking-gif` Command:**
- **Before:** Used `execAsync()` which captured output to buffer → caused `ERR_CHILD_PROCESS_STDIO_MAXBUFFER` error
- **After:** Uses `spawnSync()` with `stdio: 'inherit'` to hand terminal to chafa process

**New Implementation:**
```typescript
await ctx.ui.custom<void>((tui, _theme, _kb, done) => {
  // 1. Stop TUI to release terminal
  tui.stop();

  // 2. Clear screen and show header
  process.stdout.write("\x1b[2J\x1b[H");
  process.stdout.write("🦄 Thinking GIF - Press Ctrl+C to stop\n\n");

  // 3. Run chafa with full terminal access (ANIMATED!)
  const shell = process.env.SHELL || "/bin/sh";
  const command = `chafa --animate=on --duration=30 --stretch --symbols block --color-space rgb --dither none "${gifPath}"`;
  
  const result = spawnSync(shell, ["-c", command], {
    stdio: "inherit",  // <-- KEY: Hand terminal over to subprocess
    env: process.env,
  });

  // 4. Restart TUI
  tui.start();
  tui.requestRender(true);

  // 5. Signal completion
  done();

  return { render: () => [], invalidate: () => {} };
});
```

### 2. Documentation Updates

**README.md:**
- Updated features to clarify widget vs. interactive modes
- Changed manual command instructions to mention Ctrl+C and full animation
- Added explanation of terminal takeover pattern

**EXAMPLES.md:**
- Updated Example 2 to show animated behavior
- Added explanation of what happens when command runs

**CHANGELOG.md:**
- Added version 1.0.1 with breaking changes
- Documented technical switch from `execAsync()` to `spawnSync()`
- Noted the buffer overflow fix

**IMPLEMENTATION_SUMMARY.md:**
- Distinguished between widget mode and interactive mode
- Added details about both rendering approaches
- Updated limitations section

**package.json:**
- Bumped version to 1.0.1

## Technical Details

### Why This Pattern?

| Method | Output Handling | Terminal Control | Animation Support |
|--------|----------------|------------------|-------------------|
| `exec()` / `execAsync()` | Buffered (1MB limit) | No | ❌ Fails on large output |
| `spawn()` (default) | Buffered streams | No | ❌ Can't see animation |
| **`spawnSync()` + `stdio: 'inherit'`** | **Direct to terminal** | **Yes** | **✅ Full animation** |

### The `stdio: 'inherit'` Option

When you pass `{ stdio: 'inherit' }` to `spawnSync()`:
- Child process gets direct access to parent's stdin/stdout/stderr
- No buffering occurs
- Terminal control sequences work perfectly
- User can interact directly with the process (Ctrl+C, etc.)

### The TUI Stop/Start Pattern

From `interactive-shell.ts` example:

1. **`tui.stop()`** - Stops pi's TUI:
   - Stops listening for keyboard input
   - Restores terminal to raw mode
   - Clears any active UI rendering

2. **Run subprocess** - Full terminal control:
   - Process has complete terminal access
   - Can use ANSI codes, cursor positioning, etc.
   - User interacts directly with process

3. **`tui.start()`** - Resumes pi's TUI:
   - Re-initializes terminal handling
   - Restarts input listeners
   - Renders UI again

4. **`tui.requestRender(true)`** - Forces full redraw

This pattern is used for:
- Text editors (vim, nano, emacs)
- Interactive tools (htop, lazygit)
- Git interactive operations (`git rebase -i`)
- **Animated terminal graphics** (our use case!)

## Behavior Comparison

### Automatic Display (During Thinking)

```
┌─────────────────────────────────────┐
│ [Editor with code...]               │
├─────────────────────────────────────┤
│ 🦄 [Static GIF Frame]               │
│ 🧠 Thinking...                      │
└─────────────────────────────────────┘
```
- Widget below editor
- Static first frame
- Doesn't interrupt workflow

### Manual Command (/thinking-gif)

```
[Screen clears, pi TUI disappears]

🦄 Thinking GIF - Press Ctrl+C to stop

[Full animated GIF playing]
🌈 ✨ 🦄 [ANIMATED!] 🦄 ✨ 🌈

[Ctrl+C pressed]

[Pi TUI returns]
```
- Takes over entire terminal
- Full animation
- Return to pi when done

## Testing

```bash
# Start pi with extension
pi -e ./extensions/thinking-gifs/index.ts

# In pi, run:
/thinking-gif

# You should see:
# 1. Screen clear
# 2. Header message
# 3. ANIMATED unicorn GIF!
# 4. Press Ctrl+C to stop
# 5. Return to pi TUI
```

## References

- **Source Pattern:** `/opt/homebrew/lib/node_modules/@mariozechner/pi-coding-agent/examples/extensions/interactive-shell.ts`
- **Node.js Docs:** https://nodejs.org/api/child_process.html#child_processspawnsynccommand-args-options
- **TUI API:** pi's extension context provides TUI control via `ctx.ui.custom()`

## Credits

Implementation based on the `interactive-shell.ts` extension pattern from the pi coding agent examples.

---

**Version:** 1.0.1  
**Date:** February 26, 2026
