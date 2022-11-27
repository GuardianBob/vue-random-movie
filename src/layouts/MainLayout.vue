<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <!-- <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        /> -->

        <q-toolbar-title>
          Movie DB App
        </q-toolbar-title>

        <!-- <div>Quasar v{{ $q.version }}</div> -->
      </q-toolbar>
    </q-header>

    <!-- <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
      <q-list>
        <q-item-label
          header
        >
          Essential Links
        </q-item-label>

        <EssentialLink
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer> -->

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref } from 'vue'
// import EssentialLink from 'components/EssentialLink.vue'

const linksList = [
  {
    title: 'Movies',
    // caption: 'Trending',
    icon: 'mdi-movie-open-outline',
    link: '/movies'
  },
  {
    title: 'TV',
    // caption: 'forum.quasar.dev',
    icon: 'live_tv',
    link: '/tv'
  },
  {
    title: 'Random',
    // caption: 'github.com/quasarframework',
    icon: 'shuffle',
    link: '/shuffle'
  },
  {
    title: 'Movie Database',
    // caption: 'chat.quasar.dev',
    icon: 'mdi-movie-open-plus',
    link: 'movie_db'
  },
  {
    title: 'TV Database',
    // caption: '@quasarframework',
    icon: 'queue_play_next',
    link: 'tv_db'
  },
  {
    title: 'Movie List',
    // caption: 'chat.quasar.dev',
    icon: 'mdi-movie-open-plus',
    link: 'movie_list'
  },
]

export default defineComponent({
  name: 'MainLayout',

  components: {
    // EssentialLink
  },

  setup () {
    const leftDrawerOpen = ref(false)

    return {
      essentialLinks: linksList,
      leftDrawerOpen,
      toggleLeftDrawer () {
        leftDrawerOpen.value = !leftDrawerOpen.value
      }
    }
  },
})
</script>
