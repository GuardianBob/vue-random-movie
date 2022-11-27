import { api } from "boot/axios";
import axios from 'axios'

class APIService {

  // =============== Storage Calls =================
  test_add(body) {
    return api.post(`/movie/test_add`, body);
  }

  test_connect(body) {
    return api.post(`/movie/test_connect`, body);
  }

  list_all() {
    return api.post(`/movie/list_all`);
  }
}

export default new APIService();