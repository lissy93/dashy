import {
  describe, it, expect, beforeEach, afterEach, vi,
} from 'vitest';
import { shallowMount } from '@vue/test-utils';
import SideBarItem from '@/components/Workspace/SideBarItem.vue';

function mountItem(props = {}) {
  return shallowMount(SideBarItem, {
    props,
    global: {
      directives: {
        tooltip: {},
      },
      mocks: {
        $t: (key) => key,
      },
      stubs: {
        Icon: true,
        NewTabOpenIcon: true,
      },
    },
  });
}

describe('SideBarItem', () => {
  let openSpy;

  beforeEach(() => {
    openSpy = vi.spyOn(window, 'open').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders icon when icon prop is provided', () => {
    const wrapper = mountItem({ icon: 'fas fa-server', title: 'Server' });
    expect(wrapper.classes()).toContain('w-icon');
    expect(wrapper.findComponent({ name: 'Icon' }).exists()).toBe(true);
    expect(wrapper.find('p.small-title').exists()).toBe(false);
  });

  it('renders title as small-title when icon is empty', () => {
    const wrapper = mountItem({ title: 'No Icon App' });
    expect(wrapper.classes()).toContain('text-only');
    expect(wrapper.find('p.small-title').exists()).toBe(true);
    expect(wrapper.find('p.small-title').text()).toBe('No Icon App');
  });

  it('does not render popout button when url is not set', () => {
    const wrapper = mountItem({ title: 'Section Header' });
    expect(wrapper.find('.popout-btn').exists()).toBe(false);
  });

  it('renders popout button when url is provided', () => {
    const wrapper = mountItem({ title: 'App', url: 'https://example.com' });
    expect(wrapper.find('.popout-btn').exists()).toBe(true);
  });

  it('emits launch-app on normal click', async () => {
    const wrapper = mountItem({ title: 'App', url: 'https://example.com', target: 'workspace' });
    await wrapper.trigger('click');
    expect(wrapper.emitted('launch-app')).toBeTruthy();
    expect(wrapper.emitted('launch-app')[0]).toEqual([{ url: 'https://example.com', target: 'workspace' }]);
    expect(openSpy).not.toHaveBeenCalled();
  });

  it('launches the workspace app when the icon is clicked', async () => {
    const wrapper = mountItem({ icon: 'fas fa-server', title: 'App', url: 'https://example.com', target: 'workspace' });
    await wrapper.findComponent({ name: 'Icon' }).trigger('click');
    expect(wrapper.emitted('launch-app')).toEqual([[{ url: 'https://example.com', target: 'workspace' }]]);
    expect(openSpy).not.toHaveBeenCalled();
  });

  it('launches the workspace app when the title is clicked', async () => {
    const wrapper = mountItem({ title: 'App', url: 'https://example.com', target: 'workspace' });
    await wrapper.find('.small-title').trigger('click');
    expect(wrapper.emitted('launch-app')).toEqual([[{ url: 'https://example.com', target: 'workspace' }]]);
    expect(openSpy).not.toHaveBeenCalled();
  });

  it('opens in new tab on popout button click without emitting launch-app', async () => {
    const wrapper = mountItem({ title: 'App', url: 'https://example.com', target: 'workspace' });
    const popoutBtn = wrapper.find('.popout-btn');
    expect(popoutBtn.exists()).toBe(true);
    await popoutBtn.trigger('click');
    expect(openSpy).toHaveBeenCalledWith('https://example.com', '_blank', 'noopener,noreferrer');
    expect(wrapper.emitted('launch-app')).toBeFalsy();
  });

  it('opens in new tab when clicked with ctrlKey or metaKey', async () => {
    const wrapper = mountItem({ title: 'App', url: 'https://example.com', target: 'workspace' });
    await wrapper.trigger('click', { ctrlKey: true });
    expect(openSpy).toHaveBeenCalledWith('https://example.com', '_blank', 'noopener,noreferrer');
    expect(wrapper.emitted('launch-app')).toBeFalsy();

    openSpy.mockClear();

    await wrapper.trigger('click', { metaKey: true });
    expect(openSpy).toHaveBeenCalledWith('https://example.com', '_blank', 'noopener,noreferrer');
    expect(wrapper.emitted('launch-app')).toBeFalsy();
  });

  it('opens in new tab when middle clicked (auxclick button 1)', async () => {
    const wrapper = mountItem({ title: 'App', url: 'https://example.com', target: 'workspace' });
    await wrapper.trigger('auxclick', { button: 1 });
    expect(openSpy).toHaveBeenCalledWith('https://example.com', '_blank', 'noopener,noreferrer');
  });
});
