# OpenDyslexic font bundle

The actual OpenDyslexic font files (Regular, Bold, Italic) should be downloaded from the official OpenDyslexic project (free, OFL license) and placed here:

- `OpenDyslexic-Regular.woff2`
- `OpenDyslexic-Bold.woff2`
- `OpenDyslexic-Italic.woff2`

Source: https://opendyslexic.org/

License: SIL Open Font License 1.1 (free for embed, modification, redistribution).

Until the actual files are downloaded, the `[data-lq-font="opendyslexic"]` selector in `/css/literacy-quest.css` falls back to a system-monospace font. The wrapper agent in Phase 3 should download and commit the font files.
