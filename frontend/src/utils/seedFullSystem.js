/* eslint-disable no-unused-vars */
/* global Buffer, process */
import axios from "axios";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { readFile } from "node:fs/promises";

const API_URL =
  process.env.VITE_API_URL ||
  process.env.API_URL ||
  "http://localhost:5000/api";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const resolveSeedFile = (relativePath) => path.resolve(__dirname, relativePath);

const SEED_PASSWORD = "Seed@123456";

const USERS = [
  {
    username: "seed_alex",
    email: "seed.alex@fabricio.dev",
    displayName: "Alex Runner",
    bio: "Thich game toc do, arcade va nhung thu choi nhanh.",
  },
  {
    username: "seed_mina",
    email: "seed.mina@fabricio.dev",
    displayName: "Mina Quest",
    bio: "Game designer thich cozy, puzzle va story-rich games.",
  },
  {
    username: "seed_kai",
    email: "seed.kai@fabricio.dev",
    displayName: "Kai Forge",
    bio: "Indie developer dang thu nghiem browser games nhe.",
  },
  {
    username: "seed_linh",
    email: "seed.linh@fabricio.dev",
    displayName: "Linh Pixel",
    bio: "Nguoi choi thich RPG, sci-fi va fantasy.",
  },
];

const TAG_NAMES = [
  "Action",
  "Adventure",
  "Arcade",
  "Browser",
  "Casual",
  "Cozy",
  "Cyberpunk",
  "Fantasy",
  "Horror",
  "Indie",
  "Puzzle",
  "Racing",
  "RPG",
  "Sci-Fi",
  "Simulation",
  "Strategy",
];

const GAMES = [
  {
    owner: "seed_alex",
    title: "2048 Game",
    description:
      "Phiên bản 2048 cổ điển được làm mới với đồ họa cyberpunk và gameplay mượt mà trên trình duyệt.",
    price: 0,
    tags: ["Racing", "Arcade", "Cyberpunk", "Browser"],
    theme: "#1d4ed8",
    GameType: "Browser",
    Thumbnail: "../game files/games image/2048-game.png",
    GameFile: "../game files/games zip/2048-master.zip",
  },
  {
    owner: "seed_mina",
    title: "Tetris Orchard",
    description:
      "Tetris kết hợp với yếu tố trồng trọt và cozy, nơi người chơi xếp gạch để thu hoạch cây trồng và mở rộng vườn.",
    price: 4.99,
    tags: ["Cozy", "Simulation", "Casual", "Indie"],
    theme: "#15803d",
    GameType: "Browser",
    Thumbnail: "../game files/games image/tetris-game.png",
    GameFile: "../game files/games zip/canvas-tetris-master.zip",
  },
  {
    owner: "seed_kai",
    title: "Clumsy Bird",
    description:
      "Game phiêu lưu hành động vui nhộn, nơi người chơi điều khiển một chú chim vụng về vượt qua các chướng ngại vật trong một thế giới đầy màu sắc.",
    price: 2.99,
    tags: ["Sci-Fi", "Arcade", "Action", "Browser"],
    theme: "#7c3aed",
    GameType: "Download",
    Thumbnail: "../game files/games image/clumsy-bird.png",
    GameFile: "../game files/games zip/clumsy-bird-master.zip",
  },
  {
    owner: "seed_linh",
    title: "Racers of the Neon Drift",
    description:
      "Trình duyệt game đua xe phong cách cyberpunk với đồ họa neon rực rỡ, nhiều loại xe và đường đua độc đáo để người chơi thử thách kỹ năng drift và tốc độ của mình.",
    price: 6.5,
    tags: ["RPG", "Fantasy", "Strategy", "Adventure"],
    theme: "#b45309",
    GameType: "Download",
    Thumbnail: "../game files/games image/javascript-racer.jpg",
    GameFile: "../game files/games zip/javascript-racer-master.zip",
  },
  {
    owner: "seed_kai",
    title: "Serenitrove",
    description:
      "Serenitrove là một trò chơi phiêu lưu giải đố kết hợp yếu tố kinh dị và khoa học viễn tưởng, nơi người chơi khám phá một hầm mộ cổ đại đầy bí ẩn và sinh vật kỳ lạ để tìm kiếm kho báu ẩn giấu.",
    price: 1.99,
    tags: ["Puzzle", "Horror", "Indie", "Sci-Fi"],
    theme: "#374151",
    GameType: "Download",
    Thumbnail: "../game files/games image/serenitrove.png",
    GameFile: "../game files/games zip/serenitrove.zip",
  },
  {
    owner: "seed_mina",
    title: "Tower Building Challenge",
    description:
      "Tower Building Challenge là một trò chơi xây dựng tháp, nơi người chơi phải thiết kế và xây dựng những tòa nhà ấn tượng nhất có thể.",
    price: 5.0,
    tags: ["Simulation", "Strategy", "Indie"],
    theme: "#9d174d",
    GameType: "Download",
    Thumbnail: "../game files/games image/Tower-Building-Game.jpg",
    GameFile: "../game files/games zip/tower_game-master.zip",
  },
];

