<template>
  <div class="plex-movie-card" @click="playInPlex">
    <!-- Poster -->
    <div class="poster-wrapper">
      <img
        v-if="posterUrl"
        class="poster-img"
        :src="posterUrl"
        :alt="movie.title"
        @error="handleImageError"
      />
      <div v-else class="poster-placeholder">
        <q-icon name="movie" size="3rem" color="grey-6" />
      </div>

      <!-- Badge -->
      <div class="badge-movie">{{ badgeText }}</div>
    </div>

    <!-- Title -->
    <div class="movie-title text-white q-mt-sm">{{ movie.title }}</div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { useQuasar, Notify } from 'quasar'

export default defineComponent({
  name: 'PlexMovieCard',
  props: [
    "movie",
    "plexUrl",
    "plexToken"
  ],
  setup() {
    const $q = useQuasar()
    return { $q }
  },
  computed: {
    posterUrl() {
      if (this.movie.thumb) {
        return `${this.plexUrl}${this.movie.thumb}?X-Plex-Token=${this.plexToken}`
      }
      return null
    },
    canPlay() {
      return this.plexUrl && this.plexToken && this.movie.key
    },
    badgeText() {
      return this.movie.type === 'show' ? 'SHOW' : 'MOVIE'
    }
  },
  methods: {
    handleImageError() {
      console.log('Image failed to load for:', this.movie.title)
    },
    playInPlex() {
      Notify.create({
        message: `Playing "${this.movie.title}" requires a Plex client`,
        color: "info",
        position: "top",
      })
    }
  }
})
</script>

<style scoped>
.plex-movie-card {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.plex-movie-card:hover {
  transform: scale(1.03);
}

.poster-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 2 / 3;
  border-radius: 8px;
  overflow: hidden;
  background: #1a1a2e;
}

.poster-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.poster-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #2a2a3e;
}

.badge-movie {
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(100, 100, 255, 0.85);
  color: white;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.movie-title {
  font-size: 0.85rem;
  font-weight: 600;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-bottom: 8px;
}
</style>