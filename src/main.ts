import "./style.css";
import { axiosApi, fetchApi } from "./libs/api";

type Post = {
  userId: number;
  id: number;
  title: string;
  body: string;
};

type PostUpdate = {
  title: string;
  body: string;
  userId: number;
};

type PatchUpdate = Partial<PostUpdate>;

const postBtn = document.querySelector(".btn-create")!;
const getBtn = document.querySelector(".btn-read")!;
const patchBtn = document.querySelector(".btn-patch")!;
const putBtn = document.querySelector(".btn-update")!;
const deleteBtn = document.querySelector(".btn-delete")!;
const protectedBtn = document.querySelector(".btn-protected")!;
const loginBtn = document.querySelector(".btn-login")!;

const currentProviderApi = fetchApi;

let currentAbortController: AbortController | null = null;

getBtn.addEventListener("click", async () => {
  console.log("GET request");

  if (currentAbortController) {
    currentAbortController.abort();
  }

  currentAbortController = currentProviderApi.createAbortController();

  currentProviderApi
    .get<Post[]>("/posts", {
      signal: currentAbortController?.signal,
    })
    .then((data) => {
      console.log(data);
    });
});

postBtn.addEventListener("click", async () => {
  console.log("POST request");
  const data = await currentProviderApi.post<Post, PostUpdate>("/posts", {
    title: "foo",
    body: "bar",
    userId: 1,
  });

  console.log(data);
});

patchBtn.addEventListener("click", async () => {
  console.log("PATCH request");

  currentProviderApi.patch<Post, PatchUpdate>("/posts/1", {
    title: "foo",
  });
});
putBtn.addEventListener("click", async () => {
  console.log("PUT request");
  currentProviderApi.put<Post, PostUpdate>("/posts/2", {
    title: "foo",
    body: "bar",
    userId: 1,
  });
});

deleteBtn.addEventListener("click", async () => {
  console.log("DELETE request");
  currentProviderApi.delete("/posts/3");
});

loginBtn.addEventListener("click", async () => {
  console.log("Login request");
  currentProviderApi
    .post<{
      accessToken: string;
      refreshToken: string;
    }>("/login", {
      email: "test@mail.com",
      password: "123456",
    })
    .then(({ accessToken, refreshToken }) => {
      currentProviderApi.setToken(accessToken);
      currentProviderApi.setRefreshToken(refreshToken);
    });
});

protectedBtn.addEventListener("click", async () => {
  console.log("Private request");
  currentProviderApi
    .get<{
      message: string;
      user: {
        email: string;
      };
    }>("/protected")
    .then((data) => {
      console.log(data);
    })
    .catch((error) => {
      console.log(error.message);
    });
});
