// © 2024 Data Culture
// Released under the ISC license.
// https://studio.datacult.com/ 

// Description: Force layout image clusters

import { imagecluster } from './imagecluster.js'

export function viz_1_5(data, mapping, options) {

  ////////////////////////////////////////
  /////////////// Defaults ///////////////
  ////////////////////////////////////////

  let map = {
    image: "IMAGE_URL",
    size: "Gained in 2024",
  }

  mapping = { ...map, ...mapping };

  let defaults = {
    selector: "#viz_1_5",
    stroke: "white",
    domain: [0, 100000000],
    range: [40, 140],
  }

  options = { ...defaults, ...options };

  let platforms = {
    "TikTok": { color: "#99D8DB", icon: '<img src="https://assets-global.website-files.com/65af667017937d540b1c9600/65af667017937d540b1c9668_tiktok-logo.svg" loading="lazy" width="30" alt="">' },
    "Instagram": { color: "#72A8DF", icon: '<img src="https://assets-global.website-files.com/65af667017937d540b1c9600/65af667017937d540b1c966a_instagram-logo.svg" loading="lazy" width="30" alt="">' },
    "YouTube": { color: "#E2B5FD", icon: '<img src="https://assets-global.website-files.com/65af667017937d540b1c9600/65af667017937d540b1c9669_yt-logo.svg" loading="lazy" width="30" alt="">' }
  }

  ////////////////////////////////////////
  ////////////// Transform ///////////////
  ////////////////////////////////////////

  // tranform data from long to wide creating an all time followers and a gained in 2023 followers
  let transformedMap = {}

  data.forEach(d => {
    transformedMap[d.ARTIST_NAME + "-" + d.PLATFORM] = transformedMap[d.ARTIST_NAME + "-" + d.PLATFORM] || {
      ARTIST_NAME: d.ARTIST_NAME,
      IMAGE_URL: d.IMAGE_URL,
      PLATFORM: d.PLATFORM,
      ID: d.ID,
      "Gained in 2024": null,
      "All Time": null
    }

    transformedMap[d.ARTIST_NAME + "-" + d.PLATFORM][d.TYPE] = d.FOLLOWERS
  })

  let tranformed_data = Object.values(transformedMap)

  ////////////////////////////////////////
  ///////// Create Visuals ///////////////
  ////////////////////////////////////////

  let visuals = []

  let tooltip = d3.select(options.selector).append("div").attr("id", options.selector.substring(1) + "_tooltip").attr("class", "tooltip")

  Object.keys(platforms).forEach((d, i) => {

    if (d3.select(options.selector + "_" + d).empty()) d3.select(options.selector).append("div").attr("id", options.selector.substring(1) + "_" + d)

    options.fill = platforms[d].color
    let vis = imagecluster(tranformed_data.filter(e => e.PLATFORM == d), mapping, { ...options, selector: options.selector + "_" + d })

    visuals.push(vis)

  });

  ////////////////////////////////////////
  ////////////// Update //////////////////
  ////////////////////////////////////////

  function update(updateData, updateParam) {
    visuals.forEach((vis, i) => {
      vis.update(updateData, { size: updateParam }, { domain: updateParam == "All Time" ? [0, 1000000000] : [0, 100000000] })
    })
  }


  return {
    update: update,
  }

};