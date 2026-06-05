<template ref="container">
  <div :class="`item-wrapper wrap-size-${size} span-${makeColumnCount}`" >
    <a @click="itemClicked"
      @long-press="openContextMenu"
      @contextmenu.prevent
      @mouseup.right="openContextMenu"
      v-longPress="true"
      :href="item.url"
      :target="anchorTarget"
      :class="`item ${makeClassList}`"
      v-tooltip="getTooltipOptions()"
      :rel="`${item.rel || 'noopener noreferrer'}`"
      tabindex="0"
      :id="`link-${item.id}`"
      :style="customStyle"
    >
      <!-- Item Text -->
      <div :class="`tile-title  ${!itemIcon? 'bounce no-icon': ''}`" :id="`tile-${item.id}`" >
        <span class="text">{{ item.title }}</span>
        <p class="description">{{ item.description }}</p>
      </div>
      <!-- Item Icon -->
      <Icon :icon="itemIcon" :url="item.url" :size="size" :color="item.color"
        v-bind:style="customStyles" class="bounce" />
      <!-- Small icon, showing opening method on hover -->
      <ItemOpenMethodIcon class="opening-method-icon"
        :isSmall="!itemIcon || size === 'small'"
        :openingMethod="accumulatedTarget"  position="bottom right"
        :hotkey="item.hotkey" />
      <div class="indicators-container">
        <!-- Status indicator dot (if enabled) showing weather service is available -->
        <StatusIndicator
          v-if="enableStatusCheck"
          :statusSuccess="statusResponse?.successStatus"
          :statusText="statusResponse?.message"
          :statusAccessibility="appConfig.statusCheckAccessibility"
        />
        <!-- Status indicator dot (if enabled) showing host ping status -->
        <StatusIndicator
          v-if="isPingCheckEnabled"
          :statusSuccess="pingResponse?.successStatus"
          :statusText="pingResponse?.message"
          :statusTimeout="pingCheckTimeout"
          :statusAccessibility="appConfig.pingCheckAccessibility"
        />
      </div>
      <!-- URL of the item (shown on hover, only on some themes) -->
      <p class="item-url">{{ shortUrl(item.url) }}</p>
      <!-- Edit icon (displayed only when in edit mode) -->
      <EditModeIcon v-if="isEditMode" class="edit-mode-item" @click="openItemSettings()" />
    </a>
    <!-- Right-click context menu -->
    <ContextMenu
      :show="contextMenuOpen && !isAddNew"
      v-click-outside="closeContextMenu"
      :posX="contextPos.posX"
      :posY="contextPos.posY"
      :id="`context-menu-${item.id}`"
      @launchItem="launchItem"
      @openItemSettings="openItemSettings"
      @openMoveItemMenu="openMoveItemMenu"
      @openDeleteItem="openDeleteItem"
    />
    <!-- Edit and move item menu modals -->
    <MoveItemTo v-if="isEditMode" :itemId="item.id" />
    <EditItem v-if="editMenuOpen" :itemId="item.id"
      @closeEditMenu="closeEditMenu"
      :isNew="isAddNew" :parentSectionTitle="parentSectionTitle" />
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue';
import Icon from '@/components/LinkItems/ItemIcon.vue';
import ItemOpenMethodIcon from '@/components/LinkItems/ItemOpenMethodIcon';
import StatusIndicator from '@/components/LinkItems/StatusIndicator';
import MoveItemTo from '@/components/InteractiveEditor/MoveItemTo';
import ContextMenu from '@/components/LinkItems/ItemContextMenu';

const EditItem = defineAsyncComponent(() => import('@/components/InteractiveEditor/EditItem.vue'));
import StoreKeys from '@/utils/StoreMutations';
import ItemMixin from '@/mixins/ItemMixin';
import EditModeIcon from '@/assets/interface-icons/interactive-editor-edit-mode.svg';
import { modalNames } from '@/utils/config/defaults';

