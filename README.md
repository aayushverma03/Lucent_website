# Lucent

Static marketing site. Your game, empowered.

## Local preview

```sh
python3 -m http.server 8000
```

Open http://localhost:8000.

## Deploy (GitHub Pages)

1. Push this folder to a GitHub repo.
2. Settings → Pages → Source: `Deploy from a branch`, branch `main`, folder `/ (root)`.
3. Wait for the Pages action to finish; visit the published URL.

`.nojekyll` is included so Pages serves files as-is.
