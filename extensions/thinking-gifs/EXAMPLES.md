# Usage Examples

## Example 1: Basic Usage

Start pi with the thinking GIFs extension:

```bash
cd /Users/dara/dev/dara-pi-agent-theme
pi -e ./extensions/thinking-gifs/index.ts
```

Then ask the agent a question:
```
You: What is the capital of France?
```

The GIF will appear below the editor while the agent is thinking, then disappear when the response is ready.

## Example 2: Manual Testing (Full Animation!)

Inside pi, see a fully animated GIF:

```bash
/thinking-gif
```

**What happens:**
1. Pi's TUI stops
2. Your terminal is handed over to chafa
3. You'll see a fully animated GIF playing for up to 30 seconds
4. Animation auto-stops and returns to pi, or press **Ctrl+C** to exit early (may need multiple presses)

This demonstrates the full power of chafa's animation capabilities!

## Example 3: Custom GIF Collection

Add your own GIFs to the `gifs/` directory:

```bash
cd /Users/dara/dev/dara-pi-agent-theme
cp ~/Downloads/my-cool-animation.gif gifs/
```

The extension will automatically include it in the random selection.

## Example 4: Preview GIF Rendering

See how a specific GIF will look before adding it:

```bash
chafa --size=50x15 --stretch --symbols block --color-space rgb --dither none path/to/your.gif
```

## Example 5: Loading from Auto-Discovery Location

For automatic loading (without `-e` flag), copy the extension to pi's global or project extensions directory:

```bash
# Global (loads for all projects)
mkdir -p ~/.pi/agent/extensions/
cp -r extensions/thinking-gifs ~/.pi/agent/extensions/

# Project-local (loads only for this project)
mkdir -p .pi/extensions/
cp -r extensions/thinking-gifs .pi/extensions/
```

Then just run:
```bash
pi
```

## Example 6: Combining with Other Extensions

Load multiple extensions at once:

```bash
pi -e ./extensions/thinking-gifs/index.ts -e ./other-extension.ts
```

## Example 7: Using with Specific Models

The extension works with any model:

```bash
# Start with thinking GIFs and select a specific model
pi -e ./extensions/thinking-gifs/index.ts

# Inside pi:
/model
# Select your preferred model
```

The GIF will appear whenever the agent is thinking, regardless of which model you're using.

## Example 8: Debugging

If the GIF doesn't appear, check:

1. **chafa installed?**
   ```bash
   which chafa
   chafa --version
   ```

2. **GIFs in the right location?**
   ```bash
   ls -la gifs/
   ```

3. **Running from the correct directory?**
   The extension looks for `gifs/` relative to your current working directory.

4. **Check pi's output** for any error messages when the extension loads.

## Example 9: Performance Testing

Test with a complex question to see the GIF in action:

```
You: Write a detailed explanation of how quantum computing works, including the mathematical foundations and practical applications.
```

The GIF should appear immediately when the agent starts processing and disappear when it begins responding or using tools.

## Example 10: Visual Customization

Adjust the GIF size by modifying `index.ts`:

```typescript
// In renderGifFrame():
const cols = Math.min(process.stdout.columns || 80, 70); // Wider
const lines = Math.min((process.stdout.rows || 24) - 10, 25); // Taller
```

Then reload the extension:
```bash
/reload
```
