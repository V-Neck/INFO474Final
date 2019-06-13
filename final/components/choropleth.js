const React = require('react');
const D3Component = require('idyll-d3-component');
const d3 = require('d3');
const topojson = require('topojson');
const d3Color = require('d3-color');
const d3Scale = require('d3-scale-chromatic');

const N_BINS = 4;

const size = 1200;

var margin = { top: 20, right: 20, bottom: 20, left: 20 };
var width = 1000
var height = 800

class choropleth extends D3Component {
    initialize(node, props) {
        this.node = node;

        this.us = props.us;
        this.shootings = props.shootings;
        this.state_pops = props.state_pops;
        this.state_to_fips = props.state_to_fips;

        this.path = d3.geoPath();
        this.states = topojson.feature(this.us, this.us.objects.states).features;

        // Munge data
        for (var row in this.state_pops) {
            this.state_pops[row]['state'] = this.state_to_fips[this.state_pops[row]['state_abb']];
        }
        for (var row in this.shootings) {
            this.shootings[row]['state'] = this.state_to_fips[this.shootings[row]['state']];
        }
        this.state_pops = d3.nest()
            .key(d => d.state)
            .key(d => d.year)
            .rollup(function (v) { return +v[0].population })
            .object(this.state_pops);

        this.mapSVG = d3.select(this.node)
            .append('svg')
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("viewBox", "0 0 1000 800")
            .style("padding-right", "5%");

        this.stateShapes = this.mapSVG.append("g")
            .attr("class", "states")
            .selectAll("path");

        this.makeChoropleth({ 'year': 2010, 'race': 'Black' });
    }

    groupData(completeData, filters) {
        var data = completeData.slice(0);
        

        for (var f of Object.keys(filters)) {
            var filter = filters[f];

            data = data.filter(function(d) {
                if (filter == "Other / NA" && (d[f] == "" || d[f] == null)) {
                    return true;
                }
                return filter == 'All' || d[f] == filter;
            });
        }

        return d3.nest()
            .key(d => d.state)
            .rollup(d => d.length)
            .object(data);
    }

    formatLegendNum(n) {
        var scaled = (n * 1e5).toString();
        return scaled.substring(0, 4);
    }

    makeChoropleth(filters) {
        // Munge Data
        var year = filters['year'];

        var shootingCount = this.groupData(this.shootings, filters);

        var maxProp = 0;
        var sumCount = 0;
        var deaths = [];

        for (var k of Object.keys(shootingCount)) {
            sumCount = sumCount + shootingCount[k];
        }

        var t_state_pops = this.state_pops;

        this.states.forEach(function (state) {
            if (shootingCount[state.id] != null) {
                var count = shootingCount[state.id];
                var pop = t_state_pops[state.id][year];
                var prop = count / pop;
            } else {
                var prop = null;
            }
            
            state.properties.prop = prop;
            state.prop = prop;
            deaths.push(prop);
            maxProp = Math.max(maxProp, prop);
        });

        var colorScale = d3.scaleQuantile()
            .domain(deaths)
            .range(d3.schemeReds[N_BINS])

        // Make Legend
        var legend_data = [];
        var quantiles = [0].concat(colorScale.quantiles())
            .concat(maxProp);
        for (var i = 0; i < N_BINS; i++) {
           var left  = this.formatLegendNum(quantiles[i]);
           var right = this.formatLegendNum(quantiles[i + 1]);
            
            var legend_datum = {
                "idx": i,
                "range": left + "-" + right,
                "color": colorScale.range()[i]
            }

            legend_data.push(legend_datum)
        }
        legend_data.push({"idx": N_BINS, 
                        "range": "No Data", 
                        "color": "grey"})
        var legend_width = 100;
        this.mapSVG.append("g")
            .selectAll("rect")
            .data(legend_data).enter()
            .append("rect")
            .attr("height", legend_width / 5)
            .attr("width", legend_width)
            .attr("y", 650)
            .attr("x", d => (d['idx'] * (legend_width + 1)))
            .style("fill", c => c['color'])
        this.mapSVG.append("g")
            .selectAll("text")
            .data(legend_data).enter()
            .append("text")
            .attr("class", "legend-text")
            .attr("y", 650 + legend_width / 7)
            .attr("x", d => (d['idx'] * legend_width + 5))
            .text(d => d.range)
            .attr("fill", "#fff")


        // Update States
        this.stateShapes
            .data(this.states)
            .enter()
            .append("path")
            .attr("d", this.path)
            .style("stroke", "#fff")
            .style("stroke-width", "1")
            .attr("fill", function(d) {
                return d.prop === null ? 'grey' : colorScale(d.prop)});

    }

    update(props, oldProps) {
        var year = props.year;
        var race = props.race;
        var sex  = props.sex;

        if (race == "Other / NA") {
            race = "";
        }

        if (sex == "Other / NA") {
            sex = "";
        }

        this.makeChoropleth({ 'year': year, 'race': race, 'sex': sex});
    }

}

module.exports = choropleth;