const POSTS = [
  {
    author: "seed_alex",
    title: "Neon Drift da co ban demo",
    content:
      "Minh vua day ban demo dau tien cua Neon Drift. Feedback ve cam giac drift va toc do se rat huu ich.",
  },
  {
    author: "seed_mina",
    title: "Lam sao de cozy game khong bi lap?",
    content:
      "Theo minh, cozy game can vong lap nhe nhang nhung van co muc tieu ro. Anh em thu Cozy Orchard giup minh nha.",
  },
  {
    author: "seed_kai",
    title: "Chia se cach dong goi browser game",
    content:
      "Game upload len FabricIO can zip co index.html o root hoac trong folder dau tien. Minh de sample nho de test nhanh.",
  },
  {
    author: "seed_linh",
    title: "Rune Keepers can them class nao?",
    content:
      "Ban hien tai co warrior va mage. Minh dang can them mot class co utility cao hon cho combat dai.",
  },
];

const GAME_COMMENTS = [
  "Gameplay on, load nhanh va hop de demo trang detail.",
  "Thumbnail nhin ro, nhung nen them trailer sau.",
  "Phan mo ta du thong tin de nguoi choi quyet dinh mua.",
];

const POST_COMMENTS = [
  "Bai viet huu ich, dung cai minh dang can test.",
  "Nen ghim them checklist upload asset nua la dep.",
  "Minh se thu va feedback sau khi choi vai vong.",
];

const log = (message, data = "") => {
  console.log(`[seed] ${message}`, data);
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getErrorMessage = (error) => {
  const data = error?.response?.data;
  if (typeof data === "string") return data;
  return data?.message || error?.message || "Unknown error";
};

const request = async (client, config, fallback = null) => {
  try {
    const response = await client.request(config);
    return response.data;
  } catch (error) {
    if (fallback) return fallback(error);
    throw error;
  }
};

const createClient = (cookie = "") =>
  axios.create({
    baseURL: API_URL,
    timeout: 30000,
    headers: cookie ? { Cookie: cookie } : undefined,
  });

const toCookieHeader = (setCookieHeaders = []) =>
  setCookieHeaders.map((cookie) => cookie.split(";")[0]).join("; ");

const normalizeArrayPayload = (payload, key) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.[key])) return payload[key];
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.Items)) return payload.Items;
  return [];
};

const parseEntityId = (payload) =>
  payload?.id || payload?.Id || payload?.entity?.id || payload?.entity?.Id;

const registerOrLogin = async (publicClient, user) => {
  await request(
    publicClient,
    {
      method: "post",
      url: "/Auth/register",
      data: { ...user, password: SEED_PASSWORD },
    },
    (error) => {
      const status = error?.response?.status;
      if (
        status === 409 ||
        /tồn tại|ton tai|exist/i.test(getErrorMessage(error))
      ) {
        return null;
      }
      throw error;
    },
  );

  const loginResponse = await publicClient.post("/Auth/login", {
    username: user.username,
    password: SEED_PASSWORD,
  });

  const cookie = toCookieHeader(loginResponse.headers["set-cookie"] || []);
  const authedClient = createClient(cookie);

  const profile = await request(authedClient, {
    method: "get",
    url: "/Users/me",
  });

  if (user.bio) {
    await request(authedClient, {
      method: "patch",
      url: "/Users/profile",
      data: { bio: user.bio },
    });
  }

  return {
    ...user,
    id: parseEntityId(profile) || profile?.id,
    client: authedClient,
  };
};

