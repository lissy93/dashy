<template>
  <modal
    :name="modalName"
    :resizable="true"
    width="50%"
    height="80%"
    classes="dashy-modal edit-widget"
    @closed="modalClosed"
  >
    <div class="interactive-editor-inner edit-widget-inner" v-if="allowViewConfig">
      <h3 class="title">
        {{ $t(`interactive-editor.edit-widget.${isAddNew ? 'add' : 'edit'}-widget-title`) }}
      </h3>
      <Input
        v-model="form.type"
        :label="$t('interactive-editor.edit-widget.type-label')"
        layout="horizontal"
      />
      <Input
        v-model="form.label"
        :label="$t('interactive-editor.edit-widget.label-label')"
        layout="horizontal"
      />
      <Input
        v-model="form.updateInterval"
        :label="$t('interactive-editor.edit-widget.update-interval-label')"
        type="number"
        layout="horizontal"
      />
      <Input
        v-model="form.timeout"
        :label="$t('interactive-editor.edit-widget.timeout-label')"
        type="number"
        layout="horizontal"
      />
      <Radio
        v-model="form.useProxy"
        :label="$t('interactive-editor.edit-widget.use-proxy-label')"
        :options="boolRadioOptions"
        :initialOption="form.useProxy"
      />
      <Radio
        v-model="form.ignoreErrors"
        :label="$t('interactive-editor.edit-widget.ignore-errors-label')"
        :options="boolRadioOptions"
        :initialOption="form.ignoreErrors"
      />

      <div v-if="currentOptionDefinitions.length">
        <h4 class="options-heading">Calendar options</h4>
        <div
          class="row option-row"
          v-for="option in currentOptionDefinitions"
          :key="option.name"
        >
          <Input
            v-if="option.type === 'text' || option.type === 'number' || option.type === 'password'
              || option.type === 'text'
            "
            :type="option.type"
            v-model="form.options[option.name]"
            :label="option.label"
            :description="option.description"
            layout="horizontal"
          />
          <Radio
            v-else-if="option.type === 'boolean'"
            v-model="form.options[option.name]"
            :label="option.label"
            :description="option.description"
            :options="boolRadioOptions"
            :initialOption="boolToStr(form.options[option.name])"
          />
        </div>
      </div>

      <h4 class="options-heading">Additional options</h4>
      <div class="row option-row" v-for="(opt, i) in optionRows" :key="i">
        <Input
          v-model="opt.key"
          :placeholder="$t('interactive-editor.edit-widget.key-placeholder')"
          layout="horizontal"
        />
        <Input
          v-model="opt.value"
          :placeholder="$t('interactive-editor.edit-widget.value-placeholder')"
          layout="horizontal"
        />
        <BinIcon @click="removeOption(i)" />
      </div>
      <span class="add-field-tag" @click="addOption">
        <AddIcon /> {{ $t('interactive-editor.edit-widget.add-option-btn') }}
      </span>
      <SaveCancelButtons :saveClick="saveWidget" :cancelClick="closeModal" />
    </div>
    <AccessError v-else />
  </modal>
</template>

<script>
import AddIcon from '@/assets/interface-icons/interactive-editor-add.svg';
import BinIcon from '@/assets/interface-icons/interactive-editor-remove.svg';
import SaveCancelButtons from '@/components/InteractiveEditor/SaveCancelButtons';
import AccessError from '@/components/Configuration/AccessError';
import Input from '@/components/FormElements/Input';
import Radio from '@/components/FormElements/Radio';
import StoreKeys from '@/utils/StoreMutations';
import safeClone from '@/utils/safeClone';
import { modalNames } from '@/utils/config/defaults';
import ErrorHandler, { InfoHandler, InfoKeys } from '@/utils/logging/ErrorHandler';

const emptyForm = () => ({
  type: '',
  label: '',
  updateInterval: '',
  timeout: '',
  useProxy: '',
  ignoreErrors: '',
  options: {},
});

