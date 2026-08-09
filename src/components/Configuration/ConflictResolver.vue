<template>
  <div class="conflict-resolver" v-if="conflict">
    <div class="conflict-header">
      <h3>{{ $t('config-editor.conflict-title') }}</h3>
      <p class="conflict-summary">
        {{ $t('config-editor.conflict-summary', { count: changeCount, when: relativeTime }) }}
      </p>
      <div class="conflict-legend">
        <span class="legend-item removed"><span class="marker">-</span>
          {{ $t('config-editor.conflict-theirs-label') }}</span>
        <span class="legend-item added"><span class="marker">+</span>
          {{ $t('config-editor.conflict-yours-label') }}</span>
      </div>
      <button
        type="button"
        class="dismiss-btn"
        :aria-label="$t('config-editor.conflict-review-later')"
        @click="dismiss"
      >&times;</button>
    </div>

    <div ref="mergeEl" class="merge-container"></div>

    <div class="conflict-actions">
      <Button :click="dismiss">{{ $t('config-editor.conflict-review-later') }}</Button>
      <Button :click="keepTheirs">{{ $t('config-editor.conflict-keep-theirs') }}</Button>
      <Button :click="overwrite">{{ $t('config-editor.conflict-overwrite') }}</Button>
      <Button :click="saveMerged" :disallow="!isMergedValid">
        {{ $t('config-editor.conflict-save-merged') }}
      </Button>
    </div>

    <ConfirmDialog
      v-model:open="showOverwriteConfirm"
      danger
      :title="$t('config-editor.conflict-overwrite')"
      :message="$t('config-editor.conflict-overwrite-confirm', { count: changeCount })"
      @confirm="confirmOverwrite"
    />
  </div>
</template>

<script>
import { markRaw } from 'vue';
import { MergeView } from '@codemirror/merge';
import { EditorView } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { yaml } from '@codemirror/lang-yaml';
import { load as yamlLoad, dump as yamlDump } from '@/utils/yaml';
import { toSaveShape } from '@/utils/config/ConfigHelpers';
import Button from '@/components/FormElements/Button';
import ConfirmDialog from '@/components/FormElements/ConfirmDialog';
import ConfigSaving from '@/mixins/ConfigSaving';
import StoreKeys from '@/utils/StoreMutations';

