import {
  describe, it, expect, vi, beforeEach,
} from 'vitest';
// ConfigHelpers must finish loading before store.js does, otherwise the
// store.js -> ConfigHelpers -> ConfigAccumalator -> store.js import cycle
// hands ConfigAccumalator an uninitialized `$store` binding and throws.
import '@/utils/config/ConfigHelpers';
import store from '@/store';
import ConfigSaving from '@/mixins/ConfigSaving';
import StoreKeys from '@/utils/StoreMutations';
import request from '@/utils/request';

vi.mock('@/utils/request', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    default: {
      get: vi.fn(),
      post: vi.fn(),
    },
  };
});

/* Builds the minimal `this` context writeConfigToDisk needs: real store, stubbed UI hooks.
 * writeConfigToDisk calls sibling mixin methods (e.g. carefullyClearLocalStorage) via `this`,
 * so every mixin method is bound onto the context too, mirroring how Vue merges a mixin's
 * methods onto the component instance. */
function makeContext() {
  const ctx = {
    $store: store,
    $t: (key) => key,
    showToast: vi.fn(),
    progress: { start: vi.fn(), end: vi.fn() },
  };
  Object.keys(ConfigSaving.methods).forEach((key) => {
    ctx[key] = ConfigSaving.methods[key].bind(ctx);
  });
  return ctx;
}

describe('writeConfigToDisk', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    store.commit(StoreKeys.SET_SAVE_CONFLICT, null);
    store.commit(StoreKeys.SET_CONFIG_HASH, 'base-hash-123');
    store.commit(StoreKeys.SET_EDIT_MODE, true);
    store.state.currentConfigInfo = {};
    store.state.config = {};
  });

  describe('on conflict (success: false, conflict: true, HTTP 200)', () => {
    it('commits SET_SAVE_CONFLICT with the three expected fields - no theirHash, ' +
      'which nothing reads (see Important B / conflict-resolver-resolution.test.js)', async () => {
      request.post.mockResolvedValue({
        data: {
          success: false,
          conflict: true,
          currentConfig: 'their: yaml\n',
          currentHash: 'their-hash-999',
          currentMtime: 1710000000000,
        },
      });
      const ctx = makeContext();

      const result = await ctx.writeConfigToDisk({ sections: [] });

      expect(result).toBe(false);
      expect(store.state.saveConflict).toEqual({
        yours: expect.any(String),
        theirs: 'their: yaml\n',
        theirMtime: 1710000000000,
      });
    });

    it('does NOT mark the save successful', async () => {
      request.post.mockResolvedValue({
        data: { success: false, conflict: true, currentHash: 'their-hash' },
      });
      const ctx = makeContext();

      await ctx.writeConfigToDisk({ sections: [] });

      expect(ctx.saveSuccess).toBeUndefined();
      expect(ctx.showToast).not.toHaveBeenCalled();
    });

    it('does NOT clear localStorage', async () => {
      request.post.mockResolvedValue({
        data: { success: false, conflict: true, currentHash: 'their-hash' },
      });
      const ctx = makeContext();

      await ctx.writeConfigToDisk({ sections: [] });

      expect(localStorage.removeItem).not.toHaveBeenCalled();
    });

    it('does NOT exit edit mode, so unsaved editor work is preserved', async () => {
      request.post.mockResolvedValue({
        data: { success: false, conflict: true, currentHash: 'their-hash' },
      });
      const ctx = makeContext();

      await ctx.writeConfigToDisk({ sections: [] });

      expect(store.state.editMode).toBe(true);
    });

    it('does NOT refresh configHash from a conflicting response', async () => {
      request.post.mockResolvedValue({
        data: { success: false, conflict: true, currentHash: 'their-hash' },
      });
      const ctx = makeContext();

      await ctx.writeConfigToDisk({ sections: [] });

      expect(store.state.configHash).toBe('base-hash-123');
    });
  });

  describe('on success', () => {
    it('commits the new hash from the response into configHash', async () => {
      request.post.mockResolvedValue({
        data: { success: true, message: 'ok', newHash: 'new-hash-456' },
      });
      const ctx = makeContext();

      const result = await ctx.writeConfigToDisk({ sections: [] });

      expect(result).toBe(true);
      expect(store.state.configHash).toBe('new-hash-456');
    });

    it('clears localStorage and exits edit mode', async () => {
      request.post.mockResolvedValue({
        data: { success: true, message: 'ok', newHash: 'new-hash-456' },
      });
      const ctx = makeContext();

      await ctx.writeConfigToDisk({ sections: [] });

      expect(localStorage.removeItem).toHaveBeenCalled();
      expect(store.state.editMode).toBe(false);
    });
  });

  describe('request body', () => {
    it('sends baseHash from state.configHash and force=false by default', async () => {
      request.post.mockResolvedValue({
        data: { success: true, message: 'ok', newHash: 'whatever' },
      });
      const ctx = makeContext();

      await ctx.writeConfigToDisk({ sections: [] });

      expect(request.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ baseHash: 'base-hash-123', force: false }),
      );
    });

    it('sends force=true when explicitly requested (e.g. user chose to overwrite)', async () => {
      request.post.mockResolvedValue({
        data: { success: true, message: 'ok', newHash: 'whatever' },
      });
      const ctx = makeContext();

      await ctx.writeConfigToDisk({ sections: [] }, true);

      expect(request.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ baseHash: 'base-hash-123', force: true }),
      );
    });
  });
});

