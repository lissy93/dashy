<template>
  <div
    @click="itemClicked($event)"
    @auxclick="itemAuxClicked($event)"
    :class="`side-bar-item ${icon ? 'w-icon' : 'text-only'}`"
    v-tooltip="tooltip"
  >
    <Icon v-if="icon" :icon="icon" size="small" :url="url" />
    <p class="small-title" v-else>{{ title }}</p>
    <button
      v-if="url"
      class="popout-btn"
      :title="$t ? $t('context-menus.item.newtab') : 'Open in new tab'"
      :aria-label="$t ? $t('context-menus.item.newtab') : 'Open in new tab'"
      @click.stop="openInNewTab($event)"
    >
      <NewTabOpenIcon />
    </button>
  </div>
</template>

<script>

import Icon from '@/components/LinkItems/ItemIcon.vue';
import NewTabOpenIcon from '@/assets/interface-icons/open-new-tab.svg';

export default {
  name: 'SideBarItem',
  props: {
    icon: { type: String, default: '' },
    title: { type: String, default: '' },
    url: { type: String, default: '' },
    target: { type: String, default: '' },
    click: { type: Function, default: () => {} },
  },
  emits: ['launch-app'],
  components: {
    Icon,
    NewTabOpenIcon,
  },
  methods: {
    itemClicked(e) {
      if (e && (e.ctrlKey || e.metaKey)) {
        this.openInNewTab(e);
        return;
      }
      if (this.url) this.$emit('launch-app', { url: this.url, target: this.target });
    },
    itemAuxClicked(e) {
      if (e && e.button === 1) {
        this.openInNewTab(e);
      }
    },
    openInNewTab(e) {
      if (e && e.preventDefault) e.preventDefault();
      if (this.url) window.open(this.url, '_blank', 'noopener,noreferrer');
    },
  },
  data() {
    return {
      tooltip: {
        disabled: !this.title,
        content: this.title,
        placement: 'bottom-end',
      },
    };
  },
};
</script>

<style lang="scss" scoped>

div.side-bar-item {
  position: relative;
  color: var(--side-bar-item-color);
  background: var(--side-bar-item-background);
  text-align: center;
  &.text-only {
    background: none;
    border: none;
    box-shadow: none;
    p.small-title {
      margin: 0.1rem 0 0 -0.5rem;
      font-size: 0.6rem;
      transform: rotate(-25deg);
      padding: 0.5rem 0;
    }
  }

  .popout-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 50%;
    right: 4px;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    padding: 2px;
    color: currentColor;
    opacity: 0;
    pointer-events: none;
    border-radius: var(--curve-factor, 4px);
    transition: opacity 0.15s ease-in-out, background 0.15s ease-in-out;

    &:hover,
    &:focus-visible {
      opacity: 1;
      background: rgba(255, 255, 255, 0.15);
      outline: 1px solid currentColor;
      pointer-events: auto;
    }

    svg {
      width: 0.75rem;
      height: 0.75rem;
    }
  }

  &:hover .popout-btn,
  &:focus-within .popout-btn {
    opacity: 0.7;
    pointer-events: auto;
  }
}
</style>
