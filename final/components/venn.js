const React = require('react');
const D3Component = require('idyll-d3-component');
const d3 = require('d3');
const topojson = require('topojson');
const d3Color = require('d3-color');
const d3Scale = require('d3-scale-chromatic');

const START_YEAR = 2013;
const N_BINS = 5;

const size = 1200;

var margin = { top: 20, right: 20, bottom: 20, left: 20 };
var width = 1000 - margin.left - margin.right;
var height = 800 - margin.top - margin.bottom;

class venn extends D3Component {
    initialize(node, props) {
        this.node = node;

    };


    update(props, oldProps) {
    }
}

module.exports = venn;
