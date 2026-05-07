<template>
  <q-page>
    <!-- Header -->
    <div class="row items-center q-px-md q-pt-md">
      <div class="col">
        <h4 class="text-h4 text-weight-bold text-primary q-mb-none">{{ page_name }}</h4>
      </div>
      <div class="col-auto" v-if="connectionTested && connectionValid">
        <q-btn
          flat
          dense
          icon="tune"
          class="q-mr-sm"
          @click="showFilters = !showFilters"
        />
        <q-btn
          flat
          dense
          icon="refresh"
          class="q-mr-sm"
          :loading="processing_search"
          @click="get_random"
        />
        <q-btn
          outline
          color="primary"
          icon="filter_list"
          :label="activeFilterCount + ' Active Filters'"
          @click="showFilters = true"
        />
      </div>
    </div>

    <!-- Plex Connection Settings (shown when not connected) -->
    <div class="row justify-center q-mt-md" v-if="!connectionValid">
      <div class="col-10 text-center">
        <p class="text-grey-5">Connect to your Plex server and generate a random list of movies from your library</p>
        <div class="row justify-center">
          <q-input
            outlined
            v-model="plexUrl"
            label="Plex Server URL"
            placeholder="http://192.168.1.100:32400"
            dense
            class="btn-cstm-w-300 q-ma-sm"
            @blur="savePlexSettings"
          />
          <q-input
            outlined
            v-model="plexToken"
            label="Plex Token"
            placeholder="Your Plex Token"
            dense
            class="btn-cstm-w-300 q-ma-sm"
            type="password"
            @blur="savePlexSettings"
          >
            <template #append>
              <q-icon name="help_outline" class="cursor-pointer">
                <q-tooltip max-width="320px" class="bg-grey-9 text-white text-body2">
                  <div class="text-weight-bold q-mb-xs">How to find your Plex Token</div>
                  <ol class="q-pl-md q-mb-xs">
                    <li>Open Plex Web and play any item</li>
                    <li>Click the <strong>⋮</strong> (three dots) menu on the item</li>
                    <li>Select <strong>Get Info</strong> → <strong>View XML</strong></li>
                    <li>Look for <code>X-Plex-Token=</code> in the URL</li>
                  </ol>
                  <div>
                    <a
                      href="https://support.plex.tv/articles/204059436-finding-an-authentication-token-x-plex-token/"
                      target="_blank"
                      rel="noopener"
                      class="text-light-blue-3"
                    >Official Plex guide ↗</a>
                  </div>
                </q-tooltip>
              </q-icon>
            </template>
          </q-input>
          <q-btn
            class="q-ma-sm"
            size="md"
            color="secondary"
            @click="testConnection"
            :loading="testingConnection"
          >
            Test Connection
          </q-btn>
        </div>
      </div>
    </div>

    <!-- Sort dropdown row (visible when connected) -->
    <div class="row items-center q-px-md q-mb-md" v-if="connectionTested && connectionValid">
      <div class="col-auto">
        <q-btn flat dense icon="sort" class="q-mr-xs" />
        <q-select
          v-model="sortOption"
          :options="sortOptions"
          dense
          borderless
          style="min-width: 200px; display: inline-block;"
        />
      </div>
    </div>

    <!-- Results Grid -->
    <div class="row q-px-md q-col-gutter-md" v-if="movies.length > 0">
      <div v-for="(movie, i) in sortedMovies" :key="i" class="col-6 col-sm-4 col-md-3 col-lg-2">
        <plex-movie-card :movie="movie" :plex-url="plexUrl" :plex-token="plexToken" />
      </div>
    </div>

    <!-- Right Sidebar Drawer for Filters -->
    <q-drawer
      v-model="showFilters"
      side="right"
      overlay
      bordered
      :width="320"
      class="bg-dark text-white"
    >
      <div class="q-pa-md">
        <div class="row items-center q-mb-lg">
          <div class="col text-h6 text-weight-bold">Filters</div>
          <q-btn flat dense round icon="close" @click="showFilters = false" />
        </div>

        <!-- Plex Connection -->
        <div class="q-mb-md">
          <div class="text-subtitle2 text-grey-5 q-mb-sm">Plex Connection</div>
          <q-input
            outlined
            v-model="plexUrl"
            label="Plex Server URL"
            placeholder="http://192.168.1.100:32400"
            dense
            dark
            class="q-mb-sm"
            @blur="savePlexSettings"
          />
          <q-input
            outlined
            v-model="plexToken"
            label="Plex Token"
            placeholder="Your Plex Token"
            dense
            dark
            class="q-mb-sm"
            type="password"
            @blur="savePlexSettings"
          >
            <template #append>
              <q-icon name="help_outline" class="cursor-pointer text-grey-5">
                <q-tooltip max-width="320px" class="bg-grey-9 text-white text-body2">
                  <div class="text-weight-bold q-mb-xs">How to find your Plex Token</div>
                  <ol class="q-pl-md q-mb-xs">
                    <li>Open Plex Web and play any item</li>
                    <li>Click the <strong>⋮</strong> (three dots) menu on the item</li>
                    <li>Select <strong>Get Info</strong> → <strong>View XML</strong></li>
                    <li>Look for <code>X-Plex-Token=</code> in the URL</li>
                  </ol>
                  <div>
                    <a
                      href="https://support.plex.tv/articles/204059436-finding-an-authentication-token-x-plex-token/"
                      target="_blank"
                      rel="noopener"
                      class="text-light-blue-3"
                    >Official Plex guide ↗</a>
                  </div>
                </q-tooltip>
              </q-icon>
            </template>
          </q-input>
        </div>

        <q-separator dark class="q-my-md" />

        <!-- Library Filter -->
        <div class="q-mb-md">
          <div class="text-subtitle2 text-grey-5 q-mb-sm">Libraries</div>
          <q-select
            outlined
            v-model="selected_libraries"
            :options="library_options"
            multiple
            label="Select Libraries (All if none selected)"
            dense
            dark
            class="q-mb-sm"
            @update:model-value="save_state"
            option-label="title"
            option-value="key"
            emit-value
            map-options
          />
        </div>

        <q-separator dark class="q-my-md" />

        <!-- Year Filters -->
        <div class="q-mb-md">
          <div class="text-subtitle2 text-grey-5 q-mb-sm">Year Range</div>
          <q-select
            outlined
            v-model="year_start"
            :options="years"
            label="Start Year (Any if empty)"
            dense
            dark
            clearable
            class="q-mb-sm"
            @update:model-value="save_state"
          />
          <q-select
            outlined
            v-model="year_end"
            :options="years"
            label="End Year (Any if empty)"
            dense
            dark
            clearable
            class="q-mb-sm"
            @update:model-value="save_state"
            :rules="[!year_start || !year_end || year_start <= year_end || 'End Year must be >= Start Year']"
          />
        </div>

        <q-separator dark class="q-my-md" />

        <!-- Genre Filter -->
        <div class="q-mb-md">
          <div class="text-subtitle2 text-grey-5 q-mb-sm">Genre</div>
          <q-select
            outlined
            v-model="genres"
            :options="genre_options"
            multiple
            label="Select Genres"
            dense
            dark
            class="q-mb-sm"
            @update:model-value="save_state"
          />
        </div>

        <q-separator dark class="q-my-md" />

        <!-- Action Buttons -->
        <q-btn
          class="full-width q-mb-sm"
          size="md"
          color="primary"
          @click="get_random(); showFilters = false;"
          :loading="processing_search"
        >
          <q-icon name="search" class="q-mr-sm" size="1rem" />
          Search Movies
        </q-btn>
        <q-btn
          class="full-width"
          size="md"
          color="negative"
          outline
          @click="clear_state()"
        >
          <q-icon name="autorenew" class="q-mr-sm" size="1rem" />
          Reset Filters
        </q-btn>
      </div>
    </q-drawer>

    <!-- Back to top button -->
    <q-btn
      v-back-to-top.animate="{offset: 200, duration: 200}"
      round color="primary"
      class="fixed-bottom-right animate-pop"
      style="margin: 0 15px 15px 0; z-index: 500"
      @click="scroll_top"
    >
      <q-icon name="keyboard_arrow_up" />
    </q-btn>
  </q-page>
