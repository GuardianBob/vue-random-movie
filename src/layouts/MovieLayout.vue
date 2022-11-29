<template>
  <div id="app" class="row justify-center">
    <div class="container ">
      <div class="text-center">
        <h2 class="text-center mt-5">Trending Movies 🍿</h2>
        <p>Keep up with the hottest movies that are trending this week.</p>
      </div>

      <div class="my-4">
        <a href="#" @click="getTrendingMovies('day')" class="mx-3 h4">
          Trending today</a>
      </div>
      <div class="my-4">
        <a href="#" @click="getTrendingMovies('week')" class="mx-3 h4">This week</a>
      </div>
      <div class="my-4">
        <input v-model="title" />
        <a href="#" @click="test_movie()" class="mx-3 h4">Test Add</a>
      </div>
      <div class="my-4">
        <a href="#" @click="test_connect()" class="mx-3 h4">Test Connect</a>
      </div>
      <div class="my-4">
        <a href="#" @click="list_all()" class="mx-3 h4">List All</a>
      </div>
      <div class="row justify-center" v-if="movies.length > 0">
        <div class="col-md-3 text-center" v-for="(movie, i) in movies" :key="i">
          <movie-card :movie="movie" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable vue/no-unused-components */
import { defineComponent, ref } from 'vue'
import MovieCard from 'components/MovieCard.vue';
import APIService from '../../services/api'
export default defineComponent({
  name: "App",
  components: {
    MovieCard,
  },
  setup() {
    return {
      movies: [],
      apiKey: process.env.TMDB_API,
      title: ref(""),
    };
  },
  methods: {
    getTrendingMovies(category) {
      return fetch(
        `https://api.themoviedb.org/3/trending/movie/${category}?api_key=${this.apiKey}`
      )
        .then((response) => response.json())
        .then((data) => {
          this.movies = data.results;
          // console.log(this.movies);
        });
    },
    test_movie() {
      let test_data = {title: this.title}
      // test_add(test_data);
      APIService.test_add(test_data)
        .then((response) => {
          // console.log(response.data)
        })
    }, 
    test_connect() {
      // test_add(test_data);
      APIService.test_connect()
        .then((response) => {
          // console.log(response.data)
        })
    }, 
    list_all() {
      // test_add(test_data);
      APIService.list_all()
        .then((response) => {
          // console.log(response.data)
        })
    }, 
  },
  mounted() {
    this.getTrendingMovies("day");
  },
})
</script>