/* Coerce a string from a free-form options input back to its likely native type. */
const coerceValue = (raw) => {
  if (typeof raw !== 'string') return raw;
  const trimmed = raw.trim();
  if (trimmed === '') return '';
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (/^-?\d+$/.test(trimmed)) return parseInt(trimmed, 10);
  if (/^-?\d*\.\d+$/.test(trimmed)) return parseFloat(trimmed);
  return raw;
};

const widgetOptionDefinitions = {
  'nextcloud-calendar': [
    {
      name: 'icsUrl',
      label: 'Calendar URL',
      description: 'Public ICS export URL or shared calendar export URL.',
      type: 'text',
    },
    {
      name: 'calendarId',
      label: 'Calendar ID',
      description: 'Nextcloud calendar ID for authenticated calendars.',
      type: 'text',
    },
    {
      name: 'username',
      label: 'Username',
      description: 'Optional. Only required for private Nextcloud calendars that need authentication.',
      type: 'text',
    },
    {
      name: 'password',
      label: 'Password',
      description: 'Optional. Use only with authenticated Nextcloud calendar access (app password or account password).',
      type: 'password',
    },
    {
      name: 'pastDays',
      label: 'Include recent past days',
      description: 'Number of past days to show. Set 0 to show only future events.',
      type: 'number',
    },
    {
      name: 'limit',
      label: 'Event count',
      description: 'Maximum upcoming events to display.',
      type: 'number',
    },
    {
      name: 'taskLimit',
      label: 'Task count',
      description: 'Maximum tasks to display.',
      type: 'number',
    },
  ],
};

const getWidgetOptionDefinitions = (widgetType) => widgetOptionDefinitions[(widgetType || '').toLowerCase()] || [];