export default {
  name: 'Item',
  mixins: [ItemMixin],
  props: {
    itemSize: { type: String, default: '' },
    parentSectionTitle: { type: String, default: '' }, // Title of parent section (for add new)
    isAddNew: Boolean, // Only set if 'fake' item used as Add New button
    sectionWidth: { type: Number, default: undefined }, // Width of parent section
    sectionDisplayData: { type: Object, default: () => ({}) },
  },
  components: {
    Icon,
    ItemOpenMethodIcon,
    StatusIndicator,
    ContextMenu,
    MoveItemTo,
    EditItem,
    EditModeIcon,
  },
  computed: {
    /* Returns either item.icon, or appConfig.defaultIcon, or null */
    itemIcon() {
      return this.item.icon || this.$store.getters.appConfig?.defaultIcon;
    },
    makeColumnCount() {
      if ((this.sectionDisplayData || {}).itemCountX) return this.sectionDisplayData.itemCountX;
      if (this.sectionWidth < 380) return 1;
      if (this.sectionWidth < 520) return 2;
      if (this.sectionWidth < 730) return 3;
      if (this.sectionWidth < 1000) return 4;
      if (this.sectionWidth < 1300) return 5;
      return 0;
    },
    /* Based on item props, adjust class names */
    makeClassList() {
      const { isAddNew, isEditMode, size } = this;
      return `size-${size} ${!this.itemIcon ? 'short' : ''} `
        + `${isAddNew ? 'add-new' : ''} ${isEditMode ? 'is-edit-mode' : ''}`;
    },
    /* Used by certain themes (material), to show animated CSS icon */
    unicodeOpeningIcon() {
      switch (this.accumulatedTarget) {
        case 'newtab': return '"\\f360"';
        case 'sametab': return '"\\f24d"';
        case 'parent': return '"\\f3bf"';
        case 'top': return '"\\f102"';
        case 'modal': return '"\\f2d0"';
        case 'workspace': return '"\\f0b1"';
        case 'clipboard': return '"\\f0ea"';
        case 'newwindow': return '"\\f2d2"';
        default: return '"\\f054"';
      }
    },
  },
  data() {
    return {
      editMenuOpen: false,
    };
  },
  methods: {
    shortUrl(value) {
      if (!value || typeof value !== 'string') {
        return '';
      }
      try {
        // Use URL constructor to parse the input
        const url = new URL(value);
        return url.hostname;
      } catch {
        // If the input is not a valid URL, try to handle it as an IP address
        const ipPattern = /^(\d{1,3}\.){3}\d{1,3}/;
        const match = value.match(ipPattern);
        if (match) {
          return match[0];
        }
        return '';
      }
    },
    /* Returns configuration object for the tooltip */
    getTooltipOptions() {
      if (!this.item.description && !this.item.provider) return {}; // If no description, then skip
      const description = this.item.description || '';
      const providerText = this.item.provider ? `<b>Provider</b>: ${this.item.provider}` : '';
      const lb1 = description && providerText ? '<br>' : '';
      const hotkeyText = this.item.hotkey ? `<br>Press '${this.item.hotkey}' to launch` : '';
      const tooltipText = providerText + lb1 + description + hotkeyText;
      const editText = this.$t('interactive-editor.edit-section.edit-tooltip');
      return {
        content: (this.isEditMode ? editText : tooltipText),
        html: true,
        placement: this.statusResponse || this.pingResponse ? 'left' : 'auto',
        delay: { show: 600, hide: 200 },
        popperClass: `item-description-tooltip tooltip-is-${this.size}`,
      };
    },
    openItemSettings() {
      this.editMenuOpen = true;
      this.contextMenuOpen = false;
      this.$store.commit(StoreKeys.SET_MODAL_OPEN, true);
    },
    /* Ensure conditional is updated, once menu closed */
    closeEditMenu() {
      this.editMenuOpen = false;
    },
    /* Open the modal for moving/ copying item to other section */
    openMoveItemMenu() {
      this.$modal.show(`${modalNames.MOVE_ITEM_TO}-${this.item.id}`);
      this.$store.commit(StoreKeys.SET_MODAL_OPEN, true);
      this.closeContextMenu();
    },
    /* Deletes the current item from the state */
    openDeleteItem() {
      const parentSection = this.$store.getters.getParentSectionOfItem(this.item.id);
      const payload = { itemId: this.item.id, sectionName: parentSection.name };
      this.$store.commit(StoreKeys.REMOVE_ITEM, payload);
      this.closeContextMenu();
    },
  },
  mounted() {
    // If ping checking is enabled, then check ping status
    if (this.isPingCheckEnabled) {
      this.checkPingStatus();
      // If continious ping checking is enabled, then start ever-lasting loop
      if (this.pingCheckInterval > 0) {
        this.pingIntervalId = setInterval(this.checkPingStatus, this.pingCheckInterval * 1000);
      }
    }
    // If status checking is enabled, then check service status
    if (this.enableStatusCheck) {
      this.checkWebsiteStatus();
      // If continious status checking is enabled, then start ever-lasting loop
      if (this.statusCheckInterval > 0) {
        this.intervalId = setInterval(this.checkWebsiteStatus, this.statusCheckInterval * 1000);
      }
    }
  },
  beforeUnmount() {
    // Stop periodic ping-check and status-check when item is destroyed (e.g. navigating in multi-page setup)
    if (this.pingIntervalId) clearInterval(this.pingIntervalId);
    if (this.intervalId) clearInterval(this.intervalId);
  },
};
</script>

<style lang="scss">

.item-wrapper {
  display: flex;
  flex-grow: 1;
  flex-basis: 6rem;
  min-width: 0;
  &.wrap-size-large {
    flex-basis: 12rem;
  }
  &.wrap-size-small {
    flex-grow: revert;
    &.span-1 { min-width: 100%; }
    &.span-2 { min-width: 50%; }
    &.span-3 { min-width: 33%; }
    &.span-4 { min-width: 25%; }
    &.span-5 { min-width: 20%; }
    &.span-6 { min-width: 16%; }
    &.span-7 { min-width: 14%; }
    &.span-8 { min-width: 12.5%; }
  }
  .item-url {
    display: none;
  }
}

