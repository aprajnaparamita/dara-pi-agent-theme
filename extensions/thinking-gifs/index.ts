import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { spawn, spawnSync, ChildProcess } from "node:child_process";
import { readdir } from "node:fs/promises";
import { join } from "node:path";

export default function (pi: ExtensionAPI) {
  let isShowingGif = false;
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
      if (gifFiles.length === 0) return null;
      const randomIndex = Math.floor(Math.random() * gifFiles.length);
      return join(gifsDir, gifFiles[randomIndex]);
    } catch (error) {
      return null;
    }
  }

  /**
   * Walk the TUI's child tree and stop any Loader intervals before restarting.
   * The Loader (⠏ Working...) lives inside statusContainer as a direct grandchild of TUI.
   * Stopping its setInterval prevents it from rendering after tui.start().
   */
  function stopLoadersInTui(tui: any) {
    for (const child of tui.children ?? []) {
      for (const grandchild of child.children ?? []) {
        if (typeof grandchild.stop === "function" && grandchild.intervalId != null) {
          grandchild.stop();
        }
      }
      if (typeof child.stop === "function" && child.intervalId != null) {
        child.stop();
      }
    }
  }

  /**
   * Start displaying an animated GIF (takes over terminal).
   * Resolves only after tui.stop() has been called synchronously inside the factory,
   * so before_agent_start completes before pi can render the spinner.
   */
  async function startAnimatedGif(ctx: any) {
    if (!ctx.hasUI || isShowingGif) return;

    const gifPath = await getRandomGif();
    if (!gifPath) return;

    isShowingGif = true;

    await new Promise<void>((resolve) => {
      ctx.ui.custom<void>((tui: any, _theme: any, _kb: any, done: any) => {
        tui.stop();
        currentTui = { tui, done };

        process.stdout.write("\x1b[2J\x1b[H");

        const shell = process.env.SHELL || "/bin/sh";

        // Print the message as part of the shell script so chafa renders below it.
        // We reserve 2 rows at the top (message + blank line) by subtracting from LINES.
        // --clear is intentionally omitted so chafa doesn't wipe the message on each frame.
        const command = `
          printf "\\033[1;35m🦄 Agent is thinking...\\033[0m\\n\\n"
          chafa --animate=on --size=$(tput cols)x$(( $(tput lines) - 2 )) --stretch --symbols block --colors 256 --color-space rgb --dither none "${gifPath}"
        `;

        animationProcess = spawn(shell, ["-c", command], {
          stdio: "inherit",
          env: process.env,
        });

        animationProcess.on("exit", () => {
          if (animationProcess) {
            stopAnimatedGif();
          }
        });

        // Resolve now — tui.stop() is done, before_agent_start can return
        resolve();

        return { render: () => [], invalidate: () => {} };
      });
    });
  }

  /**
   * Stop the animated GIF and return control to the TUI.
   */
  function stopAnimatedGif() {
    if (!isShowingGif) return;
    isShowingGif = false;

    if (animationProcess) {
      animationProcess.kill("SIGTERM");
      animationProcess = null;
    }

    if (currentTui) {
      const { tui, done } = currentTui;
      // Kill the Loader's setInterval before restarting TUI so the spinner
      // doesn't flash onto the screen during handover
      stopLoadersInTui(tui);
      tui.start();
      tui.requestRender(true);
      done();
      currentTui = null;
    }
  }

  // ─── Start GIF before pi creates the ⠏ Working... spinner ───
  pi.on("before_agent_start", async (_event, ctx) => {
    await startAnimatedGif(ctx);
  });

  // ─── First token streaming in — stop GIF, let text appear ───
  pi.on("message_update", async (event, _ctx) => {
    if (event.message.role === "assistant") {
      stopAnimatedGif();
    }
  });

  // ─── Tool about to run — stop GIF so chat is readable ───
  pi.on("tool_execution_start", async (_event, _ctx) => {
    stopAnimatedGif();
  });

  // ─── Tool done — model thinking again, show GIF ───
  pi.on("tool_execution_end", async (_event, ctx) => {
    await startAnimatedGif(ctx);
  });

  // ─── Agent fully done — stop GIF ───
  pi.on("agent_end", async (_event, _ctx) => {
    stopAnimatedGif();
  });

  // Clean up on shutdown
  pi.on("session_shutdown", async (_) => {
    stopAnimatedGif();
  });

  // Manual test command
  pi.registerCommand("thinking-gif", {
    description: "Display a random animated thinking GIF (press Ctrl+C to stop)",
    handler: async (args, ctx) => {
      if (!ctx.hasUI) {
        ctx.ui.notify("This command requires TUI mode", "error");
        return;
      }

      const gifPath = await getRandomGif();
      if (!gifPath) {
        ctx.ui.notify("No GIF files found in gifs/ directory", "error");
        return;
      }

      await ctx.ui.custom<void>((tui, _theme, _kb, done) => {
        tui.stop();

        process.stdout.write("\x1b[2J\x1b[H");
        process.stdout.write("🦄 Thinking GIF - Press Ctrl+C to stop\n\n");

        const shell = process.env.SHELL || "/bin/sh";
        const command = `chafa --animate=on --duration=30 --stretch --color-space rgb "${gifPath}"`;

        spawnSync(shell, ["-c", command], {
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
}
