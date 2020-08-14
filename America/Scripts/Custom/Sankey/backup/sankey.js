d3.sankey = function() {
  var sankey = {},
      nodeWidth = 24,
      nodePadding = 8,
      size = [1, 1],
      nodes = [],
      links = [],
      useQS = false;

  //Custom node & link sizes
  sankey.useQS = function(_) {
    if (!arguments.length) return useQS;
    useQS = _;
    return sankey;
  };

  sankey.nodeWidth = function(_) {
    if (!arguments.length) return nodeWidth;
    nodeWidth = +_;
    return sankey;
  };

  sankey.nodePadding = function(_) {
    if (!arguments.length) return nodePadding;
    nodePadding = +_;
    return sankey;
  };

  sankey.nodes = function(_) {
    if (!arguments.length) return nodes;
    nodes = _;
    return sankey;
  };

  sankey.links = function(_) {
    if (!arguments.length) return links;
    links = _;
    return sankey;
  };

  sankey.size = function(_) {
    if (!arguments.length) return size;
    size = _;
    return sankey;
  };

  sankey.layout = function(iterations) {
    computeNodeLinks();
    computeNodeValues();
    computeNodeBreadths();
    computeNodeDepths(iterations);
    computeLinkDepths();
    return sankey;
  };

  sankey.relayout = function() {
    computeLinkDepths();
    return sankey;
  };

  sankey.link = function() {
    var curvature = .5;

    function link(d) {
      var x0 = d.source.x + d.source.dx,
          x1 = d.target.x,
          xi = d3.interpolateNumber(x0, x1),
          x2 = xi(curvature),
          x3 = xi(1 - curvature),
          y0 = d.source.y + d.sy + d.dy / 2,
          y1 = d.target.y + d.ty + d.dy / 2;
      return "M" + x0 + "," + y0
           + "C" + x2 + "," + y0
           + " " + x3 + "," + y1
           + " " + x1 + "," + y1;
    }

    link.curvature = function(_) {
      if (!arguments.length) return curvature;
      curvature = +_;
      return link;
    };

    return link;
  };

  // Populate the sourceLinks and targetLinks for each node.
  // Also, if the source and target are not objects, assume they are indices.
  function computeNodeLinks() {
    nodes.forEach(function(node) {
      node.sourceLinks = [];
      node.targetLinks = [];
    });
    links.forEach(function(link) {
      var source = link.source,
          target = link.target;
      if (typeof source === "number") source = link.source = nodes[link.source];
      if (typeof target === "number") target = link.target = nodes[link.target];
      source.sourceLinks.push(link);
      target.targetLinks.push(link);
    });
  }

  // Compute the value (size) of each node by summing the associated links.
  function computeNodeValues() {
    nodes.forEach(function(node) {
      node.value = Math.max(
        d3.sum(node.sourceLinks, value),
        d3.sum(node.targetLinks, value)
      );
    });
  }

  // Iteratively assign the breadth (x-position) for each node.
  // Nodes are assigned the maximum breadth of incoming neighbors plus one;
  // nodes with no incoming links are assigned breadth zero, while
  // nodes with no outgoing links are assigned the maximum breadth.
  function computeNodeBreadths() {
    var remainingNodes = nodes,
        nextNodes,
        x = 0;

    while (remainingNodes.length) {
      nextNodes = [];
      remainingNodes.forEach(function(node) {
        node.x = x;
        node.dx = nodeWidth;
        node.sourceLinks.forEach(function(link) {
          if (nextNodes.indexOf(link.target) < 0) {
            nextNodes.push(link.target);
          }
        });
      });
      remainingNodes = nextNodes;
      ++x;
    }

    //
    moveSinksRight(x);
    scaleNodeBreadths((size[0] - nodeWidth) / (x - 1));
  }

  function moveSourcesRight() {
    nodes.forEach(function(node) {
      if (!node.targetLinks.length) {
        node.x = d3.min(node.sourceLinks, function(d) { return d.target.x; }) - 1;
      }
    });
  }

  function moveSinksRight(x) {
    nodes.forEach(function(node) {
      if (!node.sourceLinks.length) {
        node.x = x - 1;
      }
    });
  }

  function scaleNodeBreadths(kx) {
    nodes.forEach(function(node) {
      node.x *= kx;
    });
  }

  function computeNodeDepths(iterations) {
    var nodesByBreadth = d3.nest()
        .key(function(d) { return d.x; })
        .sortKeys(d3.ascending)
        .entries(nodes)
        .map(function(d) { return d.values; });

    //
    initializeNodeDepth();
    resolveCollisions();
    for (var alpha = 1; iterations > 0; --iterations) {
      relaxRightToLeft(alpha *= .99);
      resolveCollisions();
      relaxLeftToRight(alpha);
      resolveCollisions();
    }

    function initializeNodeDepth() {
      var ky = d3.min(nodesByBreadth, function(nodes) {
        return (size[1] - (nodes.length - 1) * nodePadding) / d3.sum(nodes, value);
      });

      var dyValues = [];

      links.forEach(function(link) {
        dyValues.push(link.value * ky);
      });

      var quantile = d3.scale.quantile()
            .domain(dyValues)
            .range(d3.range(4,26, (25-4)/dyValues.length));


      links.forEach(function(link) {
        if(!useQS)
          link.dy = link.value * ky;
        else
          link.dy = quantile(link.value * ky);
      });

      dyValues = [];

      nodesByBreadth.forEach(function(nodes) {
        nodes.forEach(function(node, i) {
          dyValues.push(node.value * ky);
        });
      });


      quantile = d3.scale.quantile()
            .domain(dyValues)
            .range(d3.range(45,71,1));

      nodesByBreadth.forEach(function(nodes) {
        nodes.forEach(function(node, i) {
          node.y = i;

          if(!useQS)
            node.dy = node.value * ky;
          else{
            node.dy = quantile(node.value);
            node.exactSize = 0;
            if(node.sourceLinks.length){
              node.sourceLinks.forEach(function(link, i) {
                node.exactSize += link.dy;
              });
            }
            else{
              node.targetLinks.forEach(function(link, i) {
                node.exactSize += link.dy;
              });
            }
          }
        });
      });
    }

    function relaxLeftToRight(alpha) {
      nodesByBreadth.forEach(function(nodes, breadth) {
        nodes.forEach(function(node) {
          if (node.targetLinks.length) {
            var y = d3.sum(node.targetLinks, weightedSource) / d3.sum(node.targetLinks, value);
            node.y += (y - center(node)) * alpha;
          }
        });
      });

      function weightedSource(link) {
        return center(link.source) * link.value;
      }
    }

    function relaxRightToLeft(alpha) {
      nodesByBreadth.slice().reverse().forEach(function(nodes) {
        nodes.forEach(function(node) {
          if (node.sourceLinks.length) {
            var y = d3.sum(node.sourceLinks, weightedTarget) / d3.sum(node.sourceLinks, value);
            node.y += (y - center(node)) * alpha;
          }
        });
      });

      function weightedTarget(link) {
        return center(link.target) * link.value;
      }
    }

    function resolveCollisions() {
      nodesByBreadth.forEach(function(nodes) {
        var node,
            dy,
            y0 = 0,
            n = nodes.length,
            i;

        // Push any overlapping nodes down.
        nodes.sort(customDepth);
        for (i = 0; i < n; ++i) {
          node = nodes[i];
          dy = y0 - node.y;
          if (dy > 0) node.y += dy;
          y0 = node.y + node.dy + nodePadding;
        }

        // If the bottommost node goes outside the bounds, push it back up.
        dy = y0 - nodePadding - size[1];
        if (dy > 0) {
          y0 = node.y -= dy;

          // Push any overlapping nodes back up.
          for (i = n - 2; i >= 0; --i) {
            node = nodes[i];
            dy = node.y + node.dy + nodePadding - y0;
            if (dy > 0) node.y -= dy;
            y0 = node.y;
          }
        }
      });
    }

    function ascendingDepth(a, b) {
      return a.y - b.y;
    }

    //Return weights so that nodes are sorted based on chart order
    function getWeight(a){
      var aWeight = 0;
      switch(a){
        case "SUR":
          aWeight = 0;
          break;
        case "SURL":
          aWeight = 1;
          break;
        case "GW":
          aWeight = 2;
          break;
        case "REC":
          aWeight = 3;
          break;
        case "SAL":
          aWeight = 4;
          break;
        case "UD":
          aWeight = 5;
          break;
        case "AD":
          aWeight = 6;
          break;
        case "ID":
          aWeight = 7;
          break;
        case "PD":
          aWeight = 8;
          break;
      }
      return aWeight;
    }

    function customDepth(a, b){
      var aWeight = getWeight(a),
      bWeight = getWeight(b);

      return aWeight- bWeight;
    }
  }

  function computeLinkDepths() {
    nodes.forEach(function(node) {
      node.sourceLinks.sort(ascendingTargetDepth);
      node.targetLinks.sort(ascendingSourceDepth);
    });
    nodes.forEach(function(node) {
      var sy = 0, ty = 0;
      node.sourceLinks.forEach(function(link) {
        link.sy = sy;
        sy += link.dy;
      });
      node.targetLinks.forEach(function(link) {
        link.ty = ty;
        ty += link.dy;
      });
    });

    function ascendingSourceDepth(a, b) {
      return a.source.y - b.source.y;
    }

    function ascendingTargetDepth(a, b) {
      return a.target.y - b.target.y;
    }
  }

  function center(node) {
    return node.y + node.dy / 2;
  }

  function value(link) {
    return link.value;
  }

  return sankey;
};