describe('Header read regression - request.get mocked with a real Headers instance ' +
  '(what fetch actually returns), not a plain object', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    store.state.rootConfig = null;
    store.state.rootConfigHash = null;
    store.state.configHash = null;
    store.state.currentConfigInfo = {};
    store.state.config = {};
    store.state.configSource = {};
  });

  it('INITIALIZE_ROOT_CONFIG reads x-config-hash off a real Headers instance into ' +
    'state.rootConfigHash - fails pre-fix because bracket access on Headers is always undefined', async () => {
    const rootYaml = [
      'pageInfo:',
      '  title: Home',
      'appConfig: {}',
      'pages: []',
      'sections: []',
      '',
    ].join('\n');
    request.get.mockResolvedValue({
      data: rootYaml,
      headers: new Headers({ 'X-Config-Hash': 'root-hash-regression' }),
    });

    await store.dispatch('INITIALIZE_ROOT_CONFIG');

    expect(store.state.rootConfigHash).toBe('root-hash-regression');
  });

  it('INITIALIZE_CONFIG (sub-page branch) reads x-config-hash off a real Headers instance ' +
    'into state.configHash - fails pre-fix for the same reason', async () => {
    const rootYaml = [
      'pageInfo:',
      '  title: Home',
      'appConfig: {}',
      'pages:',
      '  - name: Sub Page',
      '    path: ./sub.yml',
      'sections: []',
      '',
    ].join('\n');
    const subYaml = [
      'pageInfo:',
      '  title: Sub',
      'appConfig: {}',
      'sections: []',
      '',
    ].join('\n');
    request.get.mockImplementation((url) => {
      if (url.includes('sub.yml')) {
        return Promise.resolve({
          data: subYaml,
          headers: new Headers({ 'X-Config-Hash': 'sub-hash-regression' }),
        });
      }
      return Promise.resolve({
        data: rootYaml,
        headers: new Headers({ 'X-Config-Hash': 'root-hash-regression' }),
      });
    });

    await store.dispatch('INITIALIZE_CONFIG', 'sub-page');

    expect(store.state.configHash).toBe('sub-hash-regression');
  });
});

