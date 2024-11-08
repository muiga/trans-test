
# Translate Text Plugin

A Vite plugin for translating text in `.ts` and `.tsx` files based on a locale setting.

## Overview

This plugin reads a `translations.json` file containing translations for different locales and replaces translatable strings in the code with their corresponding translations. It uses the `babelParser` and `traverse` libraries to parse and modify the code.

## Features

* Translates text in `.ts` and `.tsx` files based on a locale setting
* Reads translations from a `translations.json` file
* Replaces original strings with translated strings in the code
* Writes extracted keys to a JSON file for later use

## Usage

1. Install the plugin by adding it to your `vite.config.js` file:
```javascript
import { translateTextPlugin } from './translateTextPlugin';

export default {
  plugins: [translateTextPlugin()],
};
Create a translations.json file in the root of your project with the following structure:
json
CopyInsert
{
  "en": {
    "hello": "Hello",
    "world": "World"
  },
  "fr": {
   # Translate Text Plugin

A Vite plugin for translating text in `.ts` and `.tsx` files based on a locale setting.

## Overview

This plugin reads a `translations.json` file containing translations for different locales and replaces translatable strings in the code with their corresponding translations. It uses the `babelParser` and `traverse` libraries to parse and modify the code.

## Features

* Translates text in `.ts` and `.tsx` files based on a locale setting
* Reads translations from a `translations.json` file
* Replaces original strings with translated strings in the code
* Writes extracted keys to a JSON file for later use

## Usage

1. Install the plugin by adding it to your `vite.config.js` file:
```javascript
import { translateTextPlugin } from './translateTextPlugin';

export default {
  plugins: [translateTextPlugin()],
};