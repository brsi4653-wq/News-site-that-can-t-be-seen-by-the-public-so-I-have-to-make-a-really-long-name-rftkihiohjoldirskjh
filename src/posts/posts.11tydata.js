// Settings shared by every process post in this folder.
// The address of a post is /process/file-name/
export default {
  layout: "layouts/post.njk",
  isPost: true,
  eleventyComputed: {
    permalink: (data) => `/process/${data.page.fileSlug}/`,
    description: (data) => data.summary,
    ogImage: (data) => `/og/post-${data.page.fileSlug}.png`,
  },
};
