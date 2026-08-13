<template>
  <modal
    :name="modalName" @closed="modalClosed"
    :resizable="true" width="50%" height="80%"
    classes="dashy-modal edit-section"
  >
    <div class="interactive-editor-inner" v-if="allowViewConfig">
      <h3>
        {{ $t(`interactive-editor.edit-section.${isAddNew ? 'add' : 'edit'}-section-title`) }}
      </h3>
      <SchemaForm v-model="sectionData" :schema="customSchema" />
      <SaveCancelButtons :saveClick="saveSection" :cancelClick="modalClosed" />
    </div>
    <AccessError v-else />
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue';
import DashySchema from '@/utils/config/ConfigSchema.json';
import StoreKeys from '@/utils/StoreMutations';
import { modalNames } from '@/utils/config/defaults';
import ErrorHandler, { InfoHandler, InfoKeys } from '@/utils/logging/ErrorHandler';
import safeClone from '@/utils/safeClone';
import pruneSchemaDefaults from '@/utils/config/pruneSchemaDefaults';
import { makePageName } from '@/utils/config/ConfigHelpers';
import SaveCancelButtons from '@/components/InteractiveEditor/SaveCancelButtons';
import AccessError from '@/components/Configuration/AccessError';

const SchemaForm = defineAsyncComponent(() => import('@/components/FormElements/SchemaForm.vue'));

/* Curated subset of the section schema: omits `items` (edited per-item elsewhere)
 * and trims displayData to the commonly-tweaked attributes. */
const sectionProps = DashySchema.properties.sections.items.properties;
const displayProps = sectionProps.displayData.properties;
const SECTION_SCHEMA = {
  type: 'object',
  required: DashySchema.properties.sections.items.required,
  properties: {
    name: sectionProps.name,
    icon: sectionProps.icon,
    displayData: {
      type: 'object',
      title: sectionProps.displayData.title,
      description: sectionProps.displayData.description,
      properties: {
        sortBy: displayProps.sortBy,
        rows: displayProps.rows,
        cols: displayProps.cols,
        collapsed: displayProps.collapsed,
        hideForGuests: displayProps.hideForGuests,
      },
    },
  },
};

export default {
  name: 'EditSection',
  components: { SaveCancelButtons, AccessError, SchemaForm },
  props: {
    sectionName: { type: String, default: '' },
    isAddNew: Boolean,
  },
  emits: ['closeEditSection'],
  data() {
    return {
      modalName: modalNames.EDIT_SECTION,
      customSchema: SECTION_SCHEMA,
      sectionData: {},
    };
  },
  computed: {
    allowViewConfig() { return this.$store.getters.permissions.allowViewConfig; },
  },
  mounted() {
    const live = this.isAddNew ? null : this.$store.getters.getSectionByName(this.sectionName);
    this.sectionData = safeClone(live, {});
    this.$modal.show(this.modalName);
  },
  methods: {
    modalClosed() {
      this.$store.commit(StoreKeys.SET_MODAL_OPEN, false);
      this.$emit('closeEditSection');
    },
    /* Section names used as id, so need to be present and unique  */
    validateName(name) {
      if (!name || !name.trim()) return this.$t('interactive-editor.edit-section.missing-name-err');
      const slug = makePageName(name);
      const others = (this.$store.state.config.sections || [])
        .filter((section) => this.isAddNew || (section.name || '') !== this.sectionName);
      if (others.some((section) => makePageName(section.name) === slug)) {
        return this.$t('interactive-editor.edit-section.duplicate-name-err', { name });
      }
      return null;
    },
    saveSection() {
      try {
        /* Form only edits metadata, so preserve the live section's items array. */
        const payload = pruneSchemaDefaults(this.sectionData, this.customSchema);
        const nameError = this.validateName(payload.name);
        if (nameError) { this.$toast.error(nameError); return; }
        if (!this.isAddNew) {
          const live = this.$store.getters.getSectionByName(this.sectionName);
          if (live?.items) payload.items = live.items;
          this.$store.commit(StoreKeys.UPDATE_SECTION, { sectionName: this.sectionName, sectionData: payload });
        } else {
          this.$store.commit(StoreKeys.INSERT_SECTION, payload);
        }
        this.$store.commit(StoreKeys.SET_EDIT_MODE, true);
        const label = payload.name || '(unnamed)';
        InfoHandler(`Section ${this.isAddNew ? 'added' : 'updated'}: ${label}`, InfoKeys.EDITOR);
        this.$emit('closeEditSection');
      } catch (e) {
        ErrorHandler('Failed to save section', e);
        this.$toast.error('Error saving changes. See Logs.');
      }
    },
  },
};
</script>

<style lang="scss">
@import '@/styles/style-helpers.scss';
</style>
