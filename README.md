# ssg-assets
Convert media assets for your static website

Makes a bunch of avif and webp files from jpeg's and png's.

For now, asset cache is stored on git, which is not ideal. Still thinking about implementing Netlify build cache support.

CLI usage example: `ssga assets/:public/`

### Flags:
- `-n` or `--no-cache` - Don't use caching
- `-v` or `--verbose` - Report everything!
- `-c` or `--copy` - Don't convert anything, just copy

### Skip directories:

Add `.noassets` to a directory to skip it's content. Syntax is like that:

```ini
# comment
assets/svgs
*.mp4
```
