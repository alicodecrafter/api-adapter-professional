import APIBase from "./api-base";
import FetchAdapter from "./adapters/fetch-adapter";
import AxiosAdapter from "./adapters/axios-adapter.ts";

const fetchApi = new APIBase("http://localhost:3000", new FetchAdapter());
const axiosApi = new APIBase("http://localhost:3000", new AxiosAdapter());

export { fetchApi, axiosApi };
