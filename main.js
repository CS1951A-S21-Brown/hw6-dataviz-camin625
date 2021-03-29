// Add your JavaScript code here
const MAX_WIDTH = Math.max(1080, window.innerWidth);
const MAX_HEIGHT = 720;
const margin = {top: 40, right: 100, bottom: 40, left: 175};

// Assumes the same graph width, height dimensions as the example dashboard. Feel free to change these if you'd like
let graph_1_width = (MAX_WIDTH / 2) - 10, graph_1_height = 700;
let graph_2_width = (MAX_WIDTH / 2) - 10, graph_2_height = 400;
let graph_3_width = MAX_WIDTH, graph_3_height = 575;

let svg1 = d3.select("#graph1")
    .append("svg")
    .attr("width", graph_1_width)
    .attr("height", graph_1_height)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);


let tooltip = d3.select("#graph1")     
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

let countRef1 = svg1.append("g");

d3.csv("../data/netflix.csv").then(function(data) {
    let dict = new Map();
    for (let i = 0; i < data.length; i++) {
        let listed = data[i]["listed_in"];
        let genres = listed.split(",");
        for (let j = 0; j < genres.length; j++) {
            genre = genres[j].trim();
            if (!dict.has(genre)) {
                dict.set(genre, 1);
            }
            else {
                dict.set(genre, dict.get(genre) + 1)
            }
        }
    }

    let count = Array.from(dict.values())
    let entries = Array.from(dict.entries());
    entries = entries.sort(function(a, b) {return b[1] - a[1]})
    let x1 = d3.scaleLinear()
    .domain([0, d3.max(count)])
    .range([0, graph_1_width - margin.left - margin.right]);

    let y1 = d3.scaleBand()
    .domain(entries.map(function(entry) { return entry[0]; }))
    .range([0, graph_1_height - margin.top - margin.bottom])
    .padding(0.1);

    svg1.append("g")
    .call(d3.axisLeft(y1).tickSize(0).tickPadding(10));

    let bars1 = svg1.selectAll("rect").data(entries);

    let color1 = d3.scaleOrdinal()
    .domain(entries.map(function(d) { return d[0]; }))
    .range(d3.quantize(d3.interpolateHcl("#66a0e2", "#81c2c3"), entries.length));

    bars1.enter()
        .append("rect")
        .merge(bars1)
        .attr("fill", function(d) { return color1(d[0]); })
        .attr("x", x1(0))
        .attr("y", function(d) { return y1(d[0]); })               
        .attr("width", function(d) { return x1(d[1]); })
        .attr("height",  y1.bandwidth());
    

    let mouseover = function(d) {
        let color_span = `<span style="color: ${color1(d[1])};">`;
        let html = `${d[0]}<br/>
                ${color_span}${d[1]}</span><br/>`; 
        tooltip.html(html)
            .style("left", `${(d3.event.pageX) - 10}px`)
            .style("top", `${(d3.event.pageY) - 150}px`)
            .style("box-shadow", `2px 2px 5px ${color1(d[1])}`)   
            .transition()
            .duration(200)
            .style("opacity", 0.9)
    };

    let mouseout = function(d) {
        tooltip.transition()
            .duration(200)
            .style("opacity", 0);
    };

    let counts1 = countRef1.selectAll("text").data(entries);

    counts1.enter()
        .append("text")
        .merge(counts1)
        .attr("x", function(d) {return x1(d[1]) + 10})       
        .attr("y", function(d) {return y1(d[0]) + 10})       
        .style("text-anchor", "start")
        .text(function(d) {return "Hover Here!"})
        .style("font-size", 10)
        .on("mouseover", mouseover)
        .on("mouseout", mouseout);

    svg1.append("text")
        .attr("transform", `translate(${(graph_1_width - margin.left - margin.right) / 2}, ${(graph_1_height - margin.top - margin.bottom) + 15})`)      
        .style("text-anchor", "middle")
        .style("font-weight", "bold")
        .style("font-size", 20)
        .style("fill", "blue")
        .text("Count");
    
    svg1.append("text")
        .attr("transform", `translate(-120, ${(graph_1_height - margin.top - margin.bottom) / 2})`)      
        .style("text-anchor", "middle")
        .style("font-weight", "bold")
        .style("font-size", 20)
        .style("fill", "blue")
        .text("Genre");

    svg1.append("text")
        .attr("transform", `translate(${(graph_1_width - margin.left - margin.right) / 2}, ${-10})`)       
        .style("text-anchor", "middle")
        .style("font-size", 25)
        .style("font-weight", "bold")
        .style("fill", "blue")
        .text("Counts of Movies by Genre");
});