export default {
  name: 'ConflictResolver',
  mixins: [ConfigSaving],
  components: { Button, ConfirmDialog },
  data() {
    return {
      view: null,
      showOverwriteConfirm: false,
      chunkCount: 0,
      // Bumped by a CodeMirror updateListener on every doc/chunk change.
      // The MergeView doc is markRaw'd (not reactive), so without this counter
      // `mergedText`/`isMergedValid`/`changeCount` would never recompute as the
      // user edits the merge buffer or accepts/rejects hunks.
      docVersion: 0,
    };
  },
  computed: {
    conflict() {
      return this.$store.state.saveConflict;
    },
    /* Number of diff hunks, read from the merge view itself so the number in
       the summary can never disagree with what is highlighted on screen.
       Do NOT count differing lines instead - an inserted line shifts every
       line after it, inflating the count to near the length of the file. */
    changeCount() {
      // Reactive dependency only: bumped by an updateListener on every doc/chunk
      // change so this recomputes even though the underlying MergeView doc is
      // markRaw'd and would otherwise never trigger Vue's reactivity
      void this.docVersion;
      return this.chunkCount;
    },
    relativeTime() {
      if (!this.conflict?.theirMtime) return '';
      const mins = Math.round((Date.now() - this.conflict.theirMtime) / 60000);
      if (mins < 1) return this.$t('config-editor.conflict-time-just-now');
      if (mins < 60) return this.$t('config-editor.conflict-time-minutes', { mins });
      return this.$t('config-editor.conflict-time-hours', { hours: Math.round(mins / 60) });
    },
    mergedText() {
      // Same reactive-dependency trick as changeCount above
      void this.docVersion;
      return this.view ? this.view.b.state.doc.toString() : (this.conflict?.yours || '');
    },
    isMergedValid() {
      try {
        const parsed = yamlLoad(this.mergedText);
        return !!parsed && typeof parsed === 'object';
      } catch {
        return false;
      }
    },
  },
  watch: {
    conflict: {
      immediate: true,
      handler(value) {
        if (value) this.$nextTick(() => this.createMergeView());
        else this.destroyMergeView();
      },
    },
  },
  mounted() {
    window.addEventListener('keydown', this.onKeydown);
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.onKeydown);
    this.destroyMergeView();
  },
  methods: {
    /* Reshape 'theirs' (raw disk bytes) into the exact shape 'yours' actually
       has, then run it through the same save-shape transform ConfigSaving.js
       uses, so both sides of the diff are compared in identical serialization
       style. 'yours' is never simply a load->dump round-trip of the file on
       disk:
       - root: INITIALIZE_CONFIG's buildRootEffective always emits keys in
         {appConfig, pageInfo, sections, pages} order and always includes
         `pages` (defaulting to []), regardless of the on-disk key order.
       - sub-page: INITIALIZE_CONFIG builds 'own' as
         stripRootOwnedFields({appConfig, pageInfo, sections}) - no `pages`,
         no inherited `auth`.
       Without matching that shape (not just the serializer), a hand-maintained
       conf.yml still diffs against reordered/pages-added output and hunks show
       up that are pure serialization noise, not real changes. toSaveShape is
       the same helper ConfigSaving.js's writeConfigToDisk uses to build the
       real 'yours', so this can never silently drift from it.
       Falls back to the raw text if it fails to parse - a malformed file on
       disk must still be viewable, not throw. */
    normalizeTheirs(raw) {
      try {
        const parsed = yamlLoad(raw) || {};
        // If parsed is not a plain object (e.g. scalar or array), return raw unchanged
        // to keep malformed files viewable rather than fabricating an object
        if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
          return raw;
        }
        const isSubPage = !!this.$store.state.currentConfigInfo.confId;
        // Pull the four config-owned keys out to the front in the canonical
        // order, defaulting the ones buildRootEffective/INITIALIZE_CONFIG
        // always populate - but keep any other top-level key the file may
        // have (`...rest`), so an unrecognised key never silently vanishes
        // from the diff.
        const {
          appConfig, pageInfo, sections, pages, ...rest
        } = parsed;
        const canonical = isSubPage
          ? {
            appConfig: appConfig || {}, pageInfo: pageInfo || {}, sections: sections || [], ...rest,
          }
          : {
            appConfig: appConfig || {}, pageInfo: pageInfo || {}, sections: sections || [], pages: pages || [], ...rest,
          };
        return yamlDump(JSON.parse(JSON.stringify(toSaveShape(canonical, isSubPage))));
      } catch {
        return raw;
      }
    },
    createMergeView() {
      this.destroyMergeView();
      // The conflict can be cleared (e.g. dismiss()) before this deferred
      // $nextTick callback runs, so guard against building a view for it
      if (!this.$refs.mergeEl || !this.conflict) return;
      // Bumps a reactive counter on every doc/chunk change so mergedText,
      // isMergedValid and changeCount stay live as the user edits or accepts/
      // rejects hunks - the MergeView doc itself is markRaw'd and non-reactive
      const onUpdate = EditorView.updateListener.of((update) => {
        // Selection/viewport-only updates (e.g. cursor movement) carry a
        // transaction too, so `transactions.length` alone doesn't filter them
        // out - they must not trigger this, or a full js-yaml re-parse of the
        // whole config fires on every click/arrow-key inside the merge pane.
        // MergeView's own chunk-recompute broadcast to the *sibling* pane
        // (after an edit on the other side) has docChanged: false but carries
        // a StateEffect - that one IS real signal and must still get through,
        // or changeCount stops updating once a hunk resolves.
        const hasEffect = update.transactions.some((tr) => tr.effects.length);
        if (!update.docChanged && !hasEffect) return;
        this.chunkCount = this.view?.chunks ? this.view.chunks.length : 0;
        this.docVersion += 1;
      });
      const extensions = [yaml(), EditorView.editable.of(false), EditorView.lineWrapping, onUpdate];
      this.view = markRaw(new MergeView({
        a: { doc: this.normalizeTheirs(this.conflict.theirs), extensions },
        b: {
          doc: this.conflict.yours,
          extensions: [
            yaml(),
            EditorView.lineWrapping,
            EditorState.allowMultipleSelections.of(true),
            onUpdate,
          ],
        },
        parent: this.$refs.mergeEl,
        highlightChanges: true,
        gutter: true,
      }));
      // MergeView exposes its computed diff chunks; this is the same data that
      // drives the highlighting, so the summary count always matches the view
      this.chunkCount = this.view.chunks ? this.view.chunks.length : 0;
      this.scrollToFirstChange();
    },
    /* Open focused on the first difference, so the alert isn't buried */
    scrollToFirstChange() {
      const firstChunk = this.$refs.mergeEl?.querySelector('.cm-changedLine');
      if (firstChunk) firstChunk.scrollIntoView({ block: 'center' });
    },
    destroyMergeView() {
      if (this.view) {
        this.view.destroy();
        this.view = null;
      }
      this.chunkCount = 0;
    },
    dismiss() {
      this.$store.commit(StoreKeys.SET_SAVE_CONFLICT, null);
    },
    /* True once the editable ("yours") pane has diverged from the value it was
       seeded with - by direct typing, or by accepting/rejecting hunks. Used to
       gate the Escape shortcut so a reflex keystroke can't silently destroy
       hand-merge work. */
    isMergeDirty() {
      if (!this.view) return false;
      return this.view.b.state.doc.toString() !== (this.conflict?.yours || '');
    },
    onKeydown(event) {
      if (event.key !== 'Escape' || !this.conflict) return;
      // The merge pane is editable, so Escape is also a plausible reflex
      // keystroke for dismissing an autocomplete or clearing a selection
      // inside it - confirm before discarding if there's unsaved hand-merge
      // work to lose. Keeps the shortcut instant when there's nothing at risk.
      if (this.isMergeDirty() && !confirm(this.$t('config-editor.conflict-discard-merge-confirm'))) {
        return;
      }
      this.dismiss();
    },
    keepTheirs() {
      const { confId } = this.$store.state.currentConfigInfo;
      this.dismiss();
      if (!confId) {
        // For the root config, INITIALIZE_CONFIG only refetches when
        // state.rootConfig is falsy - and it is already populated from the
        // stale load. Without forcing a real refetch here, "discard mine,
        // reload theirs" would silently redisplay the same stale config and
        // re-commit the same stale hash, so the very next save conflicts again.
        this.$store.dispatch(StoreKeys.INITIALIZE_ROOT_CONFIG).then(() => {
          this.$store.dispatch(StoreKeys.INITIALIZE_CONFIG);
        });
      } else {
        // Sub-page configs are always genuinely refetched by confId, no special-casing needed
        this.$store.dispatch(StoreKeys.INITIALIZE_CONFIG, confId);
      }
      this.$store.commit(StoreKeys.SET_EDIT_MODE, false);
    },
    overwrite() {
      this.showOverwriteConfirm = true;
    },
    /* Only reached after the user confirms discarding someone else's work */
    confirmOverwrite() {
      this.showOverwriteConfirm = false;
      this.forceSave(this.conflict.yours);
    },
    saveMerged() {
      if (!this.isMergedValid) {
        this.$toast.error(this.$t('config-editor.conflict-invalid-yaml'));
        return;
      }
      this.forceSave(this.mergedText);
    },
    /* Parses the chosen YAML and force-writes it, bypassing the conflict check.
       Used by both "Overwrite" and "Save merged version" - either way, whatever
       was just written to disk must also land in the store, or the browser keeps
       holding the pre-conflict content. Left unfixed, the *next* save reads that
       stale in-memory copy, matches the hash this write just committed, and
       silently overwrites the just-saved content with no conflict firing. */
    forceSave(yamlText) {
      let parsed;
      try {
        parsed = yamlLoad(yamlText);
      } catch {
        this.$toast.error(this.$t('config-editor.conflict-invalid-yaml'));
        return;
      }
      this.dismiss();
      this.writeConfigToDisk(parsed, true).then((ok) => {
        if (!ok) return;
        // Same path JsonEditor.vue's onSaveToDisk uses to sync the store after
        // a successful write - handles both root and sub-page configs
        this.$store.dispatch(StoreKeys.APPLY_EDITED_CONFIG, parsed);
      });
    },
    showToast(message, success) {
      this.$toast[success ? 'success' : 'error'](message);
    },
  },
};
</script>

