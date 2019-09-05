![tsdx](https://user-images.githubusercontent.com/4060187/56918426-fc747600-6a8b-11e9-806d-2da0b49e89e4.png)

Despite all the recent hype, setting up a new TypeScript (x React) library can be tough. Between [Rollup](https://github.com/rollup/rollup), [Jest](https://github.com/facebook/jest), `tsconfig`, [Yarn resolutions](https://yarnpkg.com/en/docs/selective-version-resolutions), TSLint, and getting VSCode to play nicely....there is just a whole lot of stuff to do (and things to screw up). foreach-tsdx is a zero-config CLI that helps you develop, test, and publish modern TypeScript packages with ease--so you can focus on your awesome new library and not waste another afternoon on the configuration.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Features](#features)
- [Quick Start](#quick-start)
  - [`npm start` or `yarn start`](#npm-start-or-yarn-start)
  - [`npm run build` or `yarn build`](#npm-run-build-or-yarn-build)
  - [`npm test` or `yarn test`](#npm-test-or-yarn-test)
  - [`npm run lint` or `yarn lint`](#npm-run-lint-or-yarn-lint)
- [Optimizations](#optimizations)
  - [Development-only Expressions + Treeshaking](#development-only-expressions--treeshaking)
    - [Rollup Treeshaking](#rollup-treeshaking)
    - [Advanced `babel-plugin-dev-expressions`](#advanced-babel-plugin-dev-expressions)
      - [`__DEV__`](#dev)
      - [`invariant`](#invariant)
      - [`warning`](#warning)
  - [Using lodash](#using-lodash)
  - [Error extraction](#error-extraction)
- [Inspiration](#inspiration)
  - [Comparison to Microbundle](#comparison-to-microbundle)
- [API Reference](#api-reference)
  - [`foreach-tsdx watch`](#foreach-tsdx-watch)
  - [`foreach-tsdx build`](#foreach-tsdx-build)
  - [`foreach-tsdx test`](#foreach-tsdx-test)
- [Author](#author)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Features

TSDX comes with the "battery-pack included" and is part of a complete TypeScript breakfast:

- Bundles your code with [Rollup](https://github.com/rollup/rollup) and outputs multiple module formats (CJS & ESM by default, and also UMD if you want) plus development and production builds
- Comes with treeshaking, ready-to-rock lodash optimizations, and minification/compression
- Live reload / watch-mode
- Works with React
- Human readable error messages (and in VSCode-friendly format)
- Bundle size snapshots
- Jest test runner setup with sensible defaults via `foreach-tsdx test`
- Zero-config, single dependency

## Quick Start

```
npx foreach-tsdx create mylib
cd mylib
yarn start
```

That's it. You don't need to worry about setting up Typescript or Rollup or Jest or other plumbing. Just start editing `src/index.ts` and go!

Below is a list of commands you will probably find useful:

### `npm start` or `yarn start`

Runs the project in development/watch mode. Your project will be rebuilt upon changes. TSDX has a special logger for your convenience. Error messages are pretty printed and formatted for compatibility VS Code's Problems tab.

<img src="https://user-images.githubusercontent.com/4060187/52168303-574d3a00-26f6-11e9-9f3b-71dbec9ebfcb.gif" width="600" />

Your library will be rebuilt if you make edits.

### `npm run build` or `yarn build`

Bundles the package to the `dist` folder.
The package is optimized and bundled with Rollup into multiple formats (CommonJS, UMD, and ES Module).

<img src="https://user-images.githubusercontent.com/4060187/52168322-a98e5b00-26f6-11e9-8cf6-222d716b75ef.gif" width="600" />

### `npm test` or `yarn test`

Runs the test watcher (Jest) in an interactive mode.
By default, runs tests related to files changed since the last commit.

### `npm run lint` or `yarn lint`

Runs Eslint with Prettier on .ts and .tsx files.
If you want to customize eslint you can add an `eslint` block to your package.json, or you can run `yarn lint --write-file` and edit the generated `.eslintrc.js` file.

## Optimizations

Aside from just bundling your module into different formats, TSDX comes with some optimizations for your convenience. They yield objectively better code and smaller bundle sizes.

After TSDX compiles your code with TypeScript, it processes your code with 3 Babel plugins:

- [`babel-plugin-annotate-pure-calls`](https://github.com/Andarist/babel-plugin-annotate-pure-calls): Injects for `#__PURE` annotations to enable treeshaking
- [`babel-plugin-dev-expressions`](https://github.com/4Catalyzer/babel-plugin-dev-expression): A mirror of Facebook's dev-expression Babel plugin. It reduces or eliminates development checks from production code
- [`babel-plugin-rename-import`](https://github.com/laat/babel-plugin-transform-rename-import): Used to rewrite any `lodash` imports

### Development-only Expressions + Treeshaking

`babel-plugin-annotate-pure-calls` + `babel-plugin-dev-expressions` work together to fully eliminate dead code (aka treeshake) development checks from your production code. Let's look at an example to see how it works.

Imagine our source code is just this:

```tsx
// ./src/index.ts
export const sum = (a: number, b: number) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('Helpful dev-only error message');
  }
  return a + b;
};
```

`foreach-tsdx build` will output an ES module file and 3 CommonJS files (dev, prod, and an entry file). If you want to specify a UMD build, you can do that as well. For brevity, let's examine the CommonJS output (comments added for emphasis):

```js
// Entry File
// ./dist/index.js
'use strict';

// This determines which build to use based on the `NODE_ENV` of your end user.
if (process.env.NODE_ENV === 'production') {
  module.exports = require('./mylib.cjs.production.js');
} else {
  module.exports = require('./mylib.cjs.development.js');
}
```

```js
// CommonJS Development Build
// ./dist/mylib.cjs.development.js
'use strict';

const sum = (a, b) => {
  {
    console.log('Helpful dev-only error message');
  }

  return a + b;
};

exports.sum = sum;
//# sourceMappingURL=mylib.cjs.development.js.map
```

```js
// CommonJS Production Build
// ./dist/mylib.cjs.production.js
'use strict';
exports.sum = (s, t) => s + t;
//# sourceMappingURL=test-react-tsdx.cjs.production.js.map
```

AS you can see, TSDX stripped out the development check from the production code. **This allows you to safely add development-only behavior (like more useful error messages) without any production bundle size impact.**

For ESM build, it's up to end-user to build environment specific build with NODE_ENV replace (done by Webpack 4 automatically).

#### Rollup Treeshaking

TSDX's rollup config [removes getters and setters on objects](https://github.com/palmerhq/tsdx/blob/1f6a1b6819bb17678aa417f0df5349bec12f59ac/src/createRollupConfig.ts#L73) so that property access has no side effects. Don't do it.

#### Advanced `babel-plugin-dev-expressions`

TSDX will use `babel-plugin-dev-expressions` to make the following replacements _before_ treeshaking.

##### `__DEV__`

Replaces

```ts
if (__DEV__) {
  console.log('foo');
}
```

with

```js
if (process.env.NODE_ENV !== 'production') {
  console.log('foo');
}
```

**IMPORTANT:** To use `__DEV__` in TypeScript, you need add `declare var __DEV__: boolean` somewhere in your project's type path (e.g. `./types/index.d.ts`).

```ts
// ./types/index.d.ts
declare var __DEV__: boolean;
```

> **Note:** The `dev-expression` transform does not run when `NODE_ENV` is `test`. As such, if you use `__DEV__`, you will need to define it as a global constant in your test environment.

##### `invariant`

Replaces

```js
invariant(condition, argument, argument);
```

with

```js
if (!condition) {
  if ('production' !== process.env.NODE_ENV) {
    invariant(false, argument, argument);
  } else {
    invariant(false);
  }
}
```

Note: TSDX doesn't supply an `invariant` function for you, you need to import one yourself. We recommend https://github.com/alexreardon/tiny-invariant.

To extract and minify error codes in production into a static `codes.json` file, pass an `extractErrors` flag with a URL where you will decode the error code. Example: `tsdx build --extractErrors=https://your-url.com/?invariant=`

##### `warning`

Replaces

```js
warning(condition, argument, argument);
```

with

```js
if ('production' !== process.env.NODE_ENV) {
  warning(condition, argument, argument);
}
```

Note: TSDX doesn't supply a `warning` function for you, you need to import one yourself. We recommend https://github.com/alexreardon/tiny-warning.

### Using lodash

If you want to use a lodash function in your package, TSDX will help you do it the _right_ way so that your library does not get fat shamed on Twitter. However, before you continue, seriously consider rolling whatever function you are about to use on your own. Anyways, here is how to do it right.

First, install `lodash` and `lodash-es` as _dependencies_

```bash
yarn add lodash lodash-es
```

Now install `@types/lodash` to your development dependencies.

```bash
yarn add @types/lodash --dev
```

Import your lodash method however you want, TSDX will optimize it like so.

```tsx
// ./src/index.ts
import kebabCase from 'lodash/kebabCase';

export const KebabLogger = (msg: string) => {
  console.log(kebabCase(msg));
};
```

For brevity let's look at the ES module output.

<!-- prettier-ignore -->
```js
import o from"lodash-es/kebabCase";const e=e=>{console.log(o(e))};export{e as KebabLogger};
//# sourceMappingURL=test-react-tsdx.esm.production.js.map
```

TSDX will rewrite your `import kebabCase from 'lodash/kebabCase'` to `import o from 'lodash-es/kebabCase'`. This allows your library to be treeshakable to end consumers while allowing to you to use `@types/lodash` for free.

> Note: TSDX will also transform destructured imports. For example, `import { kebabCase } from 'lodash'` would have also been transformed to `import o from "lodash-es/kebabCase".

### Error extraction

_This feature is still under development_

After running `--extractErrors`, you will have a `./errors/codes.json` file with all your extracted error codes. This process scans your production code and swaps out your error message strings for a corresponding error code (just like React!). This extraction only works if your error checking/warning is done by a function called `invariant`. Note: you can use either `tiny-invariant` or `tiny-warning`, but you must then import the module as a variable called `invariant` and it should have the same type signature.

After that, you will need to host the decoder somewhere (with the URL that you passed in to `--extractErrors`).

_Simple guide to host error codes to be completed_

## Inspiration

TSDX is ripped out of [Formik's](https://github.com/jaredpalmer/formik) build tooling. TSDX is very similar to [@developit/microbundle](https://github.com/developit/microbundle), but that is because Formik's Rollup configuration and Microbundle's internals have converged around similar plugins over the last year or so.

### Comparison to Microbundle

- TSDX includes out-of-the-box test running via Jest
- TSDX includes a bootstrap command and default package template
- TSDX is 100% TypeScript focused. While yes, TSDX does use Babel to run a few optimizations (related to treeshaking and lodash), it does not support custom babel configurations.
- TSDX outputs distinct development and production builds (like React does) for CJS and UMD builds. This means you can include rich error messages and other dev-friendly goodies without sacrificing final bundle size.

## API Reference

### `foreach-tsdx watch`

```shell
Description
  Rebuilds on any change

Usage
  $ foreach-tsdx watch [options]

Options
  -i, --entry       Entry module(s)
  --output          Specify the relative path to the output directory (default `dist`)
  --target          Specify your target environment  (default `web`)
  --name            Specify name exposed in UMD builds
  --format          Specify module format(s)  (default `cjs,esm`)
  --verbose         Keep outdated console output in watch mode instead of clearing the screen
  --tsconfig        Specify your custom tsconfig path (default `<root-folder>/tsconfig.json`)
  --include-deps    Include all project dependencies in the bundle (default `false`)
  -e, --externals   Specify which libraries to mark as externals
  -g, --globals     Specify wich globals should be aliased to which package (default `react=React,jquery=jQuery`)
  --inline-css      Inlines the css in the JS bundle (default `false`)
  -h, --help        Displays this message

Examples
  $ foreach-tsdx watch --entry src/foo.tsx
  $ foreach-tsdx watch --output build
  $ foreach-tsdx watch --target node
  $ foreach-tsdx watch --name Foo
  $ foreach-tsdx watch --format cjs,esm,umd
  $ foreach-tsdx watch --tsconfig ./tsconfig.foo.json
  $ foreach-tsdx watch --include-deps
  $ foreach-tsdx watch --externals jquery,react
  $ foreach-tsdx watch --globals jquery=jQuery,react=React
  $ foreach-tsdx watch --inline-css
```

### `foreach-tsdx build`

```shell
Description
  Build your project once and exit

Usage
  $ foreach-tsdx build [options]

Options
  -i, --entry       Entry module(s)
  --output          Specify the relative path to the output directory (default `dist`)
  --target          Specify your target environment  (default `web`)
  --name            Specify name exposed in UMD builds
  --format          Specify module format(s)  (default `cjs,esm`)
  --extractErrors   Specify url for extracting error codes
  --tsconfig        Specify your custom tsconfig path (default `<root-folder>/tsconfig.json`)
  --include-deps    Include all project dependencies in the bundle (default `false`)
  -e, --externals   Specify which libraries to mark as externals
  -g, --globals     Specify wich globals should be aliased to which package (default `react=React,jquery=jQuery`)
  --inline-css      Inlines the css in the JS bundle (default `false`)
  -h, --help        Displays this message

Examples
  $ foreach-tsdx build --entry src/foo.tsx
  $ foreach-tsdx build --output build
  $ foreach-tsdx build --target node
  $ foreach-tsdx build --name Foo
  $ foreach-tsdx build --format cjs,esm,umd
  $ foreach-tsdx build --extractErrors=https://reactjs.org/docs/error-decoder.html?invariant=
  $ foreach-tsdx build --tsconfig ./tsconfig.foo.json
  $ foreach-tsdx build --include-deps
  $ foreach-tsdx build --externals jquery,react
  $ foreach-tsdx build --globals jquery=jQuery,react=React
  $ foreach-tsdx build --inline-css
```

### `foreach-tsdx test`

This runs Jest v24.x in watch mode. See [https://jestjs.io](https://jestjs.io) for options. If you are using the React template, jest uses the flag `--env=jsdom` by default.

## Author

- [Jared Palmer](https://twitter.com/jaredpalmer)

## License

[MIT](https://oss.ninja/mit/jaredpalmer/)
