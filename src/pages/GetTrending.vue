<template>
  <q-page>
    <div id="app" class="row justify-center text-center">
      <div class="col-12 text-center">
        <h2 class="text-center mt-5">{{ page_name }}</h2>
        <p>List trending movies or shows</p>
      </div>
    </div>
    <div class="row justify-center">
      <div class="col-10 text-center">
        <div class="row justify-center">
          <!-- <q-form @submit="get_random()" @reset="clear()" class="" @change="save_state"> -->
            <q-select outlined v-model="type" :options="type_options" label="Type" dense class="btn-cstm-w-300 q-ma-sm"
              @new-value="save_state" />
            <q-select outlined v-model="category" :options="category_options" label="Span" dense class="btn-cstm-w-300 q-ma-sm" @new-value="save_state" />

          <!-- </q-form> -->
        </div>
        <q-btn class="q-ma-sm btn-cstm-w-3rd" size="md" color="primary" @click="getTrendingMovies(category)">
          <span v-if="!processing_search">
            <q-icon name="search" class="q-mr-sm" size="1rem" />
          </span>
          <span v-if="processing_search">
            <q-spinner class="q-mr-sm" color="secondary" size="1em" />
          </span>
          List Trending {{ type }}
        </q-btn>
        <br />
        <div class="q-pa-lg flex flex-center" v-if="movies.length > 0">
          <q-pagination v-model="current" direction-links :max="pages"
            :max-pages="5"
            @click="set_page(current)" />
        </div>
        <q-btn 
          v-back-to-top.animate="{offset: 200, duration: 200}" 
          round color="primary" 
          class="fixed-bottom-right animate-pop" 
          style="margin: 0 15px 15px 0; z-index: 500" 
          @click="scroll_top"
        >
          <q-icon name="keyboard_arrow_up" />
        </q-btn>
      </div>
    </div>
    <div class="row">
      <div class="col-md-3" v-for="(movie, i) in movies" :key="i">
        <movie-card :movie="movie" :media_link="media_link" />
      </div>
    </div>
    <div class="q-pa-lg flex flex-center" v-if="movies.length > 0">
      <q-pagination v-model="current" direction-links :max="pages" :max-pages="5" @click="set_page(current)" />
    </div>
  </q-page>
</template>

