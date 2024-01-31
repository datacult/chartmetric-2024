"use strict";

import { TreemapComponent } from "../../components/Treemap.js";
import { setupResizeListener, chartDimensions } from "../utility.js";

export function Treemap(data, selector, options) {
  // let selector = "viz_2_2";
  d3.select("#" + selector)
    .select("svg")
    .remove();
  d3.select("#" + selector)
    .append("div")
    .attr("id", "gentreTreemap_chart");
  /***********************
   *1. Access data
   ************************/
  const { genreType, timeframe } = options;

  /***********************
   *2. Create chart dimensions
   ************************/

  const { boundedWidth, boundedHeight } = chartDimensions(selector);
  const { boundedWidth: width, boundedHeight: height } = chartDimensions(
    selector,
    {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    }
  );

  /***********************
   *3. Set up canvas
   ************************/
  const visElement = d3.select("#" + selector);

  function update(data, options) {
    const { genreType, timeframe } = options;
    data = data
      .filter((d) => d.TITLE == genreType)
      .filter((d) => d.TIMEFRAME == timeframe) // or 2023
      .sort((a, b) => d3.descending(+a.VALUE, +b.VALUE))
      .map((d, i) => {
        return {
          GENRE_NAME: d.GENRE_NAME,
          TIMEFRAME: d.TIMEFRAME,
          VALUE: +d.VALUE,
          RANK: i + 1,
          IMAGE_URL: d.IMAGE_URL,
        };
      })
      .slice(0, 10);

    TreemapComponent(data, {
      path: (d) => d.GENRE_NAME,
      value: (d) => d.VALUE,
      label: (d) => {
        return [d.RANK, d.GENRE_NAME].join(" | ");
      },
      paddingInner: "8",
      tile: d3.treemapSquarify,
      width: width,
      height: height,
    });
  }
  update(data, options);
  return {
    update,
  };
}
