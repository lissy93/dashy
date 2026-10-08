# Internationalization

Internationalization is the process of making an application available in other languages. This is important, as not everyone is a native English speaker. This page explains how you can switch languages, how to add a new language, and how to make text translatable when writing a new component.

- [Setting your Language](#setting-language)
- [Adding a new Language](#adding-a-new-language)
- [Adding New Text to a Component](#adding-new-text-to-a-component)

---

## Setting Language

By default, Dashy will attempt to use the language of your browser or system. If a translation for your language does not yet exist, it will fallback to English.

### In the UI

You can manually select your language in the UI. Under the Config Menu, click the Language button, and select your language from the dropdown menu. Your preference will be saved in local storage.

### Config File

You can also set your language in the config file. Specify the ISO code of one of the supported languages, under `appConfig.language`. For example:

```yaml
appConfig:
  language: de
```

### Available Languages

At the time of writing the following languages are supported: `en`, `en-GB`, `ar`, `bg`, `bn`, `cs`, `da`, `de`, `el`, `es`, `fr`, `gl`, `hi`, `hu`, `it`, `ja`, `ko`, `nb`, `nl`, `pl`, `pt`, `ro`, `ru`, `sk`, `sl`, `sv`, `sw`, `tr`, `uk`, `zh-CN`, `zh-TW`, but an up-to-date list of all implemented translations can be found in [`./src/utils/languages.js`](https://github.com/Lissy93/dashy/blob/master/src/utils/languages.js).  Languages are specified by their 2-digit [ISO-639 code](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes), or sometimes a 4-digit code if it's a regional dialect.

---

## Adding a new Language

Dashy is using [vue-i18n](https://vue-i18n.intlify.dev/guide/) to manage multi-language support.

Adding a new language is pretty straightforward, with just three steps:

### 1. Create a new Language File

Create a new JSON file in `./src/assets/locales` for your language.

You should name it with the 2-digit [ISO-639 code](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) for your locale (e.g. for German `de.json`, French `fr.json` or Spanish `es.json`) - You can find a list of all ISO codes at [iso.org](https://www.iso.org/obp/ui).
If your language is a specific dialect or regional translation, then use the Posfix [CLDR](http://cldr.unicode.org/) format, where, e.g. `en-GB.json` (British English), `es-MX.json` (Spanish, in Mexico) or `zh-CN.json` (Chinese, simplified) - A list of which can be found [here](https://github.com/unicode-org/cldr-json/blob/master/cldr-json/cldr-core/availableLocales.json)

### 2. Translate

Using [`en.json`](https://github.com/Lissy93/dashy/tree/master/src/assets/locales/en.json) as an example, translate the JSON values to your language, while leaving the keys as they are. It's fine to leave out certain items, as if they're missing they will fall-back to English. If you see any attribute which include curly braces (`{xxx}`), then leave the inner value of these braces as is, as this is for variables.

```json
{
  "theme-maker": {
    "export-button": "Benutzerdefinierte Variablen exportieren",
    "reset-button": "Stile zurücksetzen für",
    "show-all-button": "Alle Variablen anzeigen",
    "save-button": "Speichern",
    "cancel-button": "Abbrechen",
    "saved-toast": "{theme} Erfolgreich aktualisiert",
    "reset-toast": "Benutzerdefinierte Farben für {theme} entfernt"
  },
}
```

### 3. Add your file to the app

In [`./src/utils/languages.js`](https://github.com/Lissy93/dashy/tree/master/src/utils/languages.js), add your language's metadata to the `languages` array:

```javascript
export const languages = [
  { name: 'English', code: 'en', flag: '🇬🇧' },
  { name: 'German', code: 'de', flag: '🇩🇪' }, // The name, ISO code, and flag emoji for your language
];
```

You can also add your new language to the readme, under the [Language Switching](https://github.com/Lissy93/dashy#language-switching) section and optionally include your name/ username if you'd like to be credited for your work. Done!

If you are not comfortable with making pull requests, or do not want to modify the code, then feel free to instead send the translated file to me, and I can add it into the application. I will be sure to credit you appropriately.

---

## Checking Translation Coverage

We've got a short test/lint script for verifying translation files are complete and valid, and to show per-language coverage report.

```bash
yarn validate-locales
```

This will run the following checks:
- Ensure all locale files are registered, present and parsable (failure)
- Non-existing translations used in the code, not present in en.json (failure)
- Translations in en.json never used anywhere in the code (warn)
- Translations in other locales not used in en.json or code (warn)
- Missing translations in other locales compared to en.json (coverage report)

This script is located in [`tests/locales/check-locales.js`](https://github.com/lissy93/dashy/blob/master/tests/locales/check-locales.js), and can be executed directly, or with `yarn validate-locales` and is also run as part of the CI workflow on PRs.

---

## Adding New Text to a Component

If you're working on a new component, then any text that is displayed to the user should be extracted out of the component, and stored in the file. This also applies to any existing components, that might have been forgotten to be translated. Thankfully, everything is already setup, so this is a pretty easy job.

### 1. Add Translated Text

Firstly, go to [`./src/assets/locales/en.json`](https://github.com/Lissy93/dashy/blob/master/src/assets/locales/en.json), and either find the appropriate section, or create a new section. Lets say you're new component is called `my-widget`, you could add `"my-widget": {}` to store all your text as key-value-pairs. E.g.

```json
"my-widget": {
	"awesome-text": "I am some text, that will be seen by the user"
}
```

Note that you **must** add English translations for all text. Missing languages are not a problem, as they will always fallback to English, but if the English is missing, then nothing can be displayed.

### 2. Use Text within Component

Once your text is in the translation file, you can now use it within your component. There is a global `$t` function, with takes the key of your new translation, and returns the value. For example:

```vue
<p>{{ $t('my-widget.awesome-text') }}</p>
```

Note that the `{{ }}` just tells Vue that this is JavaScript/ dynamic.
This will render: `<p>I am some text, that will be seen by the user</p>`

If you need to display text programmatically, from within the components JavaScript (e.g. in a toast popup), then use `this.$t`.
For example: `alert(this.$t('my-widget.awesome-text'))`.

You may also need to pass a variable to be displayed within a translation. Vue I18n supports [Interpolations](https://vue-i18n.intlify.dev/guide/essentials/syntax.html#interpolations) using mustache-like syntax.

For example, you would set your translation to:

```json
{
	"welcome-message": "Hello {name}!"
}
```

And then pass that variable (`name`) within a JSON object as the second parameter on `$t`, like:

```javascript
$t('welcome-message', { name: 'Alicia' })
```

Which will render:

```text
Hello Alicia!
```

There are many other advanced features, including  Pluralization,  Datetime & Number Formatting, Message Support and more, all of which are outlined in the [Vue-i18n Docs](https://vue-i18n.intlify.dev/guide/).

### Basic Example

Using the search bar as an example, this would look something like:

In [`./src/components/Settings/SearchBar.vue`](https://github.com/Lissy93/dashy/blob/master/src/components/Settings/SearchBar.vue):

```vue
<template>
  <form>
    <label for="search-input">{{ $t('search.search-label') }}</label>
    <input
      v-model="searchValue"
      :placeholder="$t('search.search-placeholder')"
    />
  </form>
</template>
```

Then in [`./src/assets/locales/en.json`](https://github.com/Lissy93/dashy/blob/master/src/assets/locales/en.json):

```json
{
"search": {
    "search-label": "Search",
    "search-placeholder": "Start typing to filter",
  },
  ...
}
```
