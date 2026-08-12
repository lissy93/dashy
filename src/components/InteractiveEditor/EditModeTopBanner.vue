<template>
  <div class="edit-mode-top-banner">
    <span>{{ $t('interactive-editor.menu.edit-mode-enabled') }}</span>
  </div>
</template>

<style scoped lang="scss">
div.edit-mode-top-banner {
  width: 100%;
  text-align: center;
  padding: 0.2rem 0;
  background: var(--interactive-editor-color);
  opacity: var(--dimming-factor);
  span {
    font-size: 1rem;
    font-weight: bold;
    color: var(--interactive-editor-background);
  }
}
</style>