<script>
/* eslint-disable vue/no-unused-components */
import { defineComponent, ref } from 'vue'
import MovieCard from 'components/MovieCard.vue';
import APIService from '../../services/api'
import TMDBService from '../../services/tmdbService'
import { useQuasar, Notify } from "quasar";
import mOptions from "../assets/options"
export default defineComponent({
  name: "RandomMovie",
  components: {
    MovieCard,
    Notify
  },
  // plugins: { Notify },
  data() {
    const $q = useQuasar();
    $q.dark.set(true);
    return {
      page_name: "Random",
      movies: [],
      apiKey: process.env.TMDB_API,
      title: ref(""),
      countries: ref(["USA", "Japan"]),
      country: ref(),
      category_options: ref(["day", "week"]),
      category: ref('week'),
      type_options: ref(["Movie", "Series"]),
      type: ref(),
      years: ref([]),
      year_start: ref(),
      year_end: ref(),
      genre_options: ref([]),
      genres: ref([]),
      rating_options: ref([]),
      rating: ref(),
      sort_options: ref([]),
      sort: ref(),
      processing_search: ref(false),
      current: ref(1),
      pages: ref(),
      media_link: ref('')
    };
  },
  methods: {
    scroll_top() {
      window.scrollTo(0, 0);
    },
    async getTrendingMovies(category) {
      this.set_link();
      // return fetch(
      //   `https://api.themoviedb.org/3/trending/movie/${category}?api_key=${this.apiKey}`
      // )
      let media = this.type.toLowerCase();
      if (media == "series" ) media = "tv"
      this.current = 1
      let movies = await TMDBService.fetch_trending(category, 1, media)
      // console.log(movies)
      this.movies = movies.data.results
      this.pages = movies.data.total_pages
        // .then((response) => response.json())
        // .then((data) => {
        //   this.movies = data.results;
        //   console.log(this.movies);
        // });
    },

    async set_page(page) {
      // console.log(this.category, page)
      let media = this.type.toLowerCase();
      if (media == "series" ) media = "tv"
      let movies = await TMDBService.fetch_trending(this.category, page, media)
      // console.log(movies)
      this.movies = movies.data.results
      this.pages = movies.data.total_pages
    },

    async set_link() {
      // console.log(this.type)
      if (this.type == "Series") {
        this.media_link = "https://www.themoviedb.org/tv/"
      } else {
        this.media_link = "https://www.themoviedb.org/movie/"
      }
    }, 

    async get_new() {
      this.processing_search = true;
      this.save_state();
      this.set_link();
      Notify.create({
        message: `Processing...`,
        color: "green",
        position: "top",
        timeout: 500
      });
      // this.getTrendingMovies("day");
      // let options = await this.convert_options()
      if (this.year_end < this.year_start) {
        Notify.create({
          message: `Please make sure to select an End Year that is not less than the Start Year`,
          color: "red",
          position: "center",
        });
        return
      }
      let selections = {
        "start_year": this.year_start,
        "end_year": this.year_end,
        "rating": this.rating,
        "type": this.type,
        "country": this.country,
        "sort_by": this.sort,
        "genres": this.genres,
      }
      // console.log("genres: ", selections["genres"].toString())
      let movies = await TMDBService.fetch_random(selections)
      // console.log(movies)
      this.movies = movies;
      this.processing_search = false;
    },

    async convert_options() {
      this.save_state()
      let start_year = this.year_start
      let end_year = this.year_end
      let rating = this.rating
      let type = this.type
      let country = mOptions.country[this.country]
      let sort_by = mOptions.sortBy[this.sort]
      let genres = []
      if (this.genres) {
        await this.genres.forEach((item, index) => {
          // console.log(item, index)
          genres.push(mOptions.genres[item])
        })     
      }
      
      // console.log(
      //   `start_year : ${start_year}`,
      //   `end_year : ${end_year}`,
      //   `genres : ${genres}`,
      //   `rating : ${rating}`,
      //   `type : ${type}`,
      //   `country : ${country}`,
      //   `sort_by : ${sort_by}`,
      // )
      let selections = {
        "start_year": start_year,
        "end_year": end_year,
        "genres": genres,
        "rating": rating,
        "type": type,
        "country": country,
        "sort_by": sort_by,
      }
      return (selections)
    },
    async list_years() {
      var start = (new Date("01 Jan 1960")).getFullYear();
      var end = (new Date()).getFullYear();
      for (let i = end; i >= start; i--) this.years.push(i);
    },
    async get_options() {
      // console.log(mOptions.genres);
      this.genre_options = Object.keys(mOptions.genres);
      this.sort_options = Object.keys(mOptions.sortBy)
      this.countries = Object.keys(mOptions.country)
    },
    async save_state() {
      // console.log("saving...")
      let selections = {
        "start_year": this.year_start,
        "end_year": this.year_end,
        "rating": this.rating,
        "type": this.type,
        "country": this.country,
        "sort_by": this.sort,
        "genres": this.genres,
      }
      // console.log("saved selections: ", selections)
      localStorage.setItem("selections", JSON.stringify(selections));
    },
    async restore_state() {
      if (localStorage.getItem("selections")) {
        let selections = JSON.parse(localStorage.getItem("selections"));
        // console.log("selections: ", selections)
        this.year_start = selections.start_year
        this.year_end = selections.end_year
        this.rating = selections.rating
        this.type = selections.type
        this.country = selections.country
        this.sort = selections.sort_by
        this.genres = selections.genres
      } else {
        this.year_start = "2020"
        this.year_end = new Date().getFullYear()
        this.rating = "3"
        this.type = "Movie"
        this.country = "USA"
        this.sort = "Popularity Descending"
        this.genres = []
      }
    },
    async clear_state() {
      Notify.create({
        message: `Selections Reset`,
        color: "green",
        position: "top",
      });
      if (localStorage.getItem("selections")) {
        localStorage.removeItem("selections");
      }
        // console.log("selections: ", selections)
      this.year_start = "2020"
      this.year_end = new Date().getFullYear()
      this.rating = "3"
      this.type = "Movie"
      this.country = "USA"
      this.sort = "Popularity Descending"
      this.genres = []
    }
  },
  mounted() {
    // this.getTrendingMovies("day");
    this.list_years();
    for (let i = 10; i >= 0; i--) this.rating_options.push(i);
    this.get_options();
    this.restore_state();
  },
})
</script>