// Settings shared by every film in this folder.
// The address of a film is /work/file-name/
export default {
  layout: "layouts/work.njk",
  isFilm: true,
  eleventyComputed: {
    permalink: (data) => `/work/${data.page.fileSlug}/`,
    description: (data) => data.summary,
    ogImage: (data) => `/og/film-${data.page.fileSlug}.png`,
  },
};
