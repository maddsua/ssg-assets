# ssg-assets
Convert media assets for your static website

Makes a bunch of avif and webp files from jpeg's and png's

CLI usage example: `ssga assets/:public/`

### Flags:
- `-n` or `--no-cache` - Don't use caching
- `-v` or `--verbose` - Report everything!

### Skip directories:

Add `.noassets` to a directory to skip it's content. Specify glob patterns if wanna.