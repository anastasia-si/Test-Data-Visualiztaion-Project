function generateWordCloud(settings) {

    const elemId = settings.element;
    const margin = settings.margin;
    const width = settings.size.width - margin.left - margin.right;
    const height = settings.size.height - margin.top - margin.bottom;

    clearSVG(elemId);

    var wc_svg = d3.select(elemId)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)

    var g = wc_svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.csv(settings.path, function(error, data){
        // var color = d3.scaleOrdinal(d3.schemeCategory20);
        const wordScale = d3.scaleLinear()
            .domain(d3.extent(data, function(d) {return d.frequency;}))
            .range([20, 0.08 * width])  // 20px is min font size; 8% of total width is font size for the biggest words in WC

          var layout = d3.layout.cloud()
                .size([width, height])
                .timeInterval(20)
                .words(data)
                .padding(15)
                .rotate(function(d) { return 0; })
                .fontSize(d=>wordScale(d.frequency))
                .fontWeight(["bold"])
                .text(function(d) { return d.text; })
                .spiral("archimedean") // "archimedean" or "rectangular"
                .on("end", draw)
                .start();

             var wordcloud = g.append("g")
                .attr('class','wordcloud')
                .attr("transform", "translate(" + width/2 + "," + height/2 + ")");

             g.append("g")
                .attr("class", "axis")
                .attr("transform", "translate(0," + height + ")")
                .selectAll('text')

             function draw(words) {
                wordcloud.selectAll("text")
                  .data(words)
                  .enter().append("text")
                  .attr('class','word')
                  .style("font-size", function(d) { return d.size + "px"; })
                  .attr("text-anchor", "middle")
                  .attr("transform", function(d) { return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")"; })
                  .text(function(d) { return d.text; });
          };

    });
}