<style scoped lang="scss">
.conflict-resolver {
  position: fixed;
  inset: 0;
  /* Must clear both Modal.vue's teleported .modal-overlay (z-index: 50, body-level)
     and RemoteConfigLoader (z-index: 40) - #dashy has no z-index of its own, so it
     creates no stacking context and this competes directly with body-level layers */
  z-index: 60;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  background: var(--background);
  color: var(--config-settings-color);

  .conflict-header {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    h3 { margin: 0 0 0.25rem; color: var(--danger); flex: 1; }
    p.conflict-summary { margin: 0 0 0.5rem; flex-basis: 100%; }
  }

  .dismiss-btn {
    background: none;
    border: none;
    color: var(--config-settings-color);
    font-size: 1.5rem;
    line-height: 1;
    cursor: pointer;
    padding: 0 0.25rem;
  }

  /* Markers pair with colour, so the diff still reads without colour vision */
  .conflict-legend {
    display: flex;
    gap: 1rem;
    margin-bottom: 0.5rem;
    font-size: 0.85rem;
    .legend-item { display: inline-flex; align-items: center; gap: 0.3rem; }
    .marker {
      font-weight: bold;
      font-family: monospace;
      padding: 0 0.3rem;
      border-radius: 2px;
    }
    .removed .marker { background: var(--danger); color: var(--white); }
    .added .marker { background: var(--success); color: var(--white); }
  }

  .merge-container {
    flex: 1;
    overflow: auto;
    border: 1px solid var(--primary);
  }

  .conflict-actions {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
    padding-top: 0.75rem;
  }
}

