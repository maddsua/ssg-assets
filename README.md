# ssg-assets

Converts media assets for static websites, apps and so on.

Makes a bunch of avif and webp's from jpeg's, png's and such.

<img src="https://raw.githubusercontent.com/maddsua/ssg-assets/added-illustration/docs/illustration.webp" alt="Image conversion illustration">

\* If you're using Netlify, be sure to enable `netlify-plugin-cache` to get the max speeed out of builds!

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
Some options cannot be modified by user or by a specific config load method (like a json file can't modify it's own location, duh), the tool will tell you if your config can break it.

## Frontend components

Having multiple image formats is fun, but placing all the source tags for a picture is not. So here, have these UI framework components:

- Vue
- React/Preact
- Astro
- HTML (renders directly to HTML text, intended for server use)

Don't try to import package's root directly, instead import the subpath for the framework you're using.

Component import path: `@maddsua/ssg-assets/[framework]`.

For instance, this is how you import a Picture component for Vue:
```js
import { Picture } from '@maddsua/ssg-assets/vue';
```

### If stuff does not work

Your bundler/compiler may choke on this, so try using this config line for Webpack:

```js
transpilePackages: ['@maddsua/ssg-assets']
```
or this one for Vite:

```js
vite: {
    ssr: {
        noExternal: '@maddsua/ssg-assets'
    }
}
```
