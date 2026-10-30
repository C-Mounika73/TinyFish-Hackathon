# TinyFish integration notes

FoodLoop AI uses TinyFish Search for public NGO discovery. The official documentation says REST requests require an `X-API-Key` header and the Search API is served at `https://api.search.tinyfish.ai`. Search requests use query parameters including `query`, optional `purpose`, `location`, `language`, and domain/date filters. The response includes `query`, `results`, `total_results`, and `page`; each result may include `position`, `domain`, `title`, `snippet`, `url`, and optional publication fields.

The application keeps the key server-side in `TINYFISH_API_KEY`, uses an abort timeout, normalizes only fields returned by TinyFish, and stores every result as `Discovered – Pending Verification`. When the key is absent or the API fails, the backend returns an explicit configuration/error message and no fabricated results.

Official sources consulted:

- https://docs.tinyfish.ai/
- https://docs.tinyfish.ai/authentication
- https://docs.tinyfish.ai/search
- https://docs.tinyfish.ai/search-api/reference
- https://docs.tinyfish.ai/fetch-api/reference
