
// var axios = require('axios');
import axios from 'axios';
import option_list from "../src/assets/options";

class RunService {

  async fetch_random(body) {
    console.log('Hit RunService: ', body)
    let url = ""
    let params
    switch (body.type) {
      case "Movie":
        url = 'https://api.themoviedb.org/3/discover/movie'
        params = await this.get_movie_params(body)
        break;
      case "Series":
        url = 'https://api.themoviedb.org/3/discover/tv'
        params = await this.get_tv_params(body)
        break;
      default:
        url = 'https://api.themoviedb.org/3/discover/movie'
        params = await this.get_movie_params(body)
        break;
    }

    // const params = await this.get_movie_params(body)
    
    let results = await axios.get(url, { params })
    console.log(results)
    let random_list = await this.random_list(body.type, results, url, params)
    console.log("Random_List :", random_list)
    // return (results.data.results)
    return random_list
  }

  // WORKS!!
  fetch_random_webstring(body) {
    console.log('Hit RunService: ', body)
    var config = {
      method: 'get',
      url: 'https://api.themoviedb.org/3/discover/movie?with_genres=28&primary_release_date_gte=2001&release_date_lte=2001&api_key=1185412e00a20896217f777462cbdaff',
      headers: { }
    };

    axios(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  async get_movie_params(params) {
    // console.log(params)
    let new_params = {}
    new_params["api_key"] = process.env.TMDB_API

    if (params.genres) {
      let genres = []
      await params.genres.forEach((item, index) => {
        // console.log(item, index)
        genres.push(option_list.genres[item])
      })
      new_params["with_genres"] = genres.toString()
    }

    if (params.start_year) new_params["primary_release_date.gte"] = params.start_year + "-01-01"
    if (params.end_year) new_params["primary_release_date.lte"] = params.end_year + "-12-31"
    if (params.rating) new_params["vote_average.gte"] = params.rating
    new_params["vote_count.gte"] = 10
    if (params.country) new_params["with_original_language"] = option_list.country[params.country]
    if (params.sort_by) new_params["sort_by"] = option_list.sortBy[params.sort_by]   

    return new_params
  }

  async get_tv_params(params) {
    // console.log(params)
    let new_params = {}
    new_params["api_key"] = process.env.TMDB_API

    if (params.genres) {
      let genres = []
      await params.genres.forEach((item, index) => {
        // console.log(item, index)
        genres.push(option_list.genres[item])
      })
      new_params["with_genres"] = genres.toString()
    }

    if (params.start_year) new_params["first_air_date.gte"] = params.start_year + "-01-01"
    if (params.end_year) new_params["first_air_date.lte"] = params.end_year + "-12-31"
    if (params.rating) new_params["vote_average.gte"] = params.rating
    // new_params["vote_count.gte"] = 10
    if (params.country) new_params["with_original_language"] = option_list.country[params.country]
    if (params.sort_by) new_params["sort_by"] = option_list.sortBy[params.sort_by]   

    return new_params
  }

  async random_list(media_type = "Movie", results, url, params) {
    let new_url
    let id_param
    switch (media_type) {
      case "Movie":
        new_url = 'https://api.themoviedb.org/3/movie/'
        id_param = 'movie_id'
        break;
      case "Series":
        new_url = 'https://api.themoviedb.org/3/tv/'
        id_param = 'tv_id'
        break;
      default:
        new_url = 'https://api.themoviedb.org/3/movie/'
        id_param = 'movie_id'
        break;
    }
    let random_list = []
    let api_key = process.env.TMDB_API
    let item_list = []
    let id_list = []
    let i = 0
    let k = 20
    k < results.data.total_results ? null : k = results.data.total_results
    console.log(k, item_list.length)
    // while (i < k) {
    while (id_list.length < k) {
      let rand_number = Math.floor(Math.random() * results.data.total_results);
      if (!item_list.includes(rand_number)) {
        i++
        item_list.push(rand_number)
        let page = Math.floor(rand_number / 20)
        page == 0 ? page = 1: null
        let page_item = rand_number % 20
        console.log(`page: ${page}, item : ${page_item}`)
        params["page"] = page
        // console.log("params:", params)
        // console.log("get individual: ", axios.get(url + rand_number + `?api_key=${api_key}`))
        // console.log("get individual: ", axios.get(url + rand_number, { params }))
        let rand_results = await axios.get(url, { params })
        console.log(`result : `, rand_results)
        if (!id_list.includes(rand_results.data.results[page_item].id)) {
          id_list.push(rand_results.data.results[page_item].id)
          random_list.push(rand_results.data.results[page_item])
        }
      }      
    }
    
    console.log(item_list)
    console.log(id_list.length)
    return random_list
      // } else {
      //   k += 1
  }
}

export default new RunService();