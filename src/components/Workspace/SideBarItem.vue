<template>
  <div
    @click="itemClicked($event)"
    @auxclick="itemAuxClicked($event)"
    :class="`side-bar-item ${icon ? 'w-icon' : 'text-only'}`"
    v-tooltip="tooltip"
  >
    <Icon v-if="icon" :icon="icon" size="small" :url="url" />
    <p class="small-title" v-else>{{ title }}</p>
  </div>
</template>

<script>

import Icon from '@/components/LinkItems/ItemIcon.vue';

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
}
</style>
