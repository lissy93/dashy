<template>
    <header v-if="componentVisible">
      <PageTitle
        v-if="titleVisible"
        :title="pageInfo.title"
        :description="pageInfo.description"
        :logo="pageInfo.logo"
      />
      <div class="header-actions">
        <Nav :links="pageInfo.navLinks" :user-hidden="!navVisible" class="nav" />
        <AccountMenu v-if="$store.getters.appConfig.showAccountMenu" />
      </div>
    </header>
</template>

<script>
import PageTitle from '@/components/PageStrcture/PageTitle.vue';
import Nav from '@/components/PageStrcture/Nav.vue';
import { shouldBeVisible } from '@/utils/config/SectionHelpers';
import { defineAsyncComponent } from 'vue';

export default {
  name: 'Header',
  components: {
    AccountMenu: defineAsyncComponent(() => import('@/components/PageStrcture/AccountMenu.vue')),
    PageTitle,
    Nav,
  },
  props: {
    pageInfo: { type: Object, required: true },
  },
  computed: {
    componentVisible() {
      return shouldBeVisible(this.$route.name);
    },
    visibleComponents() {
      return this.$store.getters.visibleComponents;
    },
    titleVisible() {
      return this.visibleComponents.pageTitle;
    },
    navVisible() {
      return this.visibleComponents.navigation;
    },
  },
};
</script>

<style scoped lang="scss">

@import '@/styles/media-queries.scss';

  .header-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-end;
    gap: 0.5rem;
    min-width: 0;
    max-width: 100%;
  }

  header {
    position: relative;
    margin: 0;
    padding: 0.5rem;
    display: flex;
    justify-content: space-between;
    background: var(--background-darker);
    align-items: center;
    align-content: flex-start;
    @include phone {
      flex-direction: column;
    }
  }
</style>
