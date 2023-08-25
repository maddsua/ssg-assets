# ssg-assets
Converts media assets for static websites, apps and so on.

Makes a bunch of avif and webp files from jpeg's and png's.

Oh and also it has Picture and Img components for Vue, Astro and React so you won't write all the source's HTML yourself!

If you're using Netlify, be sure to enable netlify-plugin-cache to get the max speeed out of builds!

## Config:

Config interface says it all:

```typescript
interface Config {

  // path to main config, user-immutable
  config: string;

  // path to asset directory config, user-immutable
  assetConfig: string;

  // path to cache directory, user-immutable
  cacheDir: string;

  // print more info
  verbose: boolean;

  // nukes the old cache
  resetCache: boolean;

  // ignores cache completely
  noCache: boolean;

  // specify image formats for Sharp to convert to
  formats: OutputOption[];

  // skip assets that match these glob patterns
  exclude: string[];

  // only include assets that match these glob patterns
  include: string[];

  // simply copy the assets that match these glob patterns
  passthrough: string[];

  // input directory, defaults to ./assets
  inputDir: string;

  // output directory, defaults ot ./dist/assets
  outputDir: string;

  //  set image quality
  quality: Record<string, number>
}
```

All of the mutable options can be used in cli like so:
```bash
ssga --inputDir=./content --outputDir=./www/content --formats=webp,avif,jpg
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
