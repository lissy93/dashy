import fs from 'fs';
import path from 'path';
import { builtInThemes } from '@/utils/config/defaults';
import { applyTheme } from '@/utils/Theming';

const themeStylesPath = path.resolve(__dirname, '../../src/styles/themes/_liquid-glass.scss');
const schemaPath = path.resolve(__dirname, '../../src/utils/config/ConfigSchema.json');

describe('Liquid Glass theme registration', () => {
  it('is available to the shared theme picker registration', () => {
    expect(builtInThemes).toContain('liquid-glass');
  });

  it('is available as a config schema theme example', () => {
    const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
    const examples = schema.properties.appConfig.properties.theme.examples;
    expect(examples).toContain('liquid-glass');
  });

  it('keeps existing glass themes and applies the new theme through the shared path', () => {
    applyTheme('glass-2');
    expect(document.documentElement.dataset.theme).toBe('glass-2');

    applyTheme('liquid-glass');
    expect(document.documentElement.dataset.theme).toBe('liquid-glass');
  });
});

describe('Liquid Glass accessibility and performance fallbacks', () => {
  const styles = fs.readFileSync(themeStylesPath, 'utf8');

  it('uses the token architecture and a bounded backdrop-filter surface list', () => {
    expect(styles).toContain('--primary:');
    expect(styles).toContain('--background:');
    expect(styles).toContain('@supports ((backdrop-filter: blur(1px))');
    expect(styles).toContain('@supports not ((backdrop-filter: blur(1px))');
  });

  it('includes reduced motion, forced colors, and constrained-device fallbacks', () => {
    expect(styles).toContain('@media (prefers-reduced-motion: reduce)');
    expect(styles).toContain('@media (forced-colors: active)');
    expect(styles).toContain('@media (max-width: 780px), (hover: none), (prefers-reduced-data: reduce)');
  });
});
