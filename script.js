// VSCode에서 d3 intelligence를 이용하기 위한 트릭
require = function (_) { };
require('d3')
//----------------------------------
var svg = d3.select("svg"),
  width = +svg.attr("width"),
  height = +svg.attr("height");

var fader = function (color) { return d3.interpolateRgb(color, "#fff")(0.2); },
  color = d3.scaleOrdinal(d3.schemeCategory10.map(fader)),
  format = d3.format(",d");

var treemap = d3.treemap()
  .tile(d3.treemapResquarify)
  .size([width, height])
  .round(true)
  .paddingInner(1);

d3.json("data.json", function (error, data) {
  if (error) throw error;

  original = data;
  base = original.children[0];

  function zoom(data) {
    if (data.children == null)
      data = base;

    var root = d3.hierarchy(data)
    .eachBefore(function (d) { d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name; })
    .sum(function (d) { return d.size; })
    .sort(function (a, b) { return b.height - a.height || b.value - a.value; });

    treemap(root);

    svg.selectAll("g").remove();

    var cell = svg.selectAll("g")
      .data(root.children)
      .enter().append("g")
      .attr("transform", function (d) { return "translate(" + d.x0 + "," + d.y0 + ")"; });

    cell.append("rect")
      .attr("id", function (d) { return d.data.id; })
      .attr("width", function (d) { return d.x1 - d.x0; })
      .attr("height", function (d) { return d.y1 - d.y0; })
      .attr("fill", function (d) { return color(d.data.id); })
      .on("click", function (dd) {
        zoom(dd.data);
      });

    cell.append("clipPath")
      .attr("id", function (d) { return "clip-" + d.data.id; })
      .append("use")
      .attr("xlink:href", function (d) { return "#" + d.data.id; });

    cell.append("text")
      .attr("clip-path", function (d) { return "url(#clip-" + d.data.id + ")"; })
      .selectAll("tspan")
      .data(function (d) { return d.data.name.split(/(?=[A-Z][^A-Z])/g); })
      .enter().append("tspan")
      .attr("x", 4)
      .attr("y", function (d, i) { return 13 + i * 10; })
      .text(function (d) { return d; });

    cell.append("title")
      .text(function (d) { return d.data.id + "\n" + format(d.value); })
  }
  zoom(base);
  
  d3.select("#year")
  .on("change", function() {
    base = original.children[this.value];
    zoom(base);
  });
});