const seedUsers = async (publicClient) => {
  const result = {};

  for (const user of USERS) {
    const seededUser = await registerOrLogin(publicClient, user);
    result[user.username] = seededUser;
    log(`user ready: ${user.username}`);
  }

  return result;
};

const seedTags = async (publicClient) => {
  const existingTags = normalizeArrayPayload(
    await request(publicClient, { method: "get", url: "/GameTags" }),
    "tags",
  );

  const tagsByName = new Map(
    existingTags.map((tag) => [tag.name?.toLowerCase(), tag]),
  );

  for (const name of TAG_NAMES) {
    if (tagsByName.has(name.toLowerCase())) continue;

    const tag = await request(
      publicClient,
      {
        method: "post",
        url: "/GameTags",
        data: { name },
      },
      async (error) => {
        if (
          error?.response?.status === 409 ||
          error?.response?.status === 500
        ) {
          return null;
        }
        throw error;
      },
    );

    if (tag) {
      tagsByName.set(name.toLowerCase(), tag);
      log(`tag created: ${name}`);
    }
  }

  const refreshedTags = normalizeArrayPayload(
    await request(publicClient, { method: "get", url: "/GameTags" }),
    "tags",
  );

  return new Map(refreshedTags.map((tag) => [tag.name.toLowerCase(), tag]));
};

const findExistingGame = async (publicClient, title) => {
  const data = await request(publicClient, {
    method: "get",
    url: "/Games",
    params: { search: title },
  });

  return normalizeArrayPayload(data, "games").find(
    (game) => game.title?.toLowerCase() === title.toLowerCase(),
  );
};

const seedGames = async (publicClient, usersByUsername, tagsByName) => {
  const gamesByTitle = new Map();

  for (const game of GAMES) {
    const existingGame = await findExistingGame(publicClient, game.title);
    if (existingGame) {
      gamesByTitle.set(game.title, existingGame);
      log(`game exists: ${game.title}`);
      continue;
    }

    const owner = usersByUsername[game.owner];
    const formData = new FormData();
    const gameFilePath = resolveSeedFile(game.GameFile);
    const thumbnailPath = resolveSeedFile(game.Thumbnail);

    console.log("[seed] game file:", gameFilePath);
    console.log("[seed] thumbnail:", thumbnailPath);

    const gameBuffer = await readFile(gameFilePath);
    const thumbnailBuffer = await readFile(thumbnailPath);

    const thumbnailExt = path.extname(thumbnailPath) || ".png";

    formData.append("Title", game.title);
    formData.append("Description", game.description);
    formData.append("GameType", game.GameType);
    formData.append("Price", String(game.price));
    
    formData.append(
      "Thumbnail",
      new Blob([thumbnailBuffer], { type: getImageMimeType(thumbnailPath) }),
      `${slugify(game.title)}${thumbnailExt}`,
    );

    formData.append(
      "GameFile",
      new Blob([gameBuffer], { type: "application/zip" }),
      `${slugify(game.title)}.zip`,
    );
    for (const tagName of game.tags) {
      const tag = tagsByName.get(tagName.toLowerCase());
      if (tag?.id) formData.append("TagIds", tag.id);
    }

    const createdGame = await request(owner.client, {
      method: "post",
      url: "/Games",
      data: formData,
    });

    gamesByTitle.set(game.title, createdGame);
    log(`game created: ${game.title}`);
    await sleep(150);
  }

  return gamesByTitle;
};

const findExistingPost = async (publicClient, title) => {
  const data = await request(publicClient, {
    method: "get",
    url: "/Post",
    params: { Page: 1, PageSize: 100 },
  });

  return normalizeArrayPayload(data, "items").find(
    (post) => post.title?.toLowerCase() === title.toLowerCase(),
  );
};