let svg2 = d3.select("#graph2")
    .append("svg")
    .attr("width", graph_2_width)
    .attr("height", graph_2_height)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

    let countRef2 = svg2.append("g");

    let x2 = d3.scaleLinear()
    .range([0, graph_2_width - margin.left - margin.right]);

    let y2 = d3.scaleBand()
    .range([0, graph_2_height - margin.top - margin.bottom])
    .padding(0.1);

    let color2 = d3.scaleOrdinal()

    let y_axis_label = svg2.append("g");

    svg2.append("text")
    .attr("transform", `translate(${(graph_2_width - margin.left - margin.right) / 2},
                                        ${(graph_2_height - margin.top - margin.bottom) + 15})`)     
    .style("text-anchor", "middle")
    .style("font-weight", "bold")
    .style("font-size", 20)
    .style("fill", "green")
    .text("Average Runtime");

    let title = svg2.append("text")
        .attr("transform", `translate(${(graph_2_width - margin.left - margin.right) / 2}, ${-10})`)       
        .style("text-anchor", "middle")
        .style("font-weight", "bold")
        .style("fill", "green")
        .style("font-size", 25);


    function setData(numEntries) {
    
    d3.csv("../data/netflix.csv").then(function(data) {
        let dict = new Map();
        for (let i = 0; i < data.length; i++) {
            if (data[i]["type"] != "Movie") {
                continue;
            }
            let release_year = data[i]["release_year"];
            let duration = data[i]["duration"].split(" ");
            let runtime = parseInt(duration[0]);
            if (!dict.has(release_year)) {
                dict.set(release_year, new Set());
                dict.get(release_year).add(runtime);
            }
            else {
                dict.get(release_year).add(runtime);
            }
        }

        let dict_entries = Array.from(dict.entries());
        let avg = new Map();
        for (let i = 0; i < dict_entries.length; i++) {
            let annual_movies = Array.from(dict_entries[i][1].values());
            let total_runtime = 0;
            for (let j = 0; j < annual_movies.length; j++) {
                total_runtime += annual_movies[j];
            }
            let avg_runtime = total_runtime / annual_movies.length;
            avg.set(dict_entries[i][0], avg_runtime);
        }

        let entries2 = Array.from(avg.entries());
        entries2 = entries2.sort(function(a, b) { return b[1] - a[1]});
        entries2 = entries2.slice(0, numEntries);
        let count2 = Array.from(avg.values()).sort(function(a, b) { return b - a;}).slice(0, numEntries);

        x2.domain([0, d3.max(count2)])

        y2.domain(entries2.map(function(entry) { return entry[0]; }))

        color2.domain(entries2.map(function(d) { return d[0]; }))
        .range(d3.quantize(d3.interpolateHcl("#66a0e2", "#81c2c3"), entries2.length));
        
        y_axis_label.call(d3.axisLeft(y2).tickSize(0).tickPadding(10));

        let bars2 = svg2.selectAll("rect").data(entries2);

        bars2.enter()
            .append("rect")
            .merge(bars2)
            .transition()
            .duration(1000)
            .attr("fill", function(d) { return color2(d[0]); })
            .attr("x", x2(0))
            .attr("y", function(d) { return y2(d[0]); })               
            .attr("width", function(d) { return x2(d[1]); })
            .attr("height",  y2.bandwidth());


        let counts2 = countRef2.selectAll("text").data(entries2);

        counts2.enter()
            .append("text")
            .merge(counts2)
            .transition()
            .duration(1000)
            .attr("x", function(d) {return x2(d[1]) + 10})       
            .attr("y", function(d) {return y2(d[0]) + 10})       
            .style("text-anchor", "start")
            .text(function(d) {return d[1]})
            .style("font-size", 10)

        
        svg2.append("text")
            .attr("transform", `translate(-110, ${(graph_2_height - margin.top - margin.bottom) / 2})`)      
            .style("text-anchor", "middle")
            .style("font-weight", "bold")
            .style("font-size", 20)
            .style("fill", "green")
            .text("Release Year");

        title.text(numEntries + " Years with the Longest Average Runtime");

        bars2.exit().remove();
        counts2.exit().remove();
    });
}
    
setData(15);

