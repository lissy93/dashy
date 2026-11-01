<template>
  <div class="css-editor-outer">
    <!-- Add raw custom CSS -->
    <div class="style-section css-wrapper">
      <h3>{{ $t('config.custom-css.title') }}</h3>
      <textarea class="css-editor" v-model="customCss" />
      <Button class="save-button" :click="save">{{ $t('config.css-save-btn') }}</Button>
      <p class="quick-note">
        <b>{{ $t('config.css-note-label') }}:</b>
        {{ $t('config.css-note-l1') }} {{ $t('config.css-note-l2') }} {{ $t('config.css-note-l3') }}
      </p>
    </div>
    <!-- Theme Selector -->
    <div class="style-section base-theme-wrapper">
      <h3>{{ $t('config.custom-css.base-theme') }}</h3>
      <ThemeSelector :hidePallete="true" />
    </div>
    <!-- UI color configurator -->
    <div class="style-section">
      <CustomThemeMaker :themeToEdit="currentTheme" class="color-config" />
    </div>
  </div>
</template>

<script>

import CustomThemeMaker from '@/components/Settings/CustomThemeMaker';
import ThemeSelector from '@/components/Settings/ThemeSelector';
import Button from '@/components/FormElements/Button';
import StoreKeys from '@/utils/StoreMutations';
import { theme as defaultTheme } from '@/utils/config/defaults';
import { configScope } from '@/utils/config/ConfigHelpers';
import { applyCustomCss } from '@/utils/Theming';

export default {
  name: 'StyleEditor',
  components: {
    Button,
    ThemeSelector,
    CustomThemeMaker,
  },
  computed: {
    appConfig() {
      return this.$store.getters.appConfig;
    },
    currentTheme() {
      return this.appConfig.theme || defaultTheme;
    },
  },
  data() {
    return {
      customCss: '',
    };
  },
  mounted() {
    // Get existing custom styles (if present) from appConfig
    this.customCss = this.appConfig.customCss || '\n\n';
  },
  methods: {
    /* Sanitizes input, saves to browser and store, applies to page and shows message */
    save() {
      const css = this.customCss.replace(/<\/?[^>]+(>|$)/g, '');
      this.$store.commit(StoreKeys.UPDATE_CUSTOM_CSS, css);
      this.saveToBrowser(css);
      applyCustomCss(css);
      this.showSuccessMsg();
      if (css === '') this.reloadPage();
    },
    /* Saves custom CSS to localStorage, scoped to the active page */
    saveToBrowser(css) {
      const key = configScope(this.$store.state.currentConfigInfo.confId).APP_CONFIG;
      const localAppConfig = JSON.parse(localStorage.getItem(key) || '{}');
      localAppConfig.customCss = css;
      localStorage.setItem(key, JSON.stringify(localAppConfig));
    },
    /* Reload the page (only called if removing styles) */
    reloadPage() {
      setTimeout(() => { location.reload(); }, 1500);
    },
    /* Show success toast and lot update */
    showSuccessMsg() {
      this.$toast('Changes saved successfully');
    },
  },
};
</script>

<style lang="scss">

// Main layout
div.css-editor-outer {
  text-align: center;
  padding-bottom: 1rem;
  display: flex;
  flex-direction: column;
  color: var(--foreground);

  .style-section {
    padding: 1rem;
    &:not(:last-child) { border-bottom: 1px dashed var(--config-settings-color); }
    h3 {
      font-size: 1.4rem;
      margin: 0.5rem 0 0.2rem;
    }
  }

  div.css-wrapper {
    display: flex;
    flex-direction: column;
  }
}

// Save button
button.save-button {
  background: var(--config-settings-background);
  color: var(--config-settings-color);
  border: 1px solid var(--config-settings-color);
  &:hover:not(:disabled) {
    background: var(--config-settings-color);
    color: var(--config-settings-background);
  }
}

// CSS textarea input
.css-editor {
  margin: 1rem auto;
  padding: 0.5rem;
  width: 80%;
  height: 8rem;
  max-height: 16rem;
  min-height: 4rem;
  resize: vertical;
  outline: none;
  border: 1px solid var(--config-settings-color);
  border-radius: var(--curve-factor);
  background: var(--transparent-50);
  color: var(--config-settings-color);
  &:focus {
    box-shadow: 0 40px 70px -2px rgba(0, 0, 0, 0.6), 1px 1px 6px var(--config-settings-color);
  }
}

// Info note
p.quick-note {
  text-align: left;
  width: 80%;
  margin: 1rem auto;
  padding: 0.5rem;
  font-size: 0.9rem;
  opacity: var(--dimming-factor);
  border-radius: var(--curve-factor);
}

// Base Theme Selector
.base-theme-wrapper {
  margin: 0 auto;
  span.theme-label {
    display: none;
  }
  div.vs__dropdown-toggle {
    border-color: var(--config-settings-color);
    min-width: 16rem;
    max-width: 32rem;
    height: 2.4rem;
    font-size: 1rem;
    margin: 0.5rem;
  }
  ul.vs__dropdown-menu {
    min-width: 16rem;
    max-width: 32rem;
    background: var(--config-settings-background);
    border-top: 1px solid var(--config-settings-color);
  }
  li.vs__dropdown-option--highlight {
    background: var(--config-settings-color);
    color: var(--config-settings-background);
  }
}

// Theme editor
.color-config.theme-configurator-wrapper {
  background: var(--config-settings-background);
  color: var(--config-settings-color);
  position: relative;
  width: 80%;
  max-width: 32rem;
  margin: 1rem auto;
  box-shadow: none;
  right: 0;
  top: 0;
  max-height: unset;
  .color-row-container {
    text-align: left;
    max-height: unset;
  }
  .misc-input {
    width: 6rem;
  }
  .misc-input.long-input {
    width: 18rem;
  }
}

</style>
