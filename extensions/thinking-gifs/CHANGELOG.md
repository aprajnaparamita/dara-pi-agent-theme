# Changelog

All notable changes to the Thinking GIFs extension will be documented in this file.

## [2.0.0] - 2026-02-26

### 🎉 Major Feature: Automatic Animated Thinking!

**Breaking Change:** The extension now automatically takes over the terminal with a fully animated GIF when the agent starts thinking, and automatically returns to pi when done!

### Changed
- **Automatic mode now shows ANIMATED GIF** instead of static widget
- Takes over terminal when agent starts thinking (`message_update` event)
- **Automatically stops animation** and returns to pi when thinking ends
- Uses `spawn()` with proper process management for background animation
- Cleaned up unused widget code (removed static frame rendering)

### Technical
- Replaced widget-based display with terminal takeover approach
- Track animation process PID and kill on thinking end
- Use `tui.stop()` / `tui.start()` pattern with stored references
- Proper cleanup on `message_end` and `tool_execution_start` events

### User Experience
**Before (v1.x):**
- Automatic: Static GIF frame shown as widget below editor
- Manual `/thinking-gif`: Animated GIF with terminal takeover

**After (v2.0):**
- **Automatic: Full animated GIF takes over terminal!** 🦄✨
- Manual `/thinking-gif`: Same behavior (for testing)

## [1.0.3] - 2026-02-26

### Fixed
- Added `--duration=30` flag to `/thinking-gif` command to prevent infinite loop
- Animation now automatically stops after 30 seconds instead of requiring Ctrl+C

### Changed
- Updated documentation to reflect 30-second timeout behavior
- Note: Ctrl+C should work but may need to be pressed multiple times due to chafa's animation loop

## [1.0.2] - 2026-02-26

### Fixed
- **Critical:** Fixed `/thinking-gif` command not working - changed `--animate` to `--animate=on`
- Command was immediately returning due to chafa error: "Animate mode must be one of [on, off]"

## [1.0.1] - 2026-02-26

### Changed
- **Breaking:** `/thinking-gif` command now displays **full animated GIF** using terminal takeover
- Command requires **Ctrl+C to exit** (instead of Enter/Escape)
- Automatic display during agent thinking remains as static widget (unchanged)

### Added
- Full animation support via chafa's `--animate` flag
- Terminal takeover using `tui.stop()` / `tui.start()` pattern

### Technical
- Switched from `execAsync()` to `spawnSync()` with `stdio: 'inherit'` for manual command
- Prevents `ERR_CHILD_PROCESS_STDIO_MAXBUFFER` error from large ANSI output
- Follows the same pattern as pi's built-in `interactive-shell.ts` extension
- Import `spawnSync` from `node:child_process`

### Fixed
- Buffer overflow error when trying to display animated GIFs

## [1.0.0] - 2026-02-26

### Added
- Initial implementation of thinking GIFs extension
- Automatic GIF display when agent starts thinking
- Random GIF selection from `gifs/` directory
- Widget-based display below editor in pi's TUI
- Animated "Thinking..." indicator with pulsing dots
- `/thinking-gif` command for manual testing
- Lifecycle event integration:
  - `message_update` - Show GIF when agent starts streaming
  - `message_end` - Hide GIF when agent finishes
  - `tool_execution_start` - Hide GIF when tools execute
  - `session_shutdown` - Clean up on exit
- chafa integration for ANSI pixel art rendering
- Test script for validation
- Comprehensive documentation

### Technical Details
- Uses chafa to render GIF first frame as colored ANSI blocks
- Displays as widget below editor (doesn't interfere with main UI)
- Updates "Thinking..." message every 500ms for visual feedback
- Handles edge cases (no GIFs, chafa errors, UI availability)
- Proper cleanup of intervals and widgets

### Dependencies
- System: chafa >= 1.18.0
- pi: @mariozechner/pi-coding-agent
- pi: @mariozechner/pi-tui
