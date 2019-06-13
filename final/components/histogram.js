const React = require('react');
const D3Component = require('idyll-d3-component');
const d3 = require('d3');

const size = 1200;

class histogram extends D3Component {

    initialize(props) {
        var data = props.data;

        var margin = { top: 10, right: 30, bottom: 30, left: 40 },
            width = 960 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;

        // parse the date / time
        var parseDate = d3.timeParse("%d-%m-%Y");

        // set the ranges
        var x = d3.scaleTime()
            .domain([new Date(2010, 6, 3), new Date(2012, 0, 1)])
            .rangeRound([0, width]);
        var y = d3.scaleLinear()
            .range([height, 0]);

        // set the parameters for the histogram
        var histogram = d3.histogram()
            .value(function (d) { return d.date; })
            .domain(x.domain())
            .thresholds(x.ticks(d3.timeMonth));

        // append the svg object to the body of the page
        // append a 'group' element to 'svg'
        // moves the 'group' element to the top left margin
        var svg = d3.select("body").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");
        
        
    }

    update(props, oldProps) {
    }
}

module.exports = histogram;
