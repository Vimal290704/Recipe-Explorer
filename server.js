const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const path = require("path");
const app = express();

const port = 3000;

const corsOptions = {
  origin: "http://localhost:3000",
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static(path.join(__dirname, "frontend")));
class FatSecretAPI {
  constructor() {
   this.consumerKey = "63117102c5df4cfdbd61040abbb1b8dd";
    this.consumerSecret = "05410be848e447448678bb45796bc9c0";
    this.baseUrl = "https://platform.fatsecret.com/rest/server.api";
  }
  generateOAuthParams() {
    return {
      oauth_consumer_key: this.consumerKey,
      oauth_nonce: crypto.randomBytes(16).toString("hex"),
      oauth_signature_method: "HMAC-SHA1",
      oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
      oauth_version: "1.0",
    };
  }
  generateSignature(method, url, params) {
    const baseString = [
      method.toUpperCase(),
      encodeURIComponent(url),
      encodeURIComponent(this.normalizeParams(params)),
    ].join("&");
    return crypto
      .createHmac("sha1", `${this.consumerSecret}&`)
      .update(baseString)
      .digest("base64");
  }
  normalizeParams(params) {
    return Object.keys(params)
      .sort()
      .map((key) => `${key}=${encodeURIComponent(params[key])}`)
      .join("&");
  }
  async makeApiRequest(params) {
    params.oauth_signature = this.generateSignature(
      "GET",
      this.baseUrl,
      params
    );
    const url = `${this.baseUrl}?${new URLSearchParams(params)}`;
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }
    return await response.json();
  }
}
const api = new FatSecretAPI();
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
app.get(
  "/api/search",
  asyncHandler(async (req, res) => {
    const { searchTerm, recipeTypes, page = 0, maxResults = 20 } = req.query;
    if (!searchTerm) {
      return res.status(400).json({ error: "Search term is required" });
    }
    const params = {
      ...api.generateOAuthParams(),
      method: "recipes.search",
      format: "json",
      search_expression: searchTerm,
      page_number: page,
      max_results: maxResults,
    };
    if (recipeTypes) {
      params.recipe_types = recipeTypes;
      params.recipe_types_matchall = "true";
    }
    const data = await api.makeApiRequest(params);
    res.json(data);
  })
);
app.get(
  "/api/recipe/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Recipe ID is required" });
    }
    const params = {
      ...api.generateOAuthParams(),
      method: "recipe.get",
      format: "json",
      recipe_id: id,
    };
    const data = await api.makeApiRequest(params);
    res.json(data);
  })
);
app.get(
  "/api/food/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Food ID is required" });
    }
    const params = {
      ...api.generateOAuthParams(),
      method: "food.get",
      format: "json",
      food_id: id,
    };
    const data = await api.makeApiRequest(params);
    res.json(data);
  })
);
app.get("/api/placeholder/:width/:height", (req, res) => {
  const { width, height } = req.params;
  res.redirect(`https://via.placeholder.com/${width}x${height}`);
});
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    error: "Server error",
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(
    `API Documentation available at http://localhost:${port}/api-docs`
  );
});