</template>

<script>
/* eslint-disable vue/no-unused-components */
import { defineComponent, ref } from 'vue'
import PlexMovieCard from '../components/PlexMovieCard.vue';
import PlexService from '../../services/plexService'
import { useQuasar, Notify } from "quasar";

export default defineComponent({
  name: "PlexRandom",
  components: {
    PlexMovieCard,
    Notify
  },
  data() {
    const $q = useQuasar();
    $q.dark.set(true);
    return {
      page_name: "Movies",
      movies: [],
      plexUrl: ref(''),
      plexToken: ref(''),
      connectionTested: ref(false),
      connectionValid: ref(false),
      testingConnection: ref(false),
      years: ref([]),
      year_start: ref(),
      year_end: ref(),
      genre_options: ref([]),
      genres: ref([]),
      library_options: ref([]),
      selected_libraries: ref([]),
      processing_search: ref(false),
      showFilters: ref(false),
      sortOption: ref('Popularity Descending'),
      sortOptions: ref([
        'Popularity Descending',
        'Popularity Ascending',
        'Title A-Z',
        'Title Z-A',
        'Year Newest',
        'Year Oldest',
        'Rating Highest',
        'Rating Lowest'
      ]),
    };
  },
  computed: {
    activeFilterCount() {
      let count = 0;
      if (this.year_start) count++;
      if (this.year_end) count++;
      if (this.genres && this.genres.length > 0) count++;
      if (this.selected_libraries && this.selected_libraries.length > 0) count++;
      return count;
    },
    sortedMovies() {
      if (!this.movies || this.movies.length === 0) return [];
      const sorted = [...this.movies];
      switch (this.sortOption) {
        case 'Title A-Z':
          return sorted.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        case 'Title Z-A':
          return sorted.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
        case 'Year Newest':
          return sorted.sort((a, b) => (b.year || 0) - (a.year || 0));
        case 'Year Oldest':
          return sorted.sort((a, b) => (a.year || 0) - (b.year || 0));
        case 'Rating Highest':
          return sorted.sort((a, b) => (b.audienceRating || b.rating || 0) - (a.audienceRating || a.rating || 0));
        case 'Rating Lowest':
          return sorted.sort((a, b) => (a.audienceRating || a.rating || 0) - (b.audienceRating || b.rating || 0));
        case 'Popularity Ascending':
          return sorted.reverse();
        case 'Popularity Descending':
        default:
          return sorted;
      }
    }
  },
  methods: {
    scroll_top() {
      window.scrollTo(0, 0);
    },

    async testConnection() {
      if (!this.plexUrl || !this.plexToken) {
        Notify.create({
          message: 'Please enter both Plex URL and Token',
          color: "red",
          position: "top",
        });
        return;
      }

      this.testingConnection = true;
      PlexService.setCredentialsLegacy(this.plexUrl, this.plexToken);

      try {
        const isValid = await PlexService.testConnection();
        this.connectionTested = true;
        this.connectionValid = isValid;

        if (isValid) {
          Notify.create({
            message: 'Successfully connected to Plex server!',
            color: "green",
            position: "top",
          });
          this.loadGenres();
        } else {
          Notify.create({
            message: 'Failed to connect to Plex server. Please check your URL and token.',
            color: "red",
            position: "top",
          });
        }
      } catch (error) {
        this.connectionTested = true;
        this.connectionValid = false;
        Notify.create({
          message: 'Connection failed: ' + error.message,
          color: "red",
          position: "top",
        });
      } finally {
        this.testingConnection = false;
      }
    },

    async loadGenres() {
      try {
        const libraries = await PlexService.getLibraries();
        const relevantLibraries = libraries.filter(lib =>
          lib.type === 'movie' || lib.type === 'show'
        );

        // Store library options for the dropdown
        this.library_options = relevantLibraries.map(lib => ({
          title: lib.title,
          key: lib.key,
          type: lib.type
        }));

        const allGenres = new Set();
        for (const lib of relevantLibraries) {
          const items = await PlexService.getLibraryContents(lib.key);
          items.forEach(item => {
            if (item.Genre) {
              item.Genre.forEach(genre => allGenres.add(genre.tag));
            }
          });
        }

        this.genre_options = Array.from(allGenres).sort();
      } catch (error) {
        console.error('Error loading genres:', error);
      }
    },

    async get_random() {
      if (!this.connectionValid) {
        Notify.create({
          message: 'Please test your Plex connection first',
          color: "red",
          position: "center",
        });
        return;
      }

      this.processing_search = true;
      this.save_state();

      Notify.create({
        message: `Processing...`,
        color: "green",
        position: "top",
        timeout: 500
      });

      if (this.year_start && this.year_end && this.year_end < this.year_start) {
        Notify.create({
          message: `Please make sure to select an End Year that is not less than the Start Year`,
          color: "red",
          position: "center",
        });
        return;
      }

      let selections = {
        "start_year": this.year_start,
        "end_year": this.year_end,
        "genres": this.genres,
        "libraries": this.selected_libraries,
      };

      try {
        const results = await PlexService.fetchRandom(selections);
        this.movies = results;
      } catch (error) {
        Notify.create({
          message: 'Error fetching movies: ' + error.message,
          color: "red",
          position: "top",
        });
      } finally {
        this.processing_search = false;
      }
    },

    async savePlexSettings() {
      const settings = {
        plexUrl: this.plexUrl,
        plexToken: this.plexToken
      };
      localStorage.setItem("plexSettings", JSON.stringify(settings));
    },

    async restorePlexSettings() {
      if (localStorage.getItem("plexSettings")) {
        const settings = JSON.parse(localStorage.getItem("plexSettings"));
        this.plexUrl = settings.plexUrl || '';
        this.plexToken = settings.plexToken || '';
      }
    },

    async save_state() {
      let selections = {
        "start_year": this.year_start,
        "end_year": this.year_end,
        "genres": this.genres,
        "libraries": this.selected_libraries,
      }
      localStorage.setItem("plexSelections", JSON.stringify(selections));
    },

    async restore_state() {
      if (localStorage.getItem("plexSelections")) {
        let selections = JSON.parse(localStorage.getItem("plexSelections"));
        this.year_start = selections.start_year;
        this.year_end = selections.end_year;
        this.genres = selections.genres || [];
        this.selected_libraries = selections.libraries || [];
      } else {
        this.setDefaults();
      }
    },

    async clear_state() {
      Notify.create({
        message: `Selections Reset`,
        color: "green",
        position: "top",
      });
      this.setDefaults();
    },

    setDefaults() {
      this.year_start = null;
      this.year_end = null;
      this.genres = [];
      this.selected_libraries = [];
    },

    async list_years() {
      var start = 1960;
      var end = (new Date()).getFullYear();
      for (let i = end; i >= start; i--) this.years.push(i);
    },
  },

  async mounted() {
    this.list_years();
    await this.restorePlexSettings();
    await this.restore_state();
    
    // Auto-run search if Plex token exists
    if (this.plexToken) {
      await this.testConnection();
      if (this.connectionValid) {
        await this.get_random();
      }
    }
  },
})
</script>