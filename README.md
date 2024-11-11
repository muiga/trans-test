
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
 Create a translations.json file in a locales folder in the root of your project with the following structure:
 json
 CopyInsert
{
  "en": {
    "hello": "Hello",
    "world": "World",
    ...
  },
  "fr": {
    "hello": "Hello",
    ...
  }  
}
  
# Translate Text Plugin;

A Vite plugin for translating text in `.ts` and `.tsx` files based on a locale setting.

## Overview

This plugin reads a `translations.json` file containing translations for different locales 
and replaces translatable strings in the code with their corresponding translations.
It uses the `babelParser` and `traverse` libraries to parse and modify the code.

## Features

* Translates text in `.ts` and `.tsx` files based on a locale setting
* Reads translations from a `translations.json` file
* Replaces original strings with translated strings in the code
* Writes extracted keys to a JSON file for later use

## Usage

1. Create a component "Trans" to wrap an text to be translated. Preferably the text should have
meaning together and could be a phrase, sentence or even paragraph.

2. Each Trans Component is independent and thus should not be nested inside another Trans component. The 
component should be used as "<Trans>text to be transalated</Trans>". Html tags add react expressions 
like {count} are allowed between the components tags.

3. For other text not in the jsx. Create a function "trans". as in the exanple "trans('text to translate')" 

4. Install the plugin by adding it to your `vite.config.js` file:

import { translateTextPlugin } from './translateTextPlugin';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [translateTextPlugin(env), ...otherPlugins],
  };
});




