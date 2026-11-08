# My website

Personal website ([www.omata.me](https://www.omata.me/)) built with Hugo and the [Hugo Blox Academic CV](https://github.com/HugoBlox/theme-academic-cv) template, deployed to GitHub Pages.

## Run

Requirements: [Hugo](https://gohugo.io/) (extended, see `WC_HUGO_VERSION` in `.github/workflows/publish.yaml`), Go, and Node.js.

### MacOS

```sh
brew install hugo go node
```

### Install Node.js dependencies

```sh
make install
```

### Run server locally

```sh
make server
```

**Note:** For local development with search functionality, you need to generate the Pagefind search index:

```sh
# Build the site first
hugo

# Generate search index
npx pagefind --site "public"

# Then run the server
hugo server
```

The GitHub Actions workflow automatically generates the search index during deployment. Pull requests are built (but not deployed) to catch errors before merging.

### Update hugo modules

```sh
make update
```

If the module cache gets into a bad state, run `make clean`.

### Thumbnails

Each publication, talk, and award post has a text-free `featured.png` drawn by `scripts/thumbnails/` (line art with a duotone pastel palette). When you add a page, add a line for its folder to `scripts/thumbnails/specs.js` (figures and props that match its content), then render it:

```sh
node scripts/thumbnails/generate.js            # pages that do not have a thumbnail yet
node scripts/thumbnails/generate.js <folder>   # re-render specific pages
```

This needs [Playwright](https://playwright.dev/) with Chromium (`npm i -g playwright && npx playwright install chromium`).

## License

The code and styles are licensed under the MIT license. [See project license.](LICENSE.md)
