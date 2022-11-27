<template>
  <q-page>
    <div id="app" class="row justify-center text-center">
      <div class="col-12 text-center">
        <h2 class="text-center mt-5">{{ page_name }}</h2>
        <p>Keep up with the hottest movies that are trending this week.</p>
      </div>
    </div>
    <div class="row justify-center">
      <div class="col-10 text-center">
        <div class="row justify-center">
          <!-- <q-form @submit="get_random()" @reset="clear()" class="" @change="save_state"> -->
            <q-select outlined v-model="year_start" :options="years" label="Start Year" dense class="btn-cstm-w-300 q-ma-sm" @new-value="save_state" />
            <q-select outlined v-model="year_end" :options="years" label="End Year" dense class="btn-cstm-w-300 q-ma-sm" 
              @new-value="save_state" 
              :rules="[year_start <= year_end || 'Please select a year greater than or equal to the Start Year']"/>
            <q-select outlined v-model="genres" :options="genre_options" multiple label="Genre" dense class="btn-cstm-w-300 q-ma-sm" @new-value="save_state" />
            <q-select outlined v-model="rating" :options="rating_options" label="Minimum Rating" dense class="btn-cstm-w-300 q-ma-sm" @new-value="save_state" />
            <q-select outlined v-model="sort" :options="sort_options" label="Sort By" dense class="btn-cstm-w-300 q-ma-sm" @new-value="save_state" />
            <q-select outlined v-model="country" :options="countries" label="Country of Origin" dense class="btn-cstm-w-300 q-ma-sm" @new-value="save_state" />
            <q-select outlined v-model="type" :options="type_options" label="Type" dense class="btn-cstm-w-300 q-ma-sm" @new-value="save_state" />

          <!-- </q-form> -->
        </div>
        <q-btn class="q-my-sm btn-cstm-w-3rd" size="md" color="primary" @click="get_random()">
          List Random {{ type }}
        </q-btn><br />
      </div>
    </div>
    <div class="row">
      <div class="col-md-3" v-for="(movie, i) in movies" :key="i">
        <movie-card :movie="movie" />
      </div>
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
          console.log(this.movies);
        });
    },
    test_connect() {
      // test_add(test_data);
      APIService.test_connect()
      .then((response) => {
        console.log(response.data)
      })
    },  
    async get_random() {
      this.save_state();
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
      console.log("genres: ", selections["genres"].toString())
      let movies = await TMDBService.fetch_random(selections)
      console.log(movies)
      this.movies = movies
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
      }
    },
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