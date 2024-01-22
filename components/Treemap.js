// Copyright 2021-2023 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/treemap
export function Treemap(
  svg,
  data,
  {
    // data is either tabular (array of objects) or hierarchy (nested objects)
    path, // as an alternative to id and parentId, returns an array identifier, imputing internal nodes
    id = Array.isArray(data) ? (d) => d.id : null, // if tabular data, given a d in data, returns a unique identifier (string)
    parentId = Array.isArray(data) ? (d) => d.parentId : null, // if tabular data, given a node d, returns its parent’s identifier
    children, // if hierarchical data, given a d in data, returns its children
    value, // given a node d, returns a quantitative value (for area encoding; null for count)
    sort = (a, b) => d3.descending(a.value, b.value), // how to sort nodes prior to layout
    label, // given a leaf node d, returns the name to display on the rectangle
    group, // given a leaf node d, returns a categorical value (for color encoding)
    title, // given a leaf node d, returns its hover text
    link, // given a leaf node d, its link (if any)
    linkTarget = "_blank", // the target attribute for links (if any)
    tile = d3.treemapBinary, // treemap strategy
    width = 640, // outer width, in pixels
    height = 400, // outer height, in pixels
    margin = 0, // shorthand for margins
    marginTop = margin, // top margin, in pixels
    marginRight = margin, // right margin, in pixels
    marginBottom = margin, // bottom margin, in pixels
    marginLeft = margin, // left margin, in pixels
    padding = 1, // shorthand for inner and outer padding
    paddingInner = padding, // to separate a node from its adjacent siblings
    paddingOuter = padding, // shorthand for top, right, bottom, and left padding
    paddingTop = paddingOuter, // to separate a node’s top edge from its children
    paddingRight = paddingOuter, // to separate a node’s right edge from its children
    paddingBottom = paddingOuter, // to separate a node’s bottom edge from its children
    paddingLeft = paddingOuter, // to separate a node’s left edge from its children
    round = true, // whether to round to exact pixels
    colors = d3.schemeTableau10, // array of colors
    zDomain, // array of values for the color scale
    fill = "#ccc", // fill for node rects (if no group color encoding)
    fillOpacity = group == null ? null : 0.6, // fill opacity for node rects
    stroke, // stroke for node rects
    strokeWidth, // stroke width for node rects
    strokeOpacity, // stroke opacity for node rects
    strokeLinejoin, // stroke line join for node rects
  } = {}
) {
  // If id and parentId options are specified, or the path option, use d3.stratify
  // to convert tabular data to a hierarchy; otherwise we assume that the data is
  // specified as an object {children} with nested objects (a.k.a. the “flare.json”
  // format), and use d3.hierarchy.

  // We take special care of any node that has both a value and children, see
  // https://observablehq.com/@d3/treemap-parent-with-value.

  const stratify = (data) =>
    d3
      .stratify()
      .path(path)(data)
      .each((node) => {
        if (node.children?.length && node.data != null) {
          const child = new d3.Node(node.data);
          node.data = null;
          child.depth = node.depth + 1;
          child.height = 0;
          child.parent = node;
          child.id = node.id + "/";
          node.children.unshift(child);
        }
      });
  const root =
    path != null
      ? stratify(data)
      : id != null || parentId != null
        ? d3.stratify().id(id).parentId(parentId)(data)
        : d3.hierarchy(data, children);

  // Compute the values of internal nodes by aggregating from the leaves.
  value == null
    ? root.count()
    : root.sum((d) => Math.max(0, d ? value(d) : null));

  // Prior to sorting, if a group channel is specified, construct an ordinal color scale.
  const leaves = root.leaves();
  const G = group == null ? null : leaves.map((d) => group(d.data, d));
  if (zDomain === undefined) zDomain = G;
  zDomain = new d3.InternSet(zDomain);
  const color = group == null ? null : d3.scaleOrdinal(zDomain, colors);

  // Compute labels and titles.
  const L = label == null ? null : leaves.map((d) => label(d.data, d));
  const T =
    title === undefined
      ? L
      : title == null
        ? null
        : leaves.map((d) => title(d.data, d));

  // Sort the leaves (typically by descending value for a pleasing layout).
  if (sort != null) root.sort(sort);

  // Compute the treemap layout.
  d3
    .treemap()
    .tile(tile)
    .size([width - marginLeft - marginRight, height - marginTop - marginBottom])
    .paddingInner(paddingInner)
    .paddingTop(paddingTop)
    .paddingRight(paddingRight)
    .paddingBottom(paddingBottom)
    .paddingLeft(paddingLeft)
    .round(round)(root);

  const defs = svg.append("defs");

  // circlePackingData.forEach((d, i) => {
  defs
    .append("pattern")
    .attr("id", "image-fill-") // Unique ID for each pattern
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("patternContentUnits", "objectBoundingBox")
    .append("image")
    .attr(
      "xlink:href",
      "https://share.chartmetric.com/artists/299/172/11172299/11172299-profile.webp"
    ) // URL of the image
    .attr("width", 1)
    .attr("height", 1)
    .attr("preserveAspectRatio", "xMidYMid meet");

  const node = svg
    .selectAll("a")
    .data(leaves)
    .join("a")
    .attr("xlink:href", link == null ? null : (d, i) => link(d.data, d))
    .attr("target", link == null ? null : linkTarget)
    .attr("transform", (d) => `translate(${d.x0},${d.y0})`);

  const rects = node
    .append("rect")
    .attr("class", "front-2-2-rect")
    .attr("id", (d, i) => d.id + "-front")
    .attr("fill", color ? (d, i) => color(G[i]) : fill)
    .attr("fill-opacity", fillOpacity)
    .attr("stroke", stroke)
    .attr("stroke-width", strokeWidth)
    .attr("stroke-opacity", strokeOpacity)
    .attr("stroke-linejoin", strokeLinejoin)
    .attr("width", (d) => d.x1 - d.x0)
    .attr("height", (d) => d.y1 - d.y0)
    .style('transform-origin', d=> {
      const centerX = (d.x1 - d.x0) / 2;
      const centerY = (d.y1 - d.y0) / 2;
      return `${centerX}px ${centerY}px`
    } );
  const backRects = node
    .append("rect")
    .attr("class", "back-2-2-rect")
    .attr("id", (d, i) => d.id + "-back")
    .attr("fill", color ? (d, i) => color(G[i]) : fill)
    .attr("fill-opacity", fillOpacity)
    .attr("stroke", stroke)
    .attr("stroke-width", strokeWidth)
    .attr("stroke-opacity", strokeOpacity)
    .attr("stroke-linejoin", strokeLinejoin)
    .attr("width", (d) => d.x1 - d.x0)
    .attr("height", (d) => d.y1 - d.y0)
    .attr("fill", "url(#image-fill-)")
    .style("opacity", 0) // Initially hidden
    .style('transform-origin', d=> {
      const centerX = (d.x1 - d.x0) / 2;
      const centerY = (d.y1 - d.y0) / 2;
      return `${centerX}px ${centerY}px`
    } )
    .style("transform", "scaleX(0)");
  rects.on("mouseover", function (event, d) {
  
    d3.select(this)
      .transition()
      .duration(150)
      .style("opacity", 0)
      .style("transform", "scaleX(0)")
      .end()
      .then(() => {
        // Hide the top circle
        d3.select(this).style("display", "none");

        // Prepare the back circle for display
        const backRect = svg.select(`[id="${d.id + "-back"}"]`); // unique id for that hovered rect
        backRect
          .style("display", "block")
          .style("opacity", 0)
          .style("transform", "scaleX(0)")
          .transition()
          .duration(150)
          .style("opacity", 1)
          .style("transform", "scaleX(1)");
      });
  });

  backRects.on("mouseout", function (event, d) {
    // Animate the back circle to scale down
    d3.select(this)
      .transition()
      .duration(50)
      .style("opacity", 0)
      .style("transform", "scaleX(0)")
      .end()
      .then(() => {
        // Hide the back circle
        d3.select(this).style("display", "none");
        const topRect = svg.select(`[id="${d.id + "-front"}"]`);
        // Show and animate the top circle
        topRect
          .style("display", "block")
          .style("opacity", 0)
          .style("transform", "scaleX(0)")
          .transition()
          .duration(50)
          .style("opacity", 1)
          .style("transform", "scaleX(1)");
      });
  });
  if (T) {
    node.append("title").text((d, i) => T[i]);
  }

  if (L) {
    // A unique identifier for clip paths (to avoid conflicts).
    const uid = `O-${Math.random().toString(16).slice(2)}`;

    node
      .append("clipPath")
      .attr("id", (d, i) => `${uid}-clip-${i}`)
      .append("rect")
      .attr("width", (d) => d.x1 - d.x0)
      .attr("height", (d) => d.y1 - d.y0);

    node
      .append("text")
      .attr(
        "clip-path",
        (d, i) => `url(${new URL(`#${uid}-clip-${i}`, location)})`
      )

      .selectAll("tspan")
      .data((d, i) => `${L[i]}`.split(/\n/g))
      .join("tspan")
      .attr("x", 3)
      .attr("y", (d, i, D) => `${(i === D.length - 1) * 0.3 + 1.1 + i * 0.9}em`)
      .attr("fill-opacity", (d, i, D) => (i === D.length - 1 ? 0.7 : null))
      .attr("font-size", "16px") // Adjust the size as needed
      .attr("font-weight", "700") // Adjust the weight as needed
      .text((d) => d);
  }
}
