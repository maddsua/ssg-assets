# Image optimization tool for static websites, apps and so on

## Convert images to modern formats, with blackjack and caching included. Yeah, right, that's some ISR-like performance gains for your avif's and webp's.

Makes a bunch of avif's and webp's from jpeg's, png's and such.

<img src="https://raw.githubusercontent.com/maddsua/ssg-assets/main/docs/illustration.webp" alt="Image conversion illustration">

\* If you're using Netlify, be sure to enable `netlify-plugin-cache` to get the max speeed out of builds!

## CLI

After installing the package you'll be able to use ssga CLI tool. It's basically a cool-kid's launcher for sharp (image conversion library).

By default the cli looks for config files in project directory. Default config names are: `(ssgassets|ssga).config.(json|js|mjs|ts|mts)`, eg. `ssga.config.json`.

Custom config files can be specified with `--config` argument.

### Configuration

Sample config file:

```typescript
import type { Config } from '@maddsua/ssg-assets';

export const config: Config = {
	verbose: true,
	inputDir: './assets',
	outputDir: './dist',
	formats: ['avif', 'webp', 'jpg'],
	exclude: [
		'**/vector/*.svg'
	]
}
```

### Comman line flags

- `config` (`string`): Config file location
- `verbose` (`boolean`): Enables verbose logging
- `clearCache` (`boolean`): Resets asset cacse
- `clearDist` (`boolean`): Cleares all files from dist dir before copying new assets
- `noCache` (`boolean`): Disables asset cache
- `inputDir` (`string`): Input directory path
- `outputDir` (`string`): Output directory path

### Usage example

```bash
ssga --config=./tests/convert/ssgassets.config.json --verbose
```

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
