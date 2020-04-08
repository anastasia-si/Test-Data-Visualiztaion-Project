function buildBubble(data)  {

// ---------------------------//
//       AXIS  AND SCALE      //
// ---------------------------//

   // Add X axis
    var mindate = new Date(1980,0,1),
        maxdate = new Date(2020,0,31);

    var x = d3.scaleTime()
        .domain([mindate, maxdate])
    .range([0, width]);

    bubble_svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).ticks(5));

    // X axis label:
    bubble_svg.append("text")
     .attr("text-anchor", "end")
     .attr("x", width)
     .attr("y", height + 30)
     .attr("class", "bubble-axis-label")
     .text("Publication Date");

    // Y axis
    var y = d3.scaleLinear()
    .domain([2, 5])
    .range([ height, 0]);
    bubble_svg.append("g")
    .call(d3.axisLeft(y));

    // Y axis label:
    bubble_svg.append("text")
     .attr("class", "bubble-axis-label")
     .attr("x", 0)
     .attr("y", -10)
     .text("Rating")

    var ticks = d3.selectAll(".tick text");
    ticks.attr("class", "bubble-axis-label");

    // Scale for bubble size
    var z = d3.scaleSqrt()
    .domain([0, 7000])
    .range([ 2, 30]);

    // Scale for bubble color
    var bubbleColor = d3.scaleOrdinal()
    .domain(lang_codes)
    .range(d3.schemeSet1);


// ---------------------------//
//      TOOLTIP               //
// ---------------------------//

   var showTooltip = function(d) {
        tooltip
         .transition()
         .duration(100)
        tooltip
         .style("opacity", 0.9)
         .html("Book: <b>" + d.title + "</b><br>" +
               "Author: <b>" + d.authors + "</b><br>" +
               d.num_pages + " pages<br>" +
               "Publication date: " + d.publication_date + "<br>" +
               "Rating: " + d.average_rating + "<br>");
    }

    var moveTooltip = function(d) {
        tooltip
          .style("top", d3.select(this).attr("cy") + "px")
          .style("left", d3.select(this).attr("cx") + "px")
    }

    var hideTooltip = function(d) {
    tooltip
     .transition()
     .duration(200)
     .style("opacity", 0)
    }


// ---------------------------//
//       HIGHLIGHT GROUP      //
// ---------------------------//

// When a legend category is hovered
var highlight = function(d){
    d3.selectAll(".bubbles").style("opacity", .05)
    d3.selectAll("."+d).style("opacity", 1)
}

// When a legend category is not hovered anymore
var noHighlight = function(d){
    d3.selectAll(".bubbles").style("opacity", 1)
}


// ---------------------------//
//       CIRCLES              //
// ---------------------------//

bubble_svg.append('g')
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", function(d) { return "bubbles " + d.language_code })
    .attr("cx", function (d) {  return x(d3.timeParse("%d.%m.%Y")(d.publication_date)); })
    .attr("cy", function (d) { return y(d.average_rating); })
    .attr("r", function (d) { return z(d.num_pages); })
    .style("fill", function (d) { return bubbleColor(d.language_code); })
    .on("mouseover", showTooltip )
    .on("mousemove", moveTooltip )
    .on("mouseleave", hideTooltip )



// ---------------------------//
//       LEGEND              //
// ---------------------------//

legend_label_position_x = width - 70
legend_circle_position_x = width - 70
legend_circle_position_y = height - 30
legend_bubble_position_x = width - 110


// Legend: bubble sizes
var valuesToShow = [50, 1000, 5000]
var xCircle = legend_bubble_position_x
var xLabel = legend_label_position_x
bubble_svg
    .selectAll("legend")
    .data(valuesToShow)
    .enter()
    .append("circle")
    .attr("cx", xCircle)
    .attr("cy", function(d){ return legend_circle_position_y - z(d) } )
    .attr("r", function(d){ return z(d) })
    .style("fill", "none")
    .attr("stroke", "black")

bubble_svg
    .selectAll("legend")
    .data(valuesToShow)
    .enter()
    .append("line")
    .attr('x1', function(d){ return xCircle + z(d) } )
    .attr('x2', xLabel)
    .attr('y1', function(d){ return legend_circle_position_y - z(d) } )
    .attr('y2', function(d){ return legend_circle_position_y - z(d) } )
    .attr('stroke', 'black')
    .style('stroke-dasharray', ('2,2'))

// Legend: labels for bubble sizes
bubble_svg
    .selectAll("legend")
    .data(valuesToShow)
    .enter()
    .append("text")
    .attr('x', xLabel)
    .attr('y', function(d){ return legend_circle_position_y - z(d) } )
    .text( function(d){ return d } )
    .attr("class", "bubble-legend")

// Legend title
bubble_svg.append("text")
    .attr('x', xCircle)
    .attr("y", legend_circle_position_y + 10)
    .text("Number of pages")
    .attr("text-anchor", "middle")
    .attr("class", "bubble-legend")


// Legend dots
var size = 20

bubble_svg.selectAll("legend")
 .data(lang_codes)
 .enter()
 .append("circle")
   .attr("cx", legend_circle_position_x)
   .attr("cy", function(d,i){ return 10 + i*(size+5)})
   .attr("r", 7)
   .style("fill", function(d){ return bubbleColor(d)})
   .on("mouseover", highlight)
   .on("mouseleave", noHighlight)

// Category labels for legend dots
 bubble_svg.selectAll("legend")
 .data(lang_codes)
 .enter()
 .append("text")
   .attr("x", legend_label_position_x + size*.8)
   .attr("y", function(d,i){ return i * (size + 5) + (size/2)})
   .style("fill", function(d){ return bubbleColor(d)})
   .text(function(d){ return languages[d]})
   .attr("text-anchor", "left")
   .attr("class", "bubble-legend")
   .on("mouseover", highlight)
   .on("mouseleave", noHighlight)


}
