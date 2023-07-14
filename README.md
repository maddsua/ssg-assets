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

# Frontend components

You can import the Img and Picture components for React, Astro and Vue. It's just the same HTML elements, but a bit more smart.

## Import paths:

### Astro:

```js
import { Picture } from '@maddsua/ssg-assets/astro';
```

Add this to your `astro.config`:

```js
vite: {
    ssr: {
        noExternal: '@maddsua/ssg-assets'
    }
}
```

### React (Next):

```js
import { Picture } from '@maddsua/ssg-assets/react';
```

Add this to your next config:

```js
transpilePackages: ['@maddsua/ssg-assets']
```

### Vue:

```js
import { Picture } from '@maddsua/ssg-assets/vue';
```
