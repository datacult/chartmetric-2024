// © 2024 Data Culture
// Released under the ISC license.
// https://studio.datacult.com/

export function calendarsummary(data, map, options) {
  ////////////////////////////////////////
  /////////////// Defaults ///////////////
  ////////////////////////////////////////

  let mapping = {
    fill: null,
    date: "date",
    label: "label",
  };

  // merge default mapping with user mapping
  map = { ...mapping, ...map };

  let defaults = {
    selector: "#vis",
    width: 900,
    height: 500,
    margin: { top: 10, right: 20, bottom: 30, left: 100 },
    transition: 400,
    delay: 100,
    padding: 0.25,
    fill: "#69b3a2",
    stroke: "#000",
  };

  // merge default options with user options
  options = { ...defaults, ...options };

  ////////////////////////////////////////
  ////////////// SVG Setup ///////////////
  ////////////////////////////////////////

  const div = d3.select(options.selector);

  const barChartContainer = div.append("div").classed("bar-chart", true);

  // const title = document.createElement("h2");
  // title.innerText = "Monthly Track Release Count";

  // barChartContainer.append(() => title);

  ////////////////////////////////////////
  ////////////// Helpers /////////////////
  ////////////////////////////////////////

  const height = options.height - options.margin.top - options.margin.bottom;
  const width = options.width - options.margin.left - options.margin.right;

  ////////////////////////////////////////
  ////////////// Scales //////////////////
  ////////////////////////////////////////

  const colorScale = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => d[map.fill]))
    .range(["rgb(226,178,236)", "rgb(41,13,34)"]);

  const xScale = d3
    .scaleBand()
    .domain(data.map((d) => d[map.date]))
    .range([0, width])
    .padding(options.padding);

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d[map.y])])
    .range([height, 0]);

  ////////////////////////////////////////
  ////////////// DOM Setup ///////////////
  ////////////////////////////////////////

  const barChartSvg = barChartContainer
    .append("svg")
    .attr(
      "viewBox",
      `0 0 ${width + options.margin.left + options.margin.right} ${
        height + options.margin.top + options.margin.bottom
      }`
    )
    .append("g")
    .attr(
      "transform",
      `translate(${options.margin.left},${options.margin.top})`
    );

  const xAxis = barChartSvg
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale));
  // format the x-axis labels to shorten the month names (January -> Jan)
  xAxis.selectAll("text").text((d) => d.slice(0, 3));
  // remove ticks from the x-axis
  xAxis.selectAll("line").remove();
  // remove the x-axis line
  xAxis.select(".domain").remove();

  const yAxis = barChartSvg.append("g").call(d3.axisLeft(yScale));
  // format the y axis labels to use K for thousands and zero without decimals
  yAxis.selectAll("text").text((d) => {
    if (d >= 1000) {
      return d3.format(".2s")(d);
    } else {
      return d3.format(".0f")(d);
    }
  });

  // remove the ticks from the y-axis
  yAxis.selectAll("line").remove();
  // remove the y-axis line
  yAxis.select(".domain").remove();

  barChartSvg
    .selectAll("rect")
    .data(data)
    .join("rect")
    .attr("x", (d) => xScale(d[map.date]))
    .attr("y", (d) => yScale(d[map.y]))
    .attr("width", xScale.bandwidth())
    .attr("height", (d) => height - yScale(d[map.y]))
    .attr("fill", (d) => colorScale(d[map.fill]));

  ////////////////////////////////////////
  ////////////// Update //////////////////
  ////////////////////////////////////////

  function update(newData = data, newMap = map, newOptions = options) {
    // merge any new mapping and options
    map = { ...map, ...newMap };
    options = { ...options, ...newOptions };

    const t = d3.transition().duration(options.transition);
  }

  // call for initial bar render
  update(data);

  return {
    update: update,
  };
}
