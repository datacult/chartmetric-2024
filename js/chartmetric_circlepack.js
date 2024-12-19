// © 2024 Data Culture
// Released under the ISC license.
// https://studio.datacult.com/ 

// Description: Circle Pack with custom hover drill down

export function chartmetric_circlepack(data, map, options) {

  ////////////////////////////////////////
  /////////////// Defaults ///////////////
  ////////////////////////////////////////

  let mapping = {
    fill: null,
    stroke: null,
    group: null,
    label: null,
    value: null,
    image: null,
    filter: {}
  }

  // merge default mapping with user mapping
  map = { ...mapping, ...map };

  let defaults = {
    selector: '#vis',
    width: 800,
    height: 800,
    margin: { top: 100, right: 100, bottom: 100, left: 100 },
    transition: 500,
    delay: 100,
    padding: 0.1,
    size: 10,
    fill: "black",
    stroke: "black",
    opacity: 0.2,
    focus: -1,
    background: null,
    blend: "none",
    text: "black"
  }

  // merge default options with user options
  options = { ...defaults, ...options };

  ////////////////////////////////////////
  ////////////// Helpers /////////////////
  ////////////////////////////////////////

  const height = options.height - options.margin.top - options.margin.bottom;
  const width = options.width - options.margin.left - options.margin.right;
  const t = d3.transition().duration(options.transition).ease(d3.easeLinear)
  let node;

  ////////////////////////////////////////
  ////////////// SVG Setup ///////////////
  ////////////////////////////////////////

  const div = d3.select(options.selector);

  const container = div.append('div')
    .classed('vis-svg-container', true);

  const svg = container.append('svg')
    .attr('width', '100%') // Responsive width
    .attr('height', '100%') // Responsive height
    .attr('viewBox', `0 0 ${options.width} ${options.height}`)
    .classed('vis-svg', true);

  const tooltip = d3.select(options.selector).append("div")
    .attr("id", options.selector.substring(1) + "_tooltip", true)
    .attr("opacity", 0)
    .style("position", "fixed")
    .style("pointer-events", "none")
    .style("background-color", "black")
    .classed('tooltip', true);

  if (map.image != null) {

    const defs = svg.append("defs");

    defs
      .selectAll("pattern")
      .data(data)
      .join("pattern")
      .attr("id", (d, i) => {
        return "image-fill-" + d[map.image];
      }) // Unique ID for each pattern
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("patternContentUnits", "objectBoundingBox")
      .append("image")
      .attr("xlink:href", (d) => d[map.image]) // URL of the image
      .attr("width", 1)
      .attr("height", 1)
      .attr("preserveAspectRatio", "xMidYMid slice");
  }

  ////////////////////////////////////////
  ////////////// Wrangle /////////////////
  ////////////////////////////////////////

  function transformData(data) {
    var root = {
      "name": "",
      "children": []
    };

    if (map.group != null) {

      var groups = {};
      let duplicateTracker = {}

      data.forEach(function (d) {
        var groupName = d[map.group];

        if (!groups[groupName]) {
          groups[groupName] = {
            "name": groupName,
            "title": groupName,
            "children": []
          };
          root.children.push(groups[groupName]);
          duplicateTracker[groupName] = new Set()
        }

        let child = {
          "name": "",
          "title": map.label ? d[map.label] : d[map.group],
          "value": map.value ? d[map.value] : 1,
          "image": map.image ? d[map.image] : null
        }

        // check for duplicates before adding
        if (!duplicateTracker[groupName].has(JSON.stringify(child))) {
          duplicateTracker[groupName].add(JSON.stringify(child))
          groups[groupName].children.push(child);
        } else {
          // console.log("Duplicate found in group:", groupName, child)
        }

      });

    } else {

      data.forEach(function (d) {
        root.children.push({
          "name": map.label ? d[map.label] : "",
          "title": map.label ? d[map.label] : "",
          "value": map.value ? d[map.value] : 1,
          "image": map.image ? d[map.image] : null
        });
      });

    }

    return root;
  }

  ////////////////////////////////////////
  ////////////// DOM Setup ///////////////
  ////////////////////////////////////////


  if (options.background != null) {
    svg.append("image")
      .attr("xlink:href", options.background)
      .attr("width", options.width)
      .attr("height", options.height)
  }


  let background_hover = svg.append("rect")
    .attr("width", options.width)
    .attr("height", options.height)
    .attr("x", 0)
    .attr("y", 0)
    .style("fill", "transparent")
    .on("mouseover", function (event, d) {
      updateFocus(-1)

    });

  const svg_inner_group = svg
    .append('g')
    .attr('transform', `translate(${options.margin.left},${options.margin.top})`);

  function addNodes() {

    ////////////////////////////////////////
    ////////////// Filter Data /////////////
    ////////////////////////////////////////

    let filteredData = data;

    if (Object.keys(map.filter).length > 0) {
      Object.entries(map.filter).forEach(([key, value]) => {
        filteredData = filteredData.filter(d => d[key] == value)
      })
    }

    ////////////////////////////////////////
    ////////////// Pack Data ///////////////
    ////////////////////////////////////////

    var hierarchicalData = transformData(filteredData);

    let root = d3.hierarchy(hierarchicalData)
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value);

    let pack = d3.pack()
      .size([width, height])
      .padding(options.padding);

    root = pack(root);

    ////////////////////////////////////////
    ////////////// Add Nodes ///////////////
    ////////////////////////////////////////

    svg_inner_group.selectAll('.node').remove()

    node = svg_inner_group.selectAll('.node')
      .data(root.descendants())
      .enter().append('g')
      .attr('class', 'node')
      .attr('transform', d => 'translate(' + d.x + ',' + d.y + ')');

    node.append('circle')
      .attr('r', 0)
      .attr("fill", d => map.fill != null ? d[map.fill] : options.fill)
      .attr("stroke", d => d.depth > 0 ? map.stroke != null ? d[map.stroke] : options.stroke : "none")
      .attr("fill-opacity", d => d.depth > options.focus + 1 ? options.opacity : 0)
      .style("mix-blend-mode", options.blend)
      .attr("pointer-events", "all");

    node.append('text')
      .attr('dy', '-0.4em')
      .style('text-anchor', 'middle')
      .text(d => d.data.name ? d.data.name : '')
      .attr('font-size', d => d3.max([d.r / 5, options.size]) + 'px')
      .attr('opacity', d => d.depth == 0 ? 0 : d.depth == options.focus + 2 ? 1 : 0)
      .attr('fill', options.text)
      .attr("pointer-events", "none")
      .append("tspan")
      .attr("x", 0)
      .attr("dy", "1.2em")
      .text(d => d.depth == 1 ? d.children.length : "");

    node.append('title')
      .text(d => d.data.title);

    node
      .on('mouseover', function (event, d) {

        if (d.depth < 2) {
          updateFocus(d.depth)
        }

        if (d.depth == 2 && map.image != null) {

          tooltip
            .style("display", "block")
            .style("left", event.clientX + 20 + "px")
            .style("top", event.clientY + 20 + "px");

          tooltip
            .append("div")
            .html(d.data.title)
            .style("font-weight", "bold")
            .style("color","white")
            .attr("id", options.selector.substring(1) + "_tooltip_title", true);

          tooltip
            .append("div")
            .html(d.parent.data.title)
            .style("font-weight", "normal")
            .style("color","white")
            .attr("id", options.selector.substring(1) + "_tooltip_subtitle", true);

          tooltip
            .append("div")
            .append("img")
            .attr("src", d.data.image)
            .attr("id", options.selector.substring(1) + "_tooltip_image", true);

          d3.select(this).select('circle')
            .attr("fill", d => "url(#image-fill-" + d.data.image + ")")
            .attr("fill-opacity", 1)
            .style("mix-blend-mode", "")

          d3.select(this).select('text')
            .attr("opacity", 0)
        }

      })
      .on('mouseout', function (event, d) {

        tooltip.selectAll("div").remove()
        tooltip.style("display", "none")

        if (d.depth == 2 && map.image != null) {
          d3.select(this).select('circle')
            .attr("fill", d => map.fill != null ? d[map.fill] : options.fill)
            .attr("fill-opacity", options.opacity)
            .style("mix-blend-mode", options.blend);

          d3.select(this).select('text')
            .attr("opacity", 1)
        }

      })
  }

  addNodes()


  ////////////////////////////////////////
  ////////////// Update //////////////////
  ////////////////////////////////////////

  function updateFocus(focus, forceUpdate = false) {

    if (focus == options.focus && forceUpdate != true) return;

    options.focus = focus;

    node.selectAll('circle')
      .transition()
      .duration(options.transition)
      .attr("fill-opacity", d => d.depth == 2 ? options.opacity : d.depth > options.focus + 1 ? options.opacity : 0)
      .attr('r', d => d.depth > 1 ? options.focus == -1 ? 0 : d.r : d.r);

    node.selectAll('text')
      .attr("opacity", 0)
      .transition()
      .duration(options.transition)
      .delay(options.transition)
      .attr('opacity', d => d.depth == 0 ? 0 : d.depth == options.focus + 2 ? 1 : 0)

  }

  function update(newData = data, newMap = map, newOptions = options) {

    // merge any new mapping and options
    if (newData == null) newData = data;
    data = newData

    map = { ...map, ...newMap };
    options = { ...options, ...newOptions };

    const t = d3.transition().duration(options.transition)

    if (newData != data || newMap != map || newOptions != options) addNodes()

    updateFocus(options.focus, true)    

  }

  update()


  return {
    update: update,
  }

};