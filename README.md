# My website

GitHub Pages based on [Hugo Academic CV Theme](https://github.com/HugoBlox/theme-academic-cv).

## Run

- Install `hugo` to build page

### MacOS

```sh
brew install hugo
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

The GitHub Actions workflow automatically generates the search index during deployment.

### Update hugo modules

```sh
make update
```

## License

The code and styles are licensed under the MIT license. [See project license.](LICENSE.md) 