//Sankey class: draws a sankey inside an SVG in the specified DIV
//use the update function to redraw with new data but same options as declaration
//linkColorScheme: (0 (Source), 1 (Target), 2 (Gradient))
function Sankey(fluxList, modelOutput, divID, options){// width, height, linkColorScheme){

  var defaults = {
    width: 700, //SVG width
    height: 500, //SVG height
    linkColorScheme: 0, //0 (Source), 1 (Target), 2 (Gradient)
    units: "MGD", //units displayed with values
    nodeWidth: 20, //width of rects
    imgWidth: 40, //width of image
    imgHeight: 60, //height of image
    nodePadding: 50, //vertical space between nodes
    useQS: true, //use custom scaling to make rects match links
    autoScaleImgHeight: false, //scale image based on rect height
    showText: false, //show text label beside Resource/Consumer
    imgPath: "/Images/Sankey/" //User defined path for Resource/Consumer images
  };

  //fill defaults with user specified options
  if(typeof(options) != "undefined"){
      for(var option in options){
          defaults[option] = options[option];
      }
  }

  //If width is smaller than optimal scale down width objects
  if(defaults.width < 400){
    var ratio = defaults.width / 500;
    defaults.nodeWidth = ratio * defaults.nodeWidth;
    defaults.imgWidth = ratio * defaults.imgWidth;
  }

  //If height is smaller than optimal scale down height objects
  if(defaults.height < 500){
    var ratio = defaults.height / 500;
    defaults.imgHeight = ratio * defaults.imgHeight;
    defaults.nodePadding = ratio * defaults.nodePadding - 12.5;
  }

  //setup colors
  var red = '#e41a1c';
  var colorBrewer = {
    "SUR": '#8dd3c7',
    "SURL": '#ffffb3',
    "GW": '#bebada',
    "REC": '#80b1d3',
    "SAL": '#fdb462',
    "UD": '#b3de69',
    "ID": '#fccde5',
    "AD": '#d9d9d9',
    "PD": '#bc80bd'
  };

  //Draw sandkey with specified parameters
  function drawSankey(fluxList, modelOutput, divID, defaults){

    var fields = {
      "GW": {name: "Groundwater"},
      "REC": {name: "Reclaimed"},
      "SUR": {name: "Surface"},
      "SURL": {name: "Lake"},
      "SAL": {name: "Saline"}
    };

    //Loop through model results to get the Demand/Deficit for consumers
    for(var index = 0; index < modelOutput.RESULTS.length; index++){
      switch(modelOutput.RESULTS[index].FLD){
        case "UD":
          var vals = modelOutput.RESULTS[index].VALS;
          var field = {};

          field.val = vals[vals.length-1];
          field.name = "Urban/Rural";

          fields[modelOutput.RESULTS[index].FLD] = field;
          break;
        case "UDN":
          var vals = modelOutput.RESULTS[index].VALS;
          var field = {};

          field.val = vals[vals.length-1];
          
          fields[modelOutput.RESULTS[index].FLD] = field;
          break;
        case "ID":
          var vals = modelOutput.RESULTS[index].VALS;
          var field = {};

          field.val = vals[vals.length-1];
          field.name = "Industry";
          
          fields[modelOutput.RESULTS[index].FLD] = field;
          break;
        case "IDN":
          var vals = modelOutput.RESULTS[index].VALS;
          var field = {};

          field.val = vals[vals.length-1];
          
          fields[modelOutput.RESULTS[index].FLD] = field;
          break;
        case "AD":
          var vals = modelOutput.RESULTS[index].VALS;
          var field = {};

          field.val = vals[vals.length-1];
          field.name = "Agriculture";
          
          fields[modelOutput.RESULTS[index].FLD] = field;
          break;
        case "ADN":
          var vals = modelOutput.RESULTS[index].VALS;
          var field = {};

          field.val = vals[vals.length-1];
          
          fields[modelOutput.RESULTS[index].FLD] = field;
          break;
        case "PD":
          var vals = modelOutput.RESULTS[index].VALS;
          var field = {};

          field.val = vals[vals.length-1];
          field.name = "Power";
          
          fields[modelOutput.RESULTS[index].FLD] = field;
          break;
        case "PDN":
          var vals = modelOutput.RESULTS[index].VALS;
          var field = {};

          field.val = vals[vals.length-1];
          
          fields[modelOutput.RESULTS[index].FLD] = field;
          break;
      }
    }
    // console.log(fields);

    var units = defaults.units,
    nodeWidth = defaults.nodeWidth,
    imgWidth = defaults.imgWidth,
    imgHeight = defaults.imgHeight,
    useQS = defaults.useQS,
    nodePadding = defaults.nodePadding;

    var margin = {top: 10, right: 10 + nodeWidth + imgWidth, bottom: 10, left: 10 + nodeWidth + imgWidth},
        width = defaults.width - margin.left - margin.right,
        height = defaults.height - margin.top - margin.bottom;

    var formatNumber = d3.format(",.0f"),    // zero decimal places
        format = function(d) { return formatNumber(d) + " " + units; },
        color = d3.scale.category20();

    // Delete old Sankey
    d3.select(divID).select("svg").remove();

    // append the svg canvas to the page
    var svg = d3.select(divID).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", 
              "translate(" + margin.left + "," + margin.top + ")");

    // Set the sankey diagram properties
    var sankey = d3.sankey()
        .nodeWidth(nodeWidth)
        // .nodeWidth(36)
        .nodePadding(nodePadding)
        .size([width, height])
        .useQS(useQS);

    var path = sankey.link();

    var y = d3.scale.linear()
      .domain([0, 10000])
      .range([1, 6]);

    var fluxValues = [];

    fluxList.ForEach(function(d){
      fluxValues.push(d.LastValue());
    });

    var quantile = d3.scale.quantile()
      .domain(fluxValues)
      .range([1,10]);

    //set up graph in same style as original example but empty
    graph = {"nodes" : [], "links" : []};

    fluxList.ForEach(function(d){
      // console.log(d.field, d.Consumer, d.LastValue());

      if(d.LastValue()){
        graph.nodes.push({ "name": d.Resource });
        graph.nodes.push({ "name": d.Consumer });
        graph.links.push({ "source": d.Resource,
                           "target": d.Consumer,
                          // "value": Math.max(100, +d.LastValue()) });
                          "value": +d.LastValue() });
                          // "value": quantile(+d.LastValue()) });
      }
    });

     // return only the distinct / unique nodes
     graph.nodes = d3.keys(d3.nest()
       .key(function (d) { return d.name; })
       .map(graph.nodes));

     // loop through each link replacing the text with its index from node
     graph.links.forEach(function (d, i) {
       graph.links[i].source = graph.nodes.indexOf(graph.links[i].source);
       graph.links[i].target = graph.nodes.indexOf(graph.links[i].target);
     });

     //now loop through each nodes to make nodes an array of objects
     // rather than an array of strings
     graph.nodes.forEach(function (d, i) {
       graph.nodes[i] = { "name": d };
     });

    //setup d3 sankey
    sankey
      .nodes(graph.nodes)
      .links(graph.links)
      .layout(32);

    // define utility functions
    function getLinkID(d){
        return "link-" + d.source.name + "-" + d.target.name;
    }
    function nodeColor(d) { 
        return d.color = colorBrewer[d.name.replace(/ .*/, "")];
    }

    //create gradients if gradient is the current color scheme
    if(defaults.linkColorScheme == 2){
      var defs = svg.append("defs");

      // create gradients for the links
      var grads = defs.selectAll("linearGradient")
              .data(graph.links, getLinkID);

      grads.enter().append("linearGradient")
              .attr("id", getLinkID)
              .attr("gradientUnits", "objectBoundingBox"); 
                      //stretch to fit

      grads.html("") //erase any existing <stop> elements on update
          .append("stop")
          .attr("offset", "0%")
          .attr("stop-color", function(d){
              return nodeColor( (+d.source.x <= +d.target.x)? 
                               d.source: d.target) ;
          });

      grads.append("stop")
          .attr("offset", "100%")
          .attr("stop-color", function(d){
              return nodeColor( (+d.source.x > +d.target.x)? 
                               d.source: d.target) 
          });
    }

    // add in the links
    var link = svg.append("g").selectAll(".link")
        .data(graph.links)
      .enter().append("path")
        .attr("class", "link")
        .attr("d", path)
        .style("stroke", function(d){
          switch(defaults.linkColorScheme){
            //Source
            case 0:
              d.color = colorBrewer[d.source.name.replace(/ .*/, "")];
              break;
            //Target
            case 1:
              d.color = colorBrewer[d.target.name.replace(/ .*/, "")];
              break;
            //Gradient
            case 2:
              d.color = "url(#" + getLinkID(d) + ")";
              break;
          }
          return d.color;
        })
        .style("stroke-width", function(d) { return Math.max(1, d.dy); })
        .sort(function(a, b) { return b.dy - a.dy; });

    // add the link titles
    link.append("title")
          .text(function(d) {
          return fields[d.source.name].name + " → " + 
                  fields[d.target.name].name + "\n" + format(d.value); });

    // add in the nodes
    var node = svg.append("g").selectAll(".node")
        .data(graph.nodes)
      .enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) { 
        return "translate(" + d.x + "," + d.y + ")"; });
      //Uncomment below to enable dragging, NOT TESTED!!!
      /*.call(d3.behavior.drag()
        .origin(function(d) { return d; })
        .on("dragstart", function() { 
        this.parentNode.appendChild(this); })
        .on("drag", dragmove));*/


    // add the rectangles for the nodes (Consumers/Resources)
    node.append("rect")
        .attr("height", function(d) {
          if(!useQS)
            return d.dy;
          else
            return d.exactSize;
        })
        .attr("width", sankey.nodeWidth())
        .style("fill", function(d) { 
          return d.color = colorBrewer[d.name.replace(/ .*/, "")];
        })
        .style("stroke", function(d) { 
        return d3.rgb(d.color).darker(2); })
      .append("title")
        .text(function(d) {
          if(fields[d.name + "N"])
            return fields[d.name].name + "\nDemand: " + format(d.value);
          else
            return fields[d.name].name + "\nAvailable: " + format(d.value);
      });

    // add the Deficit rectangles for the Consumers
    node.filter(function(d){
        switch(d.name){
          case "UD":
          case "ID":
          case "AD":
          case "PD":
            condition = true;
            break;
          default:
            condition = false;
            break;
        }
        return condition;
      })
      .append("rect")
        .attr("height", function(d) {
          var ratio = fields[d.name + "N"].val / fields[d.name].val;
          if(!useQS)
            return ratio * d.dy;
          else
            return ratio * d.exactSize;
        })
        .attr("width", sankey.nodeWidth())
        .attr("transform", function(d){
          if(!useQS)
            return "translate(0," + (d.dy + 1) + ")";
          else
            return "translate(0," + (d.exactSize + 1) + ")";                
        })
        .style("fill", function(d) { 
        // return d.color = color(d.name.replace(/ .*/, ""));
          return d.color = red;
        })
        .style("stroke", function(d) { 
        return d3.rgb(d.color).darker(2); })
      .append("title")
        .text(function(d) { 
          return fields[d.name].name + "\nDeficit: " + format(fields[d.name + "N"].val);
        });

    // add the images for the Nodes (Consumers/Resources)
    node.append("svg:image")
        .attr("height", function(d) {

          if(defaults.autoScaleImgHeight){
            var ratio = 1;
            if(fields[d.name + "N"])
              ratio += fields[d.name + "N"].val / fields[d.name].val;

            if(!useQS)
              return ratio * d.dy;
            else
              return ratio * d.exactSize;
          }
          else{
            return imgHeight;
          }
          
          // return d.dy;
        })
        .attr("width", imgWidth)
        .attr("xlink:href", function (d) {
          // console.log(defaults.imgPath + d.name + ".png");
          return defaults.imgPath + d.name + ".png";
        })
        .attr("transform", function(d){
          var transform = "translate(";
          switch(d.name){
            case "UD":
            case "ID":
            case "AD":
            case "PD":
              transform += (nodeWidth) + ",0)";
              break;
            default:
              transform += "-" + (imgWidth + 1) + ",0)";
              break;
          }
          return transform;
        })
      .append("title")
        .text(function(d) {
          var outputString = fields[d.name].name + "\n";
          switch(d.name){
            case "UD":
            case "ID":
            case "AD":
            case "PD":
              outputString += "Demand: " + format(fields[d.name].val) + "\n";
              outputString += "Deficit: " + format(fields[d.name + "N"].val) + "\n";
              outputString += "Total: " + format(fields[d.name].val + fields[d.name + "N"].val);
              break;
            default:
              outputString += format(d.value);
              break;
          }
          return outputString;
        });

    if (defaults.showText) {
        // add in the text that displays beside the rectangles
        // for the nodes (Consumers/Resources)
        node.append("text")
            .attr("x", -6)
            .attr("y", function (d) {
                var ratio = 1;
                if (fields[d.name + "N"])
                    ratio += fields[d.name + "N"].val / fields[d.name].val;

                if (!useQS)
                    return (ratio) * d.dy / 2;
                else
                    return (ratio) * d.exactSize / 2;
                // return d.dy / 2;
            })
            .attr("dy", ".35em")
            .attr("text-anchor", "end")
            .attr("transform", null)
            .text(function (d) { return fields[d.name].name; })
          .filter(function (d) { return d.x < width / 2; })
            .attr("x", 6 + sankey.nodeWidth())
            .attr("text-anchor", "start");
    }
    // the function for moving the nodes
    // NOT TESTED
    function dragmove(d) {
      d3.select(this).attr("transform", 
          "translate(" + d.x + "," + (
                  d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))
              ) + ")");
      sankey.relayout();
      link.attr("d", path);
    }

    return sankey;
  }

  this.update = function(fluxList, modelOutput){
    this.sankey = drawSankey(fluxList, modelOutput, this.divID, this.defaults);
  }

  this.divID = divID;
  this.defaults = defaults;
  this.sankey = drawSankey(fluxList, modelOutput, divID, defaults);
}