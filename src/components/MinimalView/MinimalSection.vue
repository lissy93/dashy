<template>
  <div
    :class="`minimal-section-inner ${selected ? 'selected' : ''} ${showAll ? 'show-all': ''}`"
    :style="dynamicStyle">
    <div class="section-items" :style="gridStyle" v-if="items && (selected || showAll)">
      <template v-for="(item) in sortedItems" :key="item.id">
        <SubItemGroup
          v-if="item.subItems"
          :itemId="item.id"
          :title="item.title"
          :subItems="item.subItems"
          @triggerModal="triggerModal"
        />
        <Item
          v-else
          :item="item"
          :itemSize="itemSize"
          :parentSectionTitle="title"
          @itemClicked="$emit('itemClicked')"
          @triggerModal="triggerModal"
          :isAddNew="false"
          :sectionDisplayData="displayData"
        />
      </template>
    </div>
    <div v-if="widgets && (selected && !showAll)" class="minimal-widget-wrap">
      <WidgetBase
        v-for="(widget, widgetIndx) in widgets"
        :key="widgetIndx"
        :widget="widget"
        :index="widgetIndx"
        @navigateToSection="navigateToSection"
      />
    </div>
    <div v-if="selected && !showAll && !widgets && items.length < 1" class="empty-section">
      <p>{{ $t('home.no-items-section') }}</p>
    </div>
    <IframeModal
      :ref="`iframeModal-${groupId}`"
      :name="`iframeModal-${groupId}`"
      @closed="$emit('itemClicked')"
    />
  </div>
</template>

<script>
import router from '@/router';
import Item from '@/components/LinkItems/Item.vue';
import WidgetBase from '@/components/Widgets/WidgetBase';
import SubItemGroup from '@/components/LinkItems/SubItemGroup.vue';
import IframeModal from '@/components/LinkItems/IframeModal.vue';
import sortItems from '@/utils/SortItems';
import { makeRoutePath, viewFromPath } from '@/utils/config/ConfigHelpers';

export default {
  name: 'ItemGroup',
  props: {
    groupId: { type: String, required: true },
    title: { type: String, default: '' },
    icon: { type: String, default: '' },
    displayData: { type: Object, required: true },
    items: { type: Array, default: () => [] },
    widgets: { type: Array, default: () => [] },
    modalOpen: Boolean,
    index: { type: Number, required: true },
    selected: Boolean,
    showAll: Boolean,
  },
  emits: ['itemClicked', 'sectionSelected'],
  computed: {
    appConfig() {
      return this.$store.getters.appConfig;
    },
    /* Mirror Section.vue: per-section override wins, otherwise the current
     * icon size (localStorage + appConfig) chosen by the user */
    itemSize() {
      return (this.displayData && this.displayData.itemSize) || this.$store.getters.iconSize;
    },
    /* Same itemCountX/Y handling as the home view */
    gridStyle() {
      const d = this.displayData || {};
      const parts = [];
      if (d.itemCountX) parts.push(`grid-template-columns: repeat(${d.itemCountX}, minmax(0, 1fr))`);
      if (d.itemCountY) parts.push(`grid-template-rows: repeat(${d.itemCountY}, auto)`);
      return parts.join('; ');
    },
    /* Respect sortBy exactly as the home view does; `disableSmartSort` opt-out */
    sortedItems() {
      if (this.appConfig.disableSmartSort) return [...(this.items || [])];
      const order = (this.displayData && this.displayData.sortBy) || undefined;
      return sortItems(this.items || [], order, this.title);
    },
    /* Apply per-section `color` (background tint) and sanitized `customStyles` */
    dynamicStyle() {
      const d = this.displayData || {};
      const parts = [];
      if (d.color) parts.push(`background: ${d.color}`);
      if (d.customStyles) parts.push(d.customStyles.replace(/[^a-zA-Z0-9- :;.]/g, ''));
      return parts.join('; ');
    },
  },
  components: {
    Item,
    WidgetBase,
    SubItemGroup,
    IframeModal,
  },
  methods: {
    selectSection(index) {
      this.$emit('sectionSelected', index);
    },
    /* Returns a unique lowercase string, based on name, for section ID */
    makeId(str) {
      if (!str) return 'unnamed-item';
      return str.replace(/\s+/g, '-').replace(/[^a-zA-Z ]/g, '').toLowerCase();
    },
    /* Opens the iframe modal */
    triggerModal(url) {
      this.$refs[`iframeModal-${this.groupId}`].show(url);
    },
    shouldEnableStatusCheck(itemPreference) {
      const globalPreference = this.appConfig.statusCheck || false;
      return itemPreference !== undefined ? itemPreference : globalPreference;
    },
    getStatusCheckInterval() {
      let interval = this.appConfig.statusCheckInterval;
      if (!interval) return 0;
      if (interval > 60) interval = 60;
      if (interval < 1) interval = 0;
      return interval;
    },
    getPingCheckInterval() {
      let interval = this.item.pingCheckInterval;
      if (!interval) interval = this.appConfig.pingCheckInterval;
      if (!interval) return 0;
      interval = Math.floor(interval);
      if (interval < 0) interval = 0;
      if (interval > 5) interval = 5;
      return interval;
    },
    /* Navigate to the section's single-section view page, staying within the current
     * view and loaded sub-page context */
    navigateToSection() {
      const view = viewFromPath(this.$route.path);
      const confId = this.$store.state.currentConfigInfo?.confId || null;
      router.push({ path: makeRoutePath(view, confId, this.title) });
    },
  },
};
</script>

<style scoped lang="scss">
@import '@/styles/media-queries.scss';
@import '@/styles/style-helpers.scss';

.minimal-section-inner {
  height: 100%;
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  background: var(--minimal-view-group-background);
  border-radius: 0 0 var(--curve-factor) var(--curve-factor);
  .section-items {
    display: grid;
    @include phone { --minimal-col-count: 1; }
    @include tablet { --minimal-col-count: 2; }
    @include laptop { --minimal-col-count: 3; }
    @include monitor { --minimal-col-count: 4; }
    @include big-screen { --minimal-col-count: 5; }
    @include big-screen-up { --minimal-col-count: 6; }
    grid-template-columns: repeat(var(--minimal-col-count, 1), minmax(0, 1fr));
  }
  .minimal-widget-wrap {
    padding: 1rem;
  }
  .empty-section {
    padding: 1rem;
    margin: 0.5rem auto;
    color: var(--minimal-view-group-color);
    font-size: 1rem;
    font-style: italic;
    opacity: var(--dimming-factor);
  }
  &.selected {
    border: 1px solid var(--minimal-view-group-color);
    &:not(.show-all) { min-height: 300px; }
  }
  &.show-all {
    border: none;
  }
}

</style>