describe('configHash restoration when navigating root -> sub-page -> root', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    store.state.rootConfig = null;
    store.state.rootConfigHash = null;
    store.state.configHash = null;
    store.state.currentConfigInfo = {};
    store.state.config = {};
    store.state.configSource = {};
  });

  it('leaves configHash holding the root hash, not the sub-page hash', async () => {
    const rootYaml = [
      'pageInfo:',
      '  title: Home',
      'appConfig: {}',
      'pages:',
      '  - name: Sub Page',
      '    path: ./sub.yml',
      'sections: []',
      '',
    ].join('\n');
    const subYaml = [
      'pageInfo:',
      '  title: Sub',
      'appConfig: {}',
      'sections: []',
      '',
    ].join('\n');

    request.get.mockImplementation((url) => {
      if (url.includes('sub.yml')) {
        return Promise.resolve({ data: subYaml, headers: new Headers({ 'x-config-hash': 'sub-hash' }) });
      }
      return Promise.resolve({ data: rootYaml, headers: new Headers({ 'x-config-hash': 'root-hash' }) });
    });

    // Root
    await store.dispatch('INITIALIZE_CONFIG');
    expect(store.state.configHash).toBe('root-hash');

    // Navigate to sub-page
    await store.dispatch('INITIALIZE_CONFIG', 'sub-page');
    expect(store.state.configHash).toBe('sub-hash');

    // Navigate back to root - rootConfig is already populated, so
    // INITIALIZE_ROOT_CONFIG (the only place rootConfigHash is set) is skipped.
    // configHash must still be restored from the earlier-captured rootConfigHash.
    await store.dispatch('INITIALIZE_CONFIG');
    expect(store.state.configHash).toBe('root-hash');
  });
});

describe('Important C - a successful root save updates rootConfig + rootConfigHash, ' +
  'not just configHash', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    store.commit(StoreKeys.SET_SAVE_CONFLICT, null);
    store.state.rootConfig = null;
    store.state.rootConfigHash = null;
    store.state.configHash = null;
    store.state.currentConfigInfo = {};
    store.state.config = {};
    store.state.configSource = {};
  });

  it('re-initializing after a successful root save keeps the saved content and hash, ' +
    'and the next save does not spuriously conflict', async () => {
    const rootYaml = [
      'pageInfo:',
      '  title: Home',
      'appConfig: {}',
      'pages: []',
      'sections: []',
      '',
    ].join('\n');
    request.get.mockResolvedValue({ data: rootYaml, headers: new Headers({ 'x-config-hash': 'root-hash-1' }) });

    await store.dispatch('INITIALIZE_CONFIG');
    expect(store.state.configHash).toBe('root-hash-1');

    // Simulate a successful save of edited content - the same path
    // JsonEditor's onSaveToDisk / ConflictResolver's forceSave take
    const savedConfig = {
      pageInfo: { title: 'Saved Title' }, appConfig: {}, sections: [], pages: [],
    };
    request.post.mockResolvedValue({
      data: { success: true, message: 'ok', newHash: 'root-hash-2' },
    });
    const ctx = makeContext();
    const ok = await ctx.writeConfigToDisk(savedConfig);
    expect(ok).toBe(true);
    expect(store.state.configHash).toBe('root-hash-2');

    // Re-initialize - reached by navigating away and back, clicking Cancel in
    // edit mode, or resetting local settings; all dispatch INITIALIZE_CONFIG
    // with no confId.
    await store.dispatch('INITIALIZE_CONFIG');

    // Without the fix: content silently reverts to "Home" (state.rootConfig
    // was never updated by the save) while configHash reverts to
    // 'root-hash-1' (rootConfigHash was never updated either) - the
    // just-saved content vanishes from screen, and the very next save would
    // raise a spurious conflict against the user's own successful write.
    expect(store.state.config.pageInfo.title).toBe('Saved Title');
    expect(store.state.configHash).toBe('root-hash-2');

    // The next save must NOT conflict - the baseHash it sends now matches
    // what's actually on disk
    request.post.mockClear();
    request.post.mockResolvedValue({
      data: { success: true, message: 'ok', newHash: 'root-hash-3' },
    });
    await ctx.writeConfigToDisk(store.state.config);
    const [, body] = request.post.mock.calls[0];
    expect(body.baseHash).toBe('root-hash-2');
  });
});