/* Re-theme CodeMirror's merge colours so they follow Dashy's active theme, instead
   of CodeMirror's own hard-coded defaults. Side-by-side (MergeView, used here - not
   the unified unifiedMergeView) marks changed lines as .cm-changedLine on BOTH
   panes, distinguished only by an ancestor .cm-merge-a (left/theirs) or
   .cm-merge-b (right/yours) class - .cm-deletedChunk/.cm-insertedLine are emitted
   only by the unified view and never appear here, verified against
   node_modules/@codemirror/merge/dist/index.cjs. Translucent so the underlying
   syntax-highlighted text stays legible. Colour is never the only signal - the
   +/- legend above and gutter: true (non-colour markers) are preserved. */
.conflict-resolver :deep(.cm-merge-a .cm-changedLine) {
  background: color-mix(in srgb, var(--danger) 25%, transparent);
}
.conflict-resolver :deep(.cm-merge-b .cm-changedLine) {
  background: color-mix(in srgb, var(--success) 25%, transparent);
}
.conflict-resolver :deep(.cm-merge-a .cm-changedText) {
  background: color-mix(in srgb, var(--danger) 45%, transparent);
}
.conflict-resolver :deep(.cm-merge-b .cm-changedText) {
  background: color-mix(in srgb, var(--success) 45%, transparent);
}
.conflict-resolver :deep(.cm-merge-a .cm-changedLineGutter) {
  background: color-mix(in srgb, var(--danger) 45%, transparent);
}
.conflict-resolver :deep(.cm-merge-b .cm-changedLineGutter) {
  background: color-mix(in srgb, var(--success) 45%, transparent);
}
</style>
