const React = require('react');
const D3Component = require('idyll-d3-component');
const d3 = require('d3');
const topojson = require('topojson');
const d3Color = require('d3-color');
const d3Scale = require('d3-scale-chromatic');

const START_YEAR = 2013;
const N_BINS = 5;

const size = 1200;

var width = 500;
var height = 150;

class bar extends D3Component {
    initialize(node, props) {
        this.node = node;
        this.shootings = props.shootings;
        
        var dimension = props.dimension;
        var sex = props.sex;
        var race = props.race;
        var year = props.year;

        this.barSVG = d3.select(this.node)
                        .append('svg')
                        .attr("height", height + 100)
                        .attr("width", width + 50);

        var filters = {"year": year, "race": race, "sex": sex};
        this.makeBarGraph(filters, dimension);
    };

    makeBarGraph(filters, dimension) {
        var graphData = this.groupData(this.shootings, filters, dimension);
        
        var xScale = d3.scaleBand().padding(0.2);
        xScale.range([0, width])
            .domain(graphData.map(x => x.name));

        var yScale = d3.scaleLinear();
        yScale.range([height, 0])
            .domain([0, d3.max(graphData, x => x.amount)]);

        // append the rectangles for the bar chart

        this.barSVG.selectAll('g').remove().exit();
        this.barSVG.selectAll('rect').remove().exit();

        this.barSVG.selectAll(".bar")
            .data(graphData)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", d => xScale(d.name))
            .attr("width",  xScale.bandwidth())
            .attr("height", d =>   height - yScale(d.amount))
            .attr("y",      d =>     yScale(d.amount));
      
        // add the x Axis
        this.barSVG.append("g")
            .call(d3.axisBottom(xScale))
            .attr("transform", "translate(0, " + height + ")");
        
        var yAxis = d3.axisLeft(yScale);

        // add the y Axis
        this.barSVG.append("g")
            .call(yAxis);
    }

    groupData(completeData, filters, dimension) {
        var data = completeData.slice(0);

        for (var f of Object.keys(filters)) {
            var filter = filters[f];
            if (!(dimension == 'year' && f == 'year')) {
                data = data.filter(d => filter == 'All' || d[f] == filter);
            }
        }

        var rolledUp = d3.nest()
            .key(function(x) {return x[dimension]})
            .rollup(d => d.length)
            .object(data);

        var finalData = [];

        for (var k of Object.keys(rolledUp)) {
            finalData.push({'name': k, 'amount': rolledUp[k]})
        }
        finalData.sort((x,y) => d3.ascending(x.name, y.name)); 
        return finalData;
    }

    update(props, oldProps) {
        var sex = props.sex;
        var race = props.race;
        var year = props.year;
        var filters = {"year": year, "race": race, "sex": sex};

        var dimension = props.dimension;

        var graphData = this.groupData(this.shootings, filters, dimension);
        
        this.makeBarGraph(filters, dimension);
    }
}

module.exports = bar;
