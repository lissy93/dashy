import {
  describe, it, expect, beforeAll, beforeEach, vi,
} from 'vitest';
import {
  applyCustomCss, applyPageStyles, applyTheme, loadExternalStyleSheets,
} from '@/utils/Theming';
import ErrorHandler from '@/utils/logging/ErrorHandler';

vi.mock('@/utils/logging/ErrorHandler', () => ({ default: vi.fn() }));

const customStyle = () => document.getElementById('user-custom-css');
const externalLinks = () => [...document.querySelectorAll('[data-external-source]')];
const hrefs = () => externalLinks().map((el) => el.getAttribute('href'));

beforeAll(() => {
  window.happyDOM.settings.disableCSSFileLoading = true;
  window.happyDOM.settings.handleDisabledFileLoadingAsSuccess = true;
});

beforeEach(() => {
  document.head.innerHTML = '';
  vi.clearAllMocks();
});

describe('Theming - applyCustomCss', () => {
  it('adds a single style element, with any tags stripped', () => {
    applyCustomCss('<style>body { color: red; }</style>');
    expect(document.querySelectorAll('style')).toHaveLength(1);
    expect(customStyle().textContent).toBe('body { color: red; }');
  });

  it('updates the same element in place when the CSS changes', () => {
    applyCustomCss('a { color: red; }');
    const first = customStyle();
    applyCustomCss('a { color: blue; }');
    expect(customStyle()).toBe(first);
    expect(first.textContent).toBe('a { color: blue; }');
    expect(document.querySelectorAll('style')).toHaveLength(1);
  });

  it.each([[''], [undefined], [null], [42]])('removes it when the CSS is %s', (value) => {
    applyCustomCss('a { color: red; }');
    applyCustomCss(value);
    expect(customStyle()).toBeNull();
  });

  it('goes before external stylesheets, so they keep precedence', () => {
    loadExternalStyleSheets({ externalStyleSheet: ['/a.css'] });
    applyCustomCss('a { color: red; }');
    expect(document.head.firstElementChild).toBe(customStyle());
  });

  it('stays before external stylesheets after they are swapped', () => {
    loadExternalStyleSheets({ externalStyleSheet: ['/a.css'] });
    applyCustomCss('a { color: red; }');
    loadExternalStyleSheets({ externalStyleSheet: ['/b.css'] });
    expect([...document.head.children]).toEqual([customStyle(), ...externalLinks()]);
  });
});

describe('Theming - loadExternalStyleSheets', () => {
  it('adds a link per valid URL in order, logging any invalid ones', () => {
    loadExternalStyleSheets({ externalStyleSheet: ['/a.css', 'a.css', 42, 'https://x.com/b.css'] });
    expect(hrefs()).toEqual(['/a.css', 'https://x.com/b.css']);
    expect(ErrorHandler).toHaveBeenCalledTimes(2);
  });

  it('accepts a single string', () => {
    loadExternalStyleSheets({ externalStyleSheet: '/a.css' });
    expect(hrefs()).toEqual(['/a.css']);
  });

  it('leaves existing links alone when the list is unchanged', () => {
    loadExternalStyleSheets({ externalStyleSheet: ['/a.css', '/b.css'] });
    const before = externalLinks();
    loadExternalStyleSheets({ externalStyleSheet: ['/a.css', '/b.css'] });
    expect(externalLinks()).toEqual(before);
    expect(externalLinks()[0]).toBe(before[0]);
  });

  it('replaces the links when the list changes', () => {
    loadExternalStyleSheets({ externalStyleSheet: ['/a.css'] });
    loadExternalStyleSheets({ externalStyleSheet: ['/b.css', '/a.css'] });
    expect(hrefs()).toEqual(['/b.css', '/a.css']);
  });

  it('removes all links when none are configured', () => {
    loadExternalStyleSheets({ externalStyleSheet: ['/a.css'] });
    loadExternalStyleSheets({});
    expect(hrefs()).toEqual([]);
  });

  it('resolves straight away when there is nothing to load', async () => {
    await expect(loadExternalStyleSheets({})).resolves.toBeUndefined();
    await expect(loadExternalStyleSheets(undefined)).resolves.toBeUndefined();
  });

  it('resolves once the stylesheets have loaded', async () => {
    await expect(loadExternalStyleSheets({ externalStyleSheet: ['/a.css'] })).resolves.toBeDefined();
  });
});

describe('Theming - applyPageStyles', () => {
  it('applies both the custom CSS and the external stylesheets', () => {
    applyPageStyles({ customCss: 'a { color: red; }', externalStyleSheet: ['/a.css'] });
    expect(customStyle().textContent).toBe('a { color: red; }');
    expect(hrefs()).toEqual(['/a.css']);
  });

  it('clears both when switching to a page with neither', () => {
    applyPageStyles({ customCss: 'a { color: red; }', externalStyleSheet: ['/a.css'] });
    applyPageStyles({});
    expect(customStyle()).toBeNull();
    expect(hrefs()).toEqual([]);
  });
});

describe('Theming - applyTheme', () => {
  const themeLink = () => document.getElementById('user-defined-stylesheet');

  it('keeps the external theme link when its URL is unchanged, and swaps it when it changes', () => {
    applyTheme('External Stylesheet', { externalStyleSheet: '/a.css' });
    const first = themeLink();
    applyTheme('External Stylesheet', { externalStyleSheet: '/a.css' });
    expect(themeLink()).toBe(first);
    applyTheme('External Stylesheet', { externalStyleSheet: '/b.css' });
    expect(themeLink().getAttribute('href')).toBe('/b.css');
    expect(document.querySelectorAll('#user-defined-stylesheet')).toHaveLength(1);
  });
});
