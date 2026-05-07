# Vue Random Movie App (vue-random-movie)

A Quasar/Vue 3 practice app utilizing API connections for TMDB and Plex Media Server to generate random movie/TV show recommendations.

## Features

- **TMDB Integration**: Generate random movie/TV show recommendations from The Movie Database
- **Plex Integration**: Generate random recommendations from your personal Plex Media Server library
- **Advanced Filtering**: Filter by year, genre, rating, country, and type
- **Responsive Design**: Works on desktop and mobile devices

## Setup

### Install the dependencies
```bash
yarn
# or
npm install
```

### Environment Variables

Create a `.env` file in the root directory with your TMDB API key:
```
TMDB_API=your_tmdb_api_key_here
```

### Start the app in development mode
```bash
quasar dev
```

## Usage

### TMDB Random Selection
1. Navigate to the home page
2. Set your filters (year range, genres, minimum rating, etc.)
3. Click "List Random Movie/Series" to get recommendations from TMDB

### Plex Library Random Selection
1. Navigate to the "Plex Library" page from the menu
2. Enter your Plex server URL (e.g., `http://192.168.1.100:32400`)
3. Enter your Plex authentication token
4. Click "Test Connection" to verify the connection
5. Set your filters and click "List Random Movie/Series" to get recommendations from your Plex library

#### Finding Your Plex Token
1. Open Plex Web App in your browser
2. Log in to your Plex account
3. Open browser developer tools (F12)
4. Go to Application/Storage > Local Storage > https://app.plex.tv
5. Look for the `myPlexAccessToken` value

## Development

### Lint the files
```bash
yarn lint
# or
npm run lint
```

### Format the files
```bash
yarn format
# or
npm run format
```

### Build the app for production
```bash
quasar build
```

### Customize the configuration
See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-js).
