# Contributing to FOREACH-TSDX

Thanks for your interest in TSDX! You are very welcome to contribute. If you are proposing a new feature, make sure to [open an issue](https://github.com/Jarrku/foreach-tsdx/issues/new/choose) to make sure it is inline with the project goals.

## Setup

0. First, remove any existing `foreach-tsdx` global installations that may conflict.

   ```
   yarn global remove foreach-tsdx # or npm uninstall -g foreach-tsdx
   ```

1. Fork this repository to your own GitHub account and clone it to your local device:

   ```
   git clone https://github.com/your-name/foreach-tsdx.git
   cd foreach-tsdx
   ```

1. Install the dependencies and build the Typescript files to Javascript:

   ```
   yarn && yarn build
   ```

   > **Note:** you'll need to run `yarn build` any time you want to see your changes, or run `yarn watch` to leave it in watch mode.

1. Make it so running `foreach-tsdx` anywhere will run your local dev version:

   ```
   yarn link
   ```

4) To use your local version when running `yarn build`/`yarn start`/`yarn test` in a TSDX project, run this in the project:

   ```
   yarn link foreach-tsdx
   ```

   You should see a success message: `success Using linked package for "foreach-tsdx".` The project will now use the locally linked version instead of a copy from `node_modules`.

## Submitting a PR

Be sure to run `yarn test` before you make your PR to make sure you haven't broken anything.
