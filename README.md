# ssg-assets
Converts media assets for static websites, apps and so on.

Makes a bunch of avif and webp files from jpeg's and png's.

Oh and also it has Picture and Img components for Vue, Astro and React so you won't write all the source's HTML yourself!

If you're using Netlify, be sure to enable netlify-plugin-cache to get the max speeed out of builds!

## CLI

After installing the package you'll be able to use ssga CLI tool. It's basically a cool-kids launcher for sharp (image conversion library). In orders to tweak the tool you can use command line arguments or `ssgassets.config.json` files places in project's root and/or assets root directory.

### Config options are listed in this TypeScript interface

(it's the actual interface the CLI uses, for real)

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

Drop this option into a json config file or use directly in CLI:

```bash
ssga --inputDir=./content --outputDir=./www/content --formats=webp,avif,jpg
```
Some options cannot be modified by user or a specific config load method (like a json file can't modify it's location, duh), the tool will tell you if your config can break it.

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
