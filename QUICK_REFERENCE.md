# Quick Reference - Terminal Takeover Pattern

## The Pattern

```typescript
import { spawnSync } from "node:child_process";

await ctx.ui.custom<ReturnType>((tui, theme, keybindings, done) => {
  // 1. Stop TUI
  tui.stop();
  
  // 2. Clear screen (optional)
  process.stdout.write("\x1b[2J\x1b[H");
  
  // 3. Run command with FULL terminal access
  const shell = process.env.SHELL || "/bin/sh";
  const result = spawnSync(shell, ["-c", yourCommand], {
    stdio: "inherit",  // ← THE KEY
    env: process.env,
  });
  
  // 4. Restart TUI
  tui.start();
  tui.requestRender(true);
  
  // 5. Signal completion
  done(result.status);
  
  // 6. Return dummy component
  return { render: () => [], invalidate: () => {} };
});
```

## When to Use This

✅ **Use terminal takeover when:**
- Running interactive editors (vim, nano)
- Running TUI apps (htop, lazygit)
- Running commands with rich ANSI output (chafa animations)
- User needs to interact with subprocess
- Output is large or complex (animations, tables)

❌ **Don't use when:**
- You need to capture output for processing
- UI should remain visible while command runs
- Command is quick and non-interactive
- You want to display output as a widget

## Alternative: Widget Mode

```typescript
// For displaying in widget (doesn't take over terminal)
import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);
const { stdout } = await execAsync(command);

ctx.ui.setWidget("my-widget", stdout.split("\n"), {
  placement: "belowEditor"
});
```

## Comparison

| Feature | Terminal Takeover | Widget Mode |
|---------|------------------|-------------|
| Terminal control | Full | None |
| TUI visible | No (stopped) | Yes |
| User interaction | Direct | Via widget |
| Output size | Unlimited | Limited by buffer |
| Animation | ✅ Full support | ❌ Static only |
| Exit method | User action (Ctrl+C) | Programmatic |
| Use case | Interactive commands | Status display |

## stdio Options Explained

```typescript
// Option 1: Inherit (full terminal access)
{ stdio: "inherit" }
// → stdin/stdout/stderr directly connected to terminal
// → Best for interactive commands

// Option 2: Pipe (capture output)
{ stdio: "pipe" }  // default
// → Can read stdout/stderr via result.stdout
// → Limited by buffer size (1MB default)

// Option 3: Ignore (discard)
{ stdio: "ignore" }
// → No output captured or displayed
```

## Common Use Cases

### Text Editors
```typescript
spawnSync(shell, ["-c", "vim file.txt"], { stdio: "inherit" });
```

### System Monitors
```typescript
spawnSync(shell, ["-c", "htop"], { stdio: "inherit" });
```

### Git Interactive
```typescript
spawnSync(shell, ["-c", "git rebase -i HEAD~3"], { stdio: "inherit" });
```

### Animated Graphics (Our Use Case!)
```typescript
// Note: Added --duration=30 to prevent infinite loop
// Ctrl+C should work but may need multiple presses during animation
spawnSync(shell, ["-c", `chafa --animate=on --duration=30 "${gifPath}"`], { stdio: "inherit" });
```

## Error Handling

```typescript
const result = spawnSync(shell, ["-c", command], {
  stdio: "inherit",
  env: process.env,
});

if (result.error) {
  // Failed to spawn (command not found, etc.)
  console.error("Spawn error:", result.error);
}

if (result.status !== 0) {
  // Command exited with error code
  console.error("Exit code:", result.status);
}

if (result.signal) {
  // Killed by signal (Ctrl+C = SIGINT)
  console.log("Killed by signal:", result.signal);
}
```

## TUI State Management

```typescript
// Before running subprocess
tui.stop();           // Stop input handling, restore terminal
process.stdout.write("\x1b[2J\x1b[H");  // Clear (optional)

// After subprocess exits
tui.start();          // Resume input handling
tui.requestRender(true);  // Force full redraw
```

## Real-World Example (Our Implementation)

```typescript
pi.registerCommand("thinking-gif", {
  description: "Display animated GIF",
  handler: async (args, ctx) => {
    if (!ctx.hasUI) {
      ctx.ui.notify("Requires TUI", "error");
      return;
    }

    const gifPath = await getRandomGif();
    
    await ctx.ui.custom<void>((tui, _, __, done) => {
      tui.stop();
      process.stdout.write("\x1b[2J\x1b[H");
      process.stdout.write("🦄 Press Ctrl+C to stop\n\n");
      
      spawnSync(process.env.SHELL || "/bin/sh", [
        "-c",
        `chafa --animate "${gifPath}"`
      ], {
        stdio: "inherit",
        env: process.env,
      });
      
      tui.start();
      tui.requestRender(true);
      done();
      
      return { render: () => [], invalidate: () => {} };
    });
  },
});
```

## Key Takeaways

1. **`tui.stop()` before, `tui.start()` after**
2. **`stdio: "inherit"` gives subprocess terminal control**
3. **User exits with Ctrl+C (or command's normal exit)**
4. **Pattern from `interactive-shell.ts` example**
5. **Perfect for animations, editors, TUI apps**

---

**Source:** `@mariozechner/pi-coding-agent` examples  
**Pattern:** `examples/extensions/interactive-shell.ts`
