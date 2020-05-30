function generateTree(settings) {

    const elemId = settings.element;
    const margin = settings.margin;
    const width = settings.size.width - margin.left - margin.right;
    const height = settings.size.height - margin.top - margin.bottom;
    const filePath = settings.path;

    clearSVG(elemId);

    var tree_svg = d3.select(elemId).append("svg")
      .attr("width", width + margin.right + margin.left)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate("
            + margin.left + "," + margin.top + ")");

    var node_id = 0,
        duration = 500;

    var treemap = d3.tree().size([height, width]);

    d3.json(filePath, function(error, skillsData) {
         root = treemap(stratify(skillsData));
         root.x0 = height / 2;
         root.y0 = 0;

         update(root);
    });


    function update(source) {

      // Assigns the x and y position for the nodes
      var treeData = treemap(root);

      // Compute the new tree layout
      var nodes = treeData.descendants(),
          links = treeData.descendants().slice(1);

      // Normalize for fixed-depth.
      nodes.forEach(function(d){ d.y = d.depth * 180});

      // Update the nodes
      var node = tree_svg.selectAll('g.node')
          .data(nodes, function(d) {return d.id || (d.id = ++node_id); });

      // Enter any new nodes at the parent's previous position.
      var nodeEnter = node.enter().append('g')
          .attr('class', 'node')
          .attr("transform", function(d) {
            return "translate(" + source.y0 + "," + source.x0 + ")";
          })
          .on('click', click);

      // circles for nodes
      nodeEnter.append('circle')
          .attr('class', 'node')
          .attr('r', 1e-6)
          .attr('width', 150)
          .attr('height', 100)
          .style("fill", function(d) {
              return d._children ? "#cccccc" : "#ffffff";
          })
          .append("title").text(getTooltipText);

      // labels for the nodes
      nodeEnter.append('text')
          .attr("dy", ".35em")
          .attr("x", function(d) {
              return d.children || d._children ? -15 : 15;
          })
          .attr("text-anchor", function(d) {
              return d.children || d._children ? "end" : "start";
          })
          .text(function(d) {
              return d.data.id.substring(d.data.id.lastIndexOf("|") + 1);
          })
          .append("title").text(getTooltipText);

      var nodeUpdate = nodeEnter.merge(node);

      // Transition to the proper position for the node
      nodeUpdate.transition()
        .duration(duration)
        .attr("transform", function(d) {
            return "translate(" + d.y + "," + d.x + ")";
         });

      // Update the node attributes and style
      nodeUpdate.select('circle.node')
        .attr('r', 10)
        .style("fill", function(d) {
            return d._children ? "#cccccc" : "#ffffff";
        })
        .attr('cursor', function(d) {
             return d._children || d.children ? "pointer" : "auto";
        });


      // Remove any exiting nodes
      var nodeExit = node.exit().transition()
          .duration(duration)
          .attr("transform", function(d) {
              return "translate(" + source.y + "," + source.x + ")";
          })
          .remove();

      // On exit reduce the node circles size to 0
      nodeExit.select('circle')
        .attr('r', 1e-6);

      // On exit reduce the opacity of text labels
      nodeExit.select('text')
        .style('fill-opacity', 1e-6);


      var link = tree_svg.selectAll('path.link')
          .data(links, function(d) { return d.id; });


      // Enter any new links at the parent's previous position.
      var linkEnter = link.enter().insert('path', "g")
          .attr("class", "link")
          .attr('d', function(d){
            var o = {x: source.x0, y: source.y0}
            return diagonal(o, o)
          });

      var linkUpdate = linkEnter.merge(link);

      // Transition back to the parent element position
      linkUpdate.transition()
          .duration(duration)
          .attr('d', function(d){ return diagonal(d, d.parent) });

      // Remove any exiting links
      var linkExit = link.exit().transition()
          .duration(duration)
          .attr('d', function(d) {
            var o = {x: source.x, y: source.y}
            return diagonal(o, o)
          })
          .remove();



      // Store the old positions for transition
      nodes.forEach(function(d){
        d.x0 = d.x;
        d.y0 = d.y;
      });


      /**
      * Creates a curved (diagonal) path from parent to the child nodes
      */
      function diagonal(s, d) {

        path = `M ${s.y} ${s.x}
                C ${(s.y + d.y) / 2} ${s.x},
                  ${(s.y + d.y) / 2} ${d.x},
                  ${d.y} ${d.x}`

        return path;
      }

      /**
      * Toggles children on click.
      */
      function click(d) {
          if (d.children) {
            d._children = d.children;
            d.children = null;
          } else {
            d.children = d._children;
            d._children = null;
          }
          update(d);
      }
     }


    var stratify = d3.stratify()
       .parentId(function(d) { return d.id.substring(0, d.id.lastIndexOf("|")); });

    /**
    * Collapse the node and all it's children
    */
    function collapse(d) {
      if(d.children) {
        d._children = d.children
        d._children.forEach(collapse)
        d.children = null
      }
    }

    /**
    * Generate hover text for nodes
    */
    function getTooltipText (d) {
          if (!d.children && !d._children) {
            let info = d.data.id.substring(d.data.id.lastIndexOf("|") + 1)
            return info + ': ' + d.data.value;
          }
          return 'Click the node to collapse or expand'
    }

}
