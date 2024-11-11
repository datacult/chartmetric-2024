// © 2024 Data Culture
// Released under the ISC license.
// https://studio.datacult.com/

// Description:

export function viz_2_3(data, selector) {
  /***********************
   *1. Access data
   ************************/
  let platformsContainer = d3
    .select("#" + selector)
    .append("div")
    .attr("id", "platforms-container");
  // Select the container

  function draw() {
    // Platforms to loop through and create columns
    let platforms = ["TikTok", "Instagram", "YouTube"];
    let platformIcons = {
      TikTok:
        '<img src="https://assets-global.website-files.com/65af667017937d540b1c9600/65af667017937d540b1c9668_tiktok-logo.svg" loading="lazy" width="30" alt="">',
      Instagram:
        '<img src="https://assets-global.website-files.com/65af667017937d540b1c9600/65af667017937d540b1c966a_instagram-logo.svg" loading="lazy" width="30" alt="">',
      YouTube:
        '<img src="https://assets-global.website-files.com/65af667017937d540b1c9600/65af667017937d540b1c9669_yt-logo.svg" loading="lazy" width="30" alt="">',
    };

    const colorScale = d3.scaleOrdinal(platforms, [
      "#E7F0ED",
      "#E1E8EE",
      "#F1E5F3",
    ]);
    platforms.forEach((platform) => {
      // Filter and sort data based on the platform
      let platformData = data
        .filter((d) => d.PLATFORM.toLowerCase() === platform.toLowerCase())
        .sort(
          (a, b) => b.FOLLOWERS_2024_PROPORTION - a.FOLLOWERS_2024_PROPORTION
        );

      // Create a column for each platform
      let column = platformsContainer
        .append("div")
        .attr("class", `column ${platform.toLowerCase()}`);
      //* for each platform, there are two sections in a column: The icon and the platform text
      //* let's append the country section
      let countrySection = column
        .append("div")
        .attr("class", "country-section");
      //* let's append the country section
      let iconSection = column.append("div").attr("class", "icon-section");

      // platformData has 10 rows
      platformData.forEach((d, i) => {
        let countryRow = countrySection
          .append("div")
          .attr("class", "country-row")
          .style("background-color", () => {
            return colorScale(d.PLATFORM);
          });
        countryRow
          .append("div")
          .attr("class", "country-name")
          .html(i + 1 + ". " + d.COUNTRY_NAME);
        countryRow
          .append("span")
          .attr("class", "country-value")
          .text(d3.format(".1%")(d.FOLLOWERS_2024_PROPORTION));
      });

      // icon and platform name
      let headingContainer = iconSection
        .append("div")
        .attr("class", "header-container");
      headingContainer
        .append("div")
        .attr("class", (d) => {
          return "icon";
        })
        .html((d) => {
          return platformIcons[platform];
        });
      headingContainer.append("div").attr("class", "text").text(platform);
    });

    // Add event listeners
    d3.selectAll(".country-row").on("mouseover", function () {
      // 'this' refers to the hovered element
      // find the hovered country name
      let hoveredCountryRow = d3.select(this).select(".country-name").text();
      // extrac that name
      const hoveredCountryName = hoveredCountryRow.replace(/^\d+\.\s*/, "");
      d3.selectAll(".country-row").each(function () {
        // check all the country rows to see if they have the same country name
        if (
          d3
            .select(this)
            .select(".country-name")
            .text()
            .includes(hoveredCountryName)
        ) {
          // if they do, give them `highlighted` class
          d3.select(this).classed("highlighted", true);
        }
      });
    });

    d3.selectAll(".country-row").on("mouseout", function () {
      d3.selectAll(".country-row").classed("highlighted", false);
    });
  }
  function update(data) {
    draw();
  }
  update();

  return {
    update: update,
  };
}
