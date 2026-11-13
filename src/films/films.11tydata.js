// Settings shared by every film in this folder.
// The address of a film is /films/file-name/
export default {
  layout: "layouts/film.njk",
  isFilm: true,
  eleventyComputed: {
    permalink: (data) => `/films/${data.page.fileSlug}/`,
    description: (data) => data.summary,
    ogImage: (data) => `/og/film-${data.page.fileSlug}.png`,
  },
};
