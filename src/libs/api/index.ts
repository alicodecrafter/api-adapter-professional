import ApiBase from "./api-base.ts";
import FetchAdapter from "./adapters/fetch-adapter.ts";
import AxiosAdapter from "./adapters/axios-adapter.ts";

const fetchApi = new ApiBase("http://localhost:3000", new FetchAdapter());
const axiosApi = new ApiBase("http://localhost:3000", new AxiosAdapter());

export { fetchApi, axiosApi };
