// Section pages are only built when showSections is true in src/_data/site.js
export default {
  eleventyComputed: {
    permalink: (data) =>
      data.site && data.site.showSections && data.sec ? `/${data.sec.slug}/` : false,
  },
};
