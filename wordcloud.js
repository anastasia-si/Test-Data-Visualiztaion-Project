function buildWordCloud(data) {
// var color = d3.scaleOrdinal(d3.schemeCategory20);
    const wordScale = d3.scaleLinear()
        .domain([0,80])
        .range([20,100])

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

}