let svg3 = d3.select("#graph3")
    .append("svg")
    .attr("width", graph_3_width)
    .attr("height", graph_3_height)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

    let tooltip2 = d3.select("#graph3")     
    .append("div")
    .attr("class", "tooltip2")
    .style("opacity", 0);

    let countRef3 = svg3.append("g");
d3.csv("../data/netflix.csv").then(function(data) {
    let dict = {};
    for (let i = 0; i < data.length; i++) {
        let actors = data[i]["cast"].split(",");
        let directors = data[i]["director"].split(",");
        for (let j = 0; j < actors.length; j++) {
            for (let k = 0; k < directors.length; k++) {
                let actor = actors[j].trim();
                let director = directors[k].trim();
                if (actor.length === 0 || director.length === 0) {
                    continue;
                }
                let pair = [actor, director];
                if (pair in dict) {
                    dict[pair] += 1;
                    
                }
                else {
                    dict[pair] = 1;
                }
            }
        }
    }

    let entries3 = Array.from(Object.entries(dict)).sort(function(a, b) {return b[1] - a[1]; }).slice(0, 50);
    entries3 = entries3.sort(function(a, b) { return b[1] - a[1]});
    console.log(entries3);


    let y = d3.scaleBand()
            .domain(entries3.map(function(entry) { return entry[0]; }))
            .range([0, graph_3_width - margin.left - margin.right + - 674])
            .padding(0.1);

    let x = d3.scaleLinear()
            .domain([3.5, d3.max(entries3, function(d) { return d[1]; })])
            .range([0, graph_3_height - margin.top - margin.bottom + 200]);

    svg3.append("g").call(d3.axisLeft(y));

    svg3.append("g")
    .attr("transform", `translate(0, ${graph_3_height - margin.top - margin.bottom})`)       
    .call(d3.axisBottom(x));

    let color = d3.scaleOrdinal()
            .domain(entries3)
            .range(d3.quantize(d3.interpolateHcl("#66a0e2", "#ff5c7a"), entries3.length));

    let dots = svg3.selectAll("dot").data(entries3);

    svg3.append("path")
      .datum(entries3)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", d3.line()
        .x(function(d) { return x(d[1]) })
        .y(function(d) { return y(d[0]) })
        )

    dots.enter()
        .append("circle")
        .attr("cx", function (d) { return x(d[1]); })     
        .attr("cy", function (d) { return y(d[0]); })      
        .attr("r", 4)      
        .style("fill",  function(d){ return color(d[0]); })

        let mouseover = function(d) {
            let color_span = `<span style="color: ${color(d[1])};">`;
            let html = `${d[0]}<br/>
                    ${color_span}${d[1]}</span><br/>`; 
            tooltip2.html(html)
                .style("left", `${(d3.event.pageX) - 900}px`)
                .style("top", `${(d3.event.pageY) - 150}px`)
                .style("box-shadow", `2px 2px 5px ${color(d[1])}`)   
                .transition()
                .duration(200)
                .style("opacity", 0.9)
        };
    
        let mouseout = function(d) {
            tooltip2.transition()
                .duration(200)
                .style("opacity", 50);
        };

        let counts = countRef3.selectAll("text").data(entries3);

        counts.enter()
            .append("text")
            .merge(counts)
            .attr("x", function(d) {return x(d[1]) + 10})  
            .text(function() {return "Hover Here!"})     
            .attr("y", function(d) {return y(d[0]) + 10})       
            .style("text-anchor", "start")
            .style("font-size", 10)
            .on("mouseover", mouseover)
            .on("mouseout", mouseout);

    svg3.append("text")
    .attr("transform", `translate(${(graph_3_width - margin.left - margin.right - 500) / 2},
                                ${(graph_3_height - margin.top - margin.bottom) + 35})`)      
    .style("text-anchor", "middle")
    .style("font-weight", "bold")
    .style("font-size", 20)
    .style("fill", "red")
    .text("Number of Movies Together");

    svg3.append("text")
        .attr("transform", `translate(-80, ${(graph_3_height - margin.top - margin.bottom - 500) / 2})`)       
        .style("text-anchor", "middle")
        .text("Actor-Director Duos")
        .style("font-weight", "bold")
        .style("fill", "red")
        .style("font-size", 20)

    svg3.append("text")
        .attr("transform", `translate(${(graph_3_width - margin.left - margin.right - 600) / 2}, ${-20})`)     
        .style("text-anchor", "middle")
        .style("font-size", 25)
        .style("font-weight", "bold")
        .style("fill", "red")
        .text("Top Actor and Director Duos");
});