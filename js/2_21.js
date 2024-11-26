import { top_list } from "../js/top_list.js";

export function viz_2_21(data, map, options) {
  // filter out "Other" country
  data = data.filter((d) => d.country !== "Other");

  // format the two columns total_instagram_followers and total_youtube_followers to have a K or M suffix
  data.forEach((d) => {
    d.total_instagram_followers = d3.format(".2s")(d.total_instagram_followers);
    d.total_youtube_followers = d3.format(".2s")(d.total_youtube_followers);
  });
  // append a label to the total_instagram_followers and total_youtube_followers columns before the value
  data.forEach((d) => {
    d.total_instagram_followers = "IG: " + d.total_instagram_followers;
    d.total_youtube_followers = "YT: " + d.total_youtube_followers;
  });

  return top_list(data, map, options);
}
