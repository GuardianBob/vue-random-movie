<template>
  <q-item>
    <div class="card mb-4 shadow-lg border border-secondary bg-dark text-light">
      <a :href="media_link + movie.id" target="_blank">
      <img class="card-img-top btn-cstm-w-full" :src="'https://image.tmdb.org/t/p/w500/' + movie.poster_path" alt="Card image cap"  />
      </a>
      <div class="card-body">
        <p class="card-text">{{ movie.title }}</p>
        <div class="">
          <div class="d-flex justify-content-between align-items-center">
            <div class="btn-group">
              <button type="button" class="btn btn-sm btn-outline-secondary">
                <i class="fas fa-heart"></i>
              </button>
              <button type="button" class="btn btn-sm btn-outline-secondary">
                <i class="fas fa-plus"></i>
              </button>
            </div>
            <small class="ms-auto text-muted">Rating {{ movie.vote_average }}/10</small>
          </div>
        </div>
      </div>
    </div>
  </q-item>
</template>
<script>

import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'MovieCard',
  // props: {
  //   movie: {
  //     type: Object,
  //     required: true,
  //   },
  // },
  props: [
    "movie",
    "type"
  ],  
  setup() {
    return {
      media_link: 'https://www.themoviedb.org/movie/',
    }
  },
  methods: {
    async set_link() {
      if (this.type == "Series") {
        this.media_link = "https://www.themoviedb.org/tv/"
      }
    }
  },
  created() {
    console.log("selected type: ", this.type)
    console.log("link: ", this.media_link)
    this.set_link()
  }
})
</script>