.item {
  flex-grow: 1;
  min-width: 0;
  color: var(--item-text-color);
  vertical-align: middle;
  margin: 0.5rem;
  background: var(--item-background);
  text-align: center;
  padding: 2px;
  outline: 2px solid transparent;
  border: 1px solid var(--outline-color);
  border-radius: var(--curve-factor);
  box-shadow: var(--item-shadow);
  cursor: pointer;
  text-decoration: none;
  position: relative;
  transition: all 0.2s ease-in-out 0s;
  &:hover {
    box-shadow: var(--item-hover-shadow);
    background: var(--item-background-hover);
    color: var(--item-text-color-hover);
  }
  &:focus {
    outline: 2px solid var(--primary);
  }
  &.add-new {
    border: 2px dashed var(--primary) !important;
  }
  &.short:not(.size-large) {
    min-height: 2rem;
  }
}

/* Text in tile */
.tile-title {
  white-space: nowrap;
  text-overflow: ellipsis;
  min-width: 0;
  flex: 1 1 auto;
  height: 30px;
  position: relative;
  padding: 0;
  z-index: 2;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  word-break: keep-all;
  overflow: hidden;
  span.text {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    display: block;
  }
}

/* Container for status and ping indicators */
.indicators-container {
  display: flex;
  align-items: center;
  position: absolute;
  top: 0;
  right: 0;
}

.opening-method-icon {
  display: none; // Hidden by default, visible on hover
}

/* Manage hover and focus actions */
.item:hover, .item:focus {
  /* Show opening-method icon */
  .opening-method-icon {
    display: block;
  }

  /* Trigger text-marquee for text that doesn't fit */
  .tile-title.is-overflowing{
    .overflow-dots {
      opacity: 0;
    }
    span.text {
      transform: translateX(calc(100px - 100%));
    }
  }

  /* Apply transformation of icons on hover */
  .tile-icon, .tile-svg  {
    filter: var(--item-icon-transform-hover);
  }
}

/* Edit icon, visible in edit mode */
.item .edit-mode-item {
  width: 1rem;
  height: 1rem;
  position: absolute;
  top: 0.2rem;
  right: 0.2rem;
}

p.description {
  display: none; // By default, we don't show the description
}

/* Specify layout for alternate sized icons */
.item {
  /* Small Tile Specific Themes */
  &.size-small {
    display: flex;
    flex-direction: row-reverse;
    justify-content: flex-end;
    align-items: center;
    height: 2rem;
    padding-top: 0.25rem;
    padding-left: 0.5rem;
    div img {
      width: 2rem;
    }
    .tile-title {
      height: fit-content;
      min-height: 1.2rem;
      text-align: left;
      max-width: 12rem;
      overflow: hidden;
      span.text {
        text-align: left;
        padding-left: 10%;
      }
    }
  }
  /* Medium Tile Specific Themes */
  &.size-medium {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: auto;
    div img {
      width: 2.5rem;
      margin-bottom: 0.25rem;
    }
    .tile-title {
      min-width: 0;
      max-width: min(160px, 100%);
      &.no-icon {
        text-align: left;
        width: 100%;
        max-width: inherit;
        margin-left: 0.5rem;
      }
    }
  }
  /* Large Tile Specific Themes */
  &.size-large {
    display: flex;
    flex-direction: row-reverse;
    justify-content: flex-end;
    text-align: left;
    overflow: hidden;
    align-items: center;
    max-height: 6rem;
    margin: 0.2rem;
    padding: 0.5rem;
    img {
      padding: 0.1rem 0.25rem;
    }
    .tile-title {
      height: auto;
      padding: 0.1rem 0.25rem;
      span.text {
        position: relative;
        font-weight: bold;
        font-size: 1.1rem;
        width: 100%;
      }
      p.description {
        margin: 0;
        display: block;
        white-space: pre-wrap;
        text-overflow: ellipsis;
        font-size: .9em;
        line-height: 1rem;
        height: 2rem;
        overflow: hidden;
      }
    }
  }
  &:before { // Certain themes (e.g. material) show css animated fas icon on hover
    display: none;
    font-family: FontAwesome;
    content: var(--open-icon, "\f054") !important;
  }
}

/* Adjust positioning of status indicator, when in edit mode */
a.item.is-edit-mode {
  &.size-medium .indicators-container { top: 1rem; }
  &.size-small .indicators-container { right: 1rem; }
  &.size-large .indicators-container { top: 1.5rem; }
}

</style>

<!-- An un-scoped style tag, since tooltip is outside this DOM tree -->
<style lang="scss">
.disabled-link {
  pointer-events: none;
}
.tooltip.item-description-tooltip {
  z-index: 7;
}
</style>
