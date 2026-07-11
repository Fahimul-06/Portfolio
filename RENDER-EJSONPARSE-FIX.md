# Fix Render EJSONPARSE package.json error

If Render shows:

```txt
npm error code EJSONPARSE
Invalid package.json ... while parsing '@tailwind base; @tailwind components; @tailwind utilities;'
```

Render is reading a CSS file as `package.json`, or the real `package.json` in GitHub was overwritten with Tailwind CSS.

## Correct Render settings

- Root Directory: leave empty if your repository contains `package.json` at the top level.
- If your GitHub repository contains a `project/` folder and `package.json` is inside that folder, set Root Directory to:

```txt
project
```

- Build Command:

```bash
npm ci --include=dev && npm run build
```

- Start Command:

```bash
npm start
```

## Important files

`package.json` must start with:

```json
{
  "name": "mongodb-portfolio-admin",
  "private": true
}
```

`src/index.css` is the only file that should contain:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

After pushing this fixed project, use:

```txt
Manual Deploy → Clear build cache & deploy
```