const seedPosts = async (publicClient, usersByUsername) => {
  const postsByTitle = new Map();

  for (const post of POSTS) {
    const existingPost = await findExistingPost(publicClient, post.title);
    if (existingPost) {
      postsByTitle.set(post.title, existingPost);
      log(`post exists: ${post.title}`);
      continue;
    }

    const author = usersByUsername[post.author];
    const formData = new FormData();
    formData.append("Title", post.title);
    formData.append("Content", post.content);

    const createdPost = await request(author.client, {
      method: "post",
      url: "/Post",
      data: formData,
    });

    postsByTitle.set(post.title, createdPost);
    log(`post created: ${post.title}`);
  }

  return postsByTitle;
};

const seedGameInteractions = async (usersByUsername, gamesByTitle) => {
  const users = Object.values(usersByUsername);
  const games = Array.from(gamesByTitle.values());

  for (let gameIndex = 0; gameIndex < games.length; gameIndex++) {
    const game = games[gameIndex];
    const gameId = game.id;

    for (let userIndex = 0; userIndex < users.length; userIndex++) {
      const user = users[userIndex];
      const stars = ((gameIndex + userIndex) % 5) + 1;

      await request(user.client, {
        method: "put",
        url: `/games/${gameId}/ratings`,
        data: { stars },
      });

      await request(
        user.client,
        {
          method: "post",
          url: `/games/${gameId}/comment`,
          data: {
            content:
              GAME_COMMENTS[(gameIndex + userIndex) % GAME_COMMENTS.length],
          },
        },
        () => null,
      );

      if ((gameIndex + userIndex) % 2 === 0) {
        await request(
          user.client,
          { method: "post", url: `/users/${gameId}/favrotite` },
          () => null,
        );
      }

      if (Number(game.price) > 0 && user.id !== game.ownerId) {
        await request(
          user.client,
          {
            method: "post",
            url: `/games/${gameId}/purchase`,
            data: { amound: Number(game.price) },
          },
          () => null,
        );
      }
    }

    await request(
      users[gameIndex % users.length].client,
      { method: "get", url: `/Games/${gameId}/play` },
      () => null,
    );

    log(`game interactions seeded: ${game.title}`);
  }
};

const seedPostInteractions = async (usersByUsername, postsByTitle) => {
  const users = Object.values(usersByUsername);
  const posts = Array.from(postsByTitle.values());
  const reactions = ["Like", "Love", "Haha", "Wow", "Dislike"];

  for (let postIndex = 0; postIndex < posts.length; postIndex++) {
    const post = posts[postIndex];

    for (let userIndex = 0; userIndex < users.length; userIndex++) {
      const user = users[userIndex];

      await request(
        user.client,
        {
          method: "post",
          url: "/post/reaction",
          data: {
            postId: post.id,
            reactionType: reactions[(postIndex + userIndex) % reactions.length],
          },
        },
        () => null,
      );

      await request(
        user.client,
        {
          method: "post",
          url: `/post/${post.id}/comment`,
          data: {
            content:
              POST_COMMENTS[(postIndex + userIndex) % POST_COMMENTS.length],
          },
        },
        () => null,
      );
    }

    log(`post interactions seeded: ${post.title}`);
  }
};

export const seedFullSystem = async () => {
  const publicClient = createClient();

  log(`using API: ${API_URL}`);
  const usersByUsername = await seedUsers(publicClient);
  const tagsByName = await seedTags(publicClient);
  const gamesByTitle = await seedGames(
    publicClient,
    usersByUsername,
    tagsByName,
  );
  const postsByTitle = await seedPosts(publicClient, usersByUsername);

  await seedGameInteractions(usersByUsername, gamesByTitle);
  await seedPostInteractions(usersByUsername, postsByTitle);

  log("finished", {
    users: Object.keys(usersByUsername).length,
    tags: tagsByName.size,
    games: gamesByTitle.size,
    posts: postsByTitle.size,
  });
};

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  seedFullSystem().catch((error) => {
    console.error("[seed] failed:", getErrorMessage(error));
    if (error?.response?.data) {
      console.error(error.response.data);
    }
    process.exitCode = 1;
  });
}

const getImageMimeType = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  return "image/png";
};
