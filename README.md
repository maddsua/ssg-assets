# Image optimization tool for static websites, apps and so on

## Convert images to modern formats, with blackjack and caching included. Yeah, right, that's some ISR-like performance gains for your avif's and webp's.

Makes a bunch of avif's and webp's from jpeg's, png's and such.

<img src="https://raw.githubusercontent.com/maddsua/ssg-assets/main/docs/illustration.webp" alt="Image conversion illustration">

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
- Svelte
- HTML (renders directly to HTML text, intended for server use)
- DOM (JS-native functions, creates HTMLElements that can be inserted into actual DOM)

Don't try to import package's root directly, instead import the subpath for the framework you're using.

Component import path: `@maddsua/ssg-assets/[framework]`.

For instance, this is how you import a Picture component for Vue:
```js
import { Picture } from '@maddsua/ssg-assets/vue';
```

## Cache invalidation for static hostings

There are cases where you'd want browser to reset it's image cache but a hosting provider does not provide an easy way to do it.
The solution here is to change image's url search params so that on each deploy it will be different thus forcing browser to re-download assets.

In order to activate this feature make sure that your bundler replaces string literal `__SSGA_DEPLOY_CACHE_HASH__` with a unique deploy identifier. Or a random string.
Here's an example how it's done using Vite when deploying from GitLab:

```js
...
define: {
  __SSGA_DEPLOY_CACHE_HASH__: process.env['CI_COMMIT_SHA']?.slice(0, 8)
}
...
```

## If stuff does not work

Your bundler/compiler may choke on this, so try using this config line for Webpack:

```js
...
transpilePackages: ['@maddsua/ssg-assets']
...
```
or this one for Vite:

```js
...
ssr: {
  noExternal: '@maddsua/ssg-assets'
}
...
```