export default {
  name: 'EditWidget',
  components: {
    Input, Radio, AddIcon, BinIcon, AccessError, SaveCancelButtons,
  },
  props: {
    sectionName: { type: String, required: true },
    widgetIndex: { type: Number, default: -1 },
    isAddNew: Boolean,
  },
  emits: ['closeEditWidget'],
  data() {
    return {
      modalName: modalNames.EDIT_WIDGET,
      form: emptyForm(),
      optionRows: [],
      boolRadioOptions: [
        { label: 'true', value: 'true' },
        { label: 'false', value: 'false' },
      ],
    };
  },
  computed: {
    allowViewConfig() { return this.$store.getters.permissions.allowViewConfig; },
    currentOptionDefinitions() {
      return getWidgetOptionDefinitions(this.form.type);
    },
  },
  /* Populate form before children render so Radio's `initialOption` is set on its first creation. */
  created() {
    if (this.isAddNew) return;
    const live = this.$store.getters.getSectionByName(this.sectionName);
    const widget = safeClone(live?.widgets?.[this.widgetIndex], {});
    this.form = {
      type: widget.type || '',
      label: widget.label || '',
      updateInterval: widget.updateInterval ?? '',
      timeout: widget.timeout ?? '',
      useProxy: widget.useProxy === undefined ? '' : String(widget.useProxy),
      ignoreErrors: widget.ignoreErrors === undefined ? '' : String(widget.ignoreErrors),
      options: Object.fromEntries(
        Object.entries(widget.options || {}).map(([key, value]) => [
          key,
          typeof value === 'object' ? JSON.stringify(value) : String(value),
        ]),
      ),
    };
    const reservedKeys = getWidgetOptionDefinitions(widget.type || this.form.type).map((field) => field.name);
    this.optionRows = Object.entries(widget.options || {})
      .filter(([key]) => !reservedKeys.includes(key))
      .map(([key, value]) => ({
        key,
        value: typeof value === 'object' ? JSON.stringify(value) : String(value),
      }));
  },
  mounted() {
    this.$modal.show(this.modalName);
  },
  methods: {
    addOption() {
      this.optionRows.push({ key: '', value: '' });
    },
    removeOption(index) {
      this.optionRows.splice(index, 1);
    },
    /* Build a clean widget object, omitting empty/default fields so they don't bloat the YAML. */
    buildWidget() {
      const widget = { type: this.form.type.trim() };
      if (this.form.label) widget.label = this.form.label;
      if (this.form.updateInterval !== '' && this.form.updateInterval !== null) {
        widget.updateInterval = Number(this.form.updateInterval);
      }
      if (this.form.timeout !== '' && this.form.timeout !== null) {
        widget.timeout = Number(this.form.timeout);
      }
      if (this.form.useProxy === 'true') widget.useProxy = true;
      else if (this.form.useProxy === 'false') widget.useProxy = false;
      if (this.form.ignoreErrors === 'true') widget.ignoreErrors = true;
      else if (this.form.ignoreErrors === 'false') widget.ignoreErrors = false;
      const options = {};
      Object.entries(this.form.options || {}).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          options[key] = coerceValue(value);
        }
      });
      this.optionRows.forEach(({ key, value }) => {
        const k = (key || '').trim();
        if (k) options[k] = coerceValue(value);
      });
      if (Object.keys(options).length) widget.options = options;
      return widget;
    },
    saveWidget() {
      if (!this.form.type || !this.form.type.trim()) {
        this.$toast.error(this.$t('interactive-editor.edit-widget.missing-type-err'));
        return;
      }
      try {
        const widget = this.buildWidget();
        if (this.isAddNew) {
          this.$store.commit(StoreKeys.INSERT_WIDGET, { sectionName: this.sectionName, widget });
        } else {
          this.$store.commit(StoreKeys.UPDATE_WIDGET, {
            sectionName: this.sectionName,
            widgetIndex: this.widgetIndex,
            widget,
          });
        }
        this.$store.commit(StoreKeys.SET_EDIT_MODE, true);
        InfoHandler(`Widget ${this.isAddNew ? 'added' : 'updated'}: ${widget.type}`, InfoKeys.EDITOR);
        this.closeModal();
      } catch (e) {
        ErrorHandler('Failed to save widget', e);
        this.$toast.error('Error saving widget. See Logs.');
      }
    },
    boolToStr(value) {
      if (value === true || value === 'true') return 'true';
      if (value === false || value === 'false') return 'false';
      return '';
    },
    closeModal() {
      this.$modal.hide(this.modalName);
    },
    modalClosed() {
      this.$store.commit(StoreKeys.SET_MODAL_OPEN, false);
      this.$emit('closeEditWidget');
    },
  },
};
</script>

<style lang="scss">
@import '@/styles/style-helpers.scss';

.edit-widget-inner {
  @extend .svg-button;
  h3.title { font-size: 1.5rem; margin: 0.25rem 0; }
  h4.options-heading { margin: 1rem 0 0.5rem; }
  .row.option-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0;
    .input-container { flex: 1; }
  }
  .add-field-tag {
    display: inline-flex;
    align-items: center;
    margin: 0.5rem 0.2rem;
    padding: 0.2rem 0.5rem;
    cursor: pointer;
    border: 1px solid var(--interactive-editor-color);
    border-radius: var(--curve-factor);
    &:hover {
      background: var(--interactive-editor-color);
      color: var(--interactive-editor-background);
    }
    svg { margin-right: 0.25rem; border: none; }
  }
  /* Match EditItem's local form-element overrides for theme consistency */
  div.input-container input.input-field,
  .radio-container div.radio-wrapper {
    color: var(--interactive-editor-color);
    border-color: var(--interactive-editor-color);
    background: var(--interactive-editor-background);
  }
  svg {
    path { fill: var(--interactive-editor-color); }
    background: var(--interactive-editor-background);
    &:hover, &.selected {
      path { fill: var(--interactive-editor-background); }
      background: var(--interactive-editor-color);
    }
  }
}
</style>
