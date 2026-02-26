import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { spawn, spawnSync, ChildProcess } from "node:child_process";
import { readdir } from "node:fs/promises";
import { join } from "node:path";

export default function (pi: ExtensionAPI) {
  let isThinking = false;
  let animationProcess: ChildProcess | null = null;
  let currentTui: any = null;

  /**
   * Get a random GIF from the gifs directory
   */
  async function getRandomGif(): Promise<string | null> {
    try {
      const gifsDir = join(process.cwd(), "gifs");
      const files = await readdir(gifsDir);
      const gifFiles = files.filter((f) => f.toLowerCase().endsWith(".gif"));

      if (gifFiles.length === 0) {
        return null;
      }

      const randomIndex = Math.floor(Math.random() * gifFiles.length);
      return join(gifsDir, gifFiles[randomIndex]);
    } catch (error) {
      console.error("Error reading gifs directory:", error);
      return null;
    }
  }

  /**
   * Start displaying an animated GIF (takes over terminal)
   */
  async function startAnimatedGif(ctx: any) {
    if (!ctx.hasUI) {
      return;
    }

    const gifPath = await getRandomGif();
    if (!gifPath) {
      ctx.ui.notify("No GIF files found in gifs/ directory", "error");
      return;
    }

    try {
      // Use custom() to get TUI access, then hand over terminal
      await ctx.ui.custom<void>((tui, _theme, _kb, done) => {
        // Stop TUI to release terminal
        tui.stop();
        currentTui = { tui, done };

        // Clear screen and show message
        process.stdout.write("\x1b[2J\x1b[H");
        process.stdout.write("🦄 Agent is thinking...\n\n");

        // Spawn chafa with animation (background process)
        const shell = process.env.SHELL || "/bin/sh";
        // const command = `chafa --animate=on --stretch --symbols block --color-space rgb --dither none "${gifPath}"`;
        const command = `chafa --animate --size=$(tput cols)x$(tput lines) --stretch --symbols block --colors 16 --color-space rgb --dither none --ansi --clear your.gif "${gifPath}"`;

        animationProcess = spawn(shell, ["-c", command], {
          stdio: "inherit",
          env: process.env,
        });

        // Handle process exit (in case it exits on its own)
        animationProcess.on("exit", () => {
          if (animationProcess) {
            stopAnimatedGif();
          }
        });

        // Return a minimal component (won't be rendered since TUI is stopped)
        return { 
          render: () => [], 
          invalidate: () => {} 
        };
      });
    } catch (error) {
      console.error("Error starting animated GIF:", error);
    }
  }

  /**
   * Stop the animated GIF and return to TUI
   */
  function stopAnimatedGif() {
    // Kill the animation process
    if (animationProcess) {
      animationProcess.kill("SIGTERM");
      animationProcess = null;
    }

    // Restart TUI if we have a reference
    if (currentTui) {
      const { tui, done } = currentTui;
      tui.start();
      tui.requestRender(true);
      done();
      currentTui = null;
    }
  }

  // Listen for when the agent starts thinking (streaming)
  pi.on("message_update", async (event, ctx) => {
    // Only show GIF for assistant messages (first update triggers display)
    if (event.message.role === "assistant" && !isThinking) {
      isThinking = true;
      await startAnimatedGif(ctx);
    }
  });

  // Listen for when the agent finishes
  pi.on("message_end", async (event, ctx) => {
    if (event.message.role === "assistant" && isThinking) {
      isThinking = false;
      stopAnimatedGif();
    }
  });

  // Listen for when tools start executing
  pi.on("tool_execution_start", async (event, ctx) => {
    if (isThinking) {
      isThinking = false;
      stopAnimatedGif();
    }
  });

  // Clean up on shutdown
  pi.on("session_shutdown", async (_, ctx) => {
    stopAnimatedGif();
  });

  // Register manual test command
  pi.registerCommand("thinking-gif", {
    description: "Display a random animated thinking GIF (press Ctrl+C to stop)",
    handler: async (args, ctx) => {
      // No UI available (print mode, RPC, etc.)
      if (!ctx.hasUI) {
        ctx.ui.notify("This command requires TUI mode", "error");
        return;
      }

      const gifPath = await getRandomGif();
      if (!gifPath) {
        ctx.ui.notify("No GIF files found in gifs/ directory", "error");
        return;
      }

      // Use ctx.ui.custom() to get TUI access, then hand over terminal
      await ctx.ui.custom<void>((tui, _theme, _kb, done) => {
        // Stop TUI to release terminal
        tui.stop();

        // Clear screen
        process.stdout.write("\x1b[2J\x1b[H");

        // Display header
        process.stdout.write("🦄 Thinking GIF - Press Ctrl+C to stop\n\n");

        // Run chafa with full terminal access (with animation!)
        // Note: 30 second timeout as safety measure
        const shell = process.env.SHELL || "/bin/sh";
        const command = `chafa --animate=on --duration=30 --stretch --symbols block --color-space rgb --dither none "${gifPath}"`;
        
        const result = spawnSync(shell, ["-c", command], {
          stdio: "inherit",  // Hand terminal over to chafa
          env: process.env,
        });

        // Restart TUI
        tui.start();
        tui.requestRender(true);

        // Signal completion
        done();

        // Return empty component (immediately disposed since done() was called)
        return { render: () => [], invalidate: () => {} };
      });
    },
  });
}
