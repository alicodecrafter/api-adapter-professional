import express from "express";
import jwt from "jsonwebtoken";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
const PORT = 3000;
const SECRET_KEY = "your-secret-key";
const REFRESH_SECRET_KEY = "your-refresh-secret-key";
const tokens = {}; // Хранилище для refresh токенов (только для демонстрации)

const posts = [
  {
    userId: 1,
    id: 1,
    title:
      "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
    body: "quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto",
  },
  {
    userId: 1,
    id: 2,
    title: "qui est esse",
    body: "est rerum tempore vitae\nsequi sint nihil reprehenderit dolor beatae ea dolores neque\nfugiat blanditiis voluptate porro vel nihil molestiae ut reiciendis\nqui aperiam non debitis possimus qui neque nisi nulla",
  },
  {
    userId: 1,
    id: 3,
    title: "ea molestias quasi exercitationem repellat qui ipsa sit aut",
    body: "et iusto sed quo iure\nvoluptatem occaecati omnis eligendi aut ad\nvoluptatem doloribus vel accusantium quis pariatur\nmolestiae porro eius odio et labore et velit aut",
  },
];
app.use(cors());
app.use(bodyParser.json());

// Фиктивный вход, генерирующий JWT и Refresh Token
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Простая проверка (замените на реальную)
  if (email === "test@mail.com" && password === "123456") {
    const accessToken = jwt.sign({ email }, SECRET_KEY, { expiresIn: "5s" });
    const refreshToken = jwt.sign({ email }, REFRESH_SECRET_KEY);

    // Сохраняем refresh токен
    tokens[email] = refreshToken;

    return res.json({ accessToken, refreshToken });
  }

  return res.status(401).json({ message: "Invalid credentials" });
});

// Обновление токена
app.post("/refresh", (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken || !Object.values(tokens).includes(refreshToken)) {
    return res.sendStatus(403);
  }

  jwt.verify(refreshToken, REFRESH_SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);

    const newAccessToken = jwt.sign({ email: user.email }, SECRET_KEY, {
      expiresIn: "15m",
    });
    res.json({ accessToken: newAccessToken });
  });
});

// Эндпоинт, требующий аутентификации
app.get("/protected", (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.sendStatus(401); // Токен истек, возвращаем 401
      }
      return res.sendStatus(403); // Токен недействителен по другой причине, возвращаем 403
    }
    res.json({ message: "У вас есть доступ!", user });
  });
});

app.get("/posts", (req, res) => {
  const params = req.query;

  if (params.id) {
    const post = posts.find((post) => post.id === Number(params.id));
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    return res.json(post);
  }

  res.json(posts);
});

app.post("/posts", (req, res) => {
  const { title, body, userId } = req.body;
  const newPost = {
    userId,
    id: posts.length + 1,
    title,
    body,
  };
  posts.push(newPost);
  res.json(newPost);
});

app.put("/posts/:id", (req, res) => {
  const { id } = req.params;
  const { title, body } = req.body;
  const post = posts.find((post) => post.id === Number(id));
  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }
  post.title = title;
  post.body = body;
  res.json(post);
});

app.patch("/posts/:id", (req, res) => {
  const { id } = req.params;
  const { title, body } = req.body;
  const post = posts.find((post) => post.id === Number(id));
  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }
  post.title = title || post.title;
  post.body = body || post.body;
  res.json(post);
});

app.delete("/posts/:id", (req, res) => {
  const { id } = req.params;
  const index = posts.findIndex((post) => post.id === Number(id));
  if (index === -1) {
    return res.status(404).json({ message: "Post not found" });
  }
  posts.splice(index, 1);
  res.sendStatus(204).end();
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
