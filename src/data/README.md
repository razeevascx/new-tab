# App Configuration

This directory contains JSON files that define the apps shown in your new tab extension.

## Files

- **`google-apps.json`** - Google/web apps grid
- **`microsoft-apps.json`** - Microsoft/productivity apps grid

## App Object Structure

Each app in the JSON files should have the following properties:

```json
{
  "name": "App Name", // Display name (keep it short)
  "url": "https://example.com", // URL to open when clicked
  "icon": "🔥", // Emoji icon (use single emoji)
  "color": "#FF5722" // Hex color for the app background
}
```

## Adding New Apps

1. Open the appropriate JSON file (`google-apps.json` or `microsoft-apps.json`)
2. Add your new app object to the array
3. Make sure to include all required properties
4. Test the extension to ensure the app appears correctly

### Example: Adding Discord to Microsoft Apps

```json
{
  "name": "Discord",
  "url": "https://discord.com",
  "icon": "💬",
  "color": "#5865F2"
}
```

## Color Guidelines

- Use brand colors when possible (e.g., Google's red, Microsoft's blue)
- Ensure good contrast with white text/icons
- Use hex color format (#RRGGBB)

## Icon Guidelines

- Use single emojis that represent the app/service
- Avoid complex emojis that might not render well at small sizes
- Test on different systems to ensure compatibility

## Popular Color References

- **Google Red**: `#EA4335`
- **Google Blue**: `#4285F4`
- **Google Green**: `#34A853`
- **Google Yellow**: `#FBBC05`
- **Microsoft Blue**: `#0078D4`
- **GitHub**: `#181717`
- **LinkedIn**: `#0077B5`
- **Discord**: `#5865F2`
- **Slack**: `#4A154B`
- **Spotify**: `#1DB954`
- **Netflix**: `#E50914`
- **Twitter/X**: `#1DA1F2`

## Grid Layout

The apps are displayed in a 3-column grid. For best visual balance:

- Keep app names short (1-2 words)
- Aim for 6-9 apps per section
- Consider the visual weight when arranging apps

## After Making Changes

1. Save the JSON file
2. Rebuild the extension: `pnpm build`
3. Copy manifest: `cp public/manifest.json dist/`
4. Reload the extension in your browser
5. Open a new tab to see your changes
