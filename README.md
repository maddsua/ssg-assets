# ssg-assets
Convert media assets for your static website

Makes a bunch of avif and webp files from jpeg's and png's.

For now, asset cache is stored on git, which is not ideal. Still thinking about implementing Netlify build cache support.

CLI usage example: `ssga assets/:public/`

## Flags:

- `-n` or `--no-cache` - Don't use caching

- `-v` or `--verbose` - Report everything!

- `-c` or `--copy` - Don't convert anything, just copy

- `--formats=[list]` - Specify image formats to convert to.

	Valid options are: `original`, `webp`, `avif`

## Skip over files:

Add `.noassets` to a directory to skip some of the content. Syntax is like that:

```ini
# skip everything inside the "svgs" subdirectory
assets/svgs
# and all mp4 files too
*.mp4
```

## React components

They are meant to be used with either Astro or NextJS. You'll need to add these lines to the config:

### Astro:
```js
vite: {
    ssr: {
        noExternal: '@maddsua/ssg-assets'
    }
}
```

### NextJS:
```js
transpilePackages: ['@maddsua/ssg-assets']
```

Should work okay after that.
