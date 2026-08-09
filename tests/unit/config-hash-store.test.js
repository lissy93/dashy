import { describe, it, expect } from 'vitest';
import StoreKeys from '@/utils/StoreMutations';

describe('Conflict-detection store keys', () => {
  it('exposes the config hash mutations', () => {
    expect(StoreKeys.SET_CONFIG_HASH).toBe('SET_CONFIG_HASH');
    expect(StoreKeys.SET_ROOT_CONFIG_HASH).toBe('SET_ROOT_CONFIG_HASH');
    expect(StoreKeys.SET_SAVE_CONFLICT).toBe('SET_SAVE_CONFLICT');
  });
});
