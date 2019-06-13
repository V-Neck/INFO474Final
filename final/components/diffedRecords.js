const React = require('react');
const D3Component = require('idyll-d3-component');
const d3 = require('d3');

const size = 1200;

class CustomD3Component extends D3Component {
    
    clone(obj) {
        if (null == obj || "object" != typeof obj) return obj;
        var copy = obj.constructor();
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
        }
        return copy;
    } 

    levenshteinDistance (s, t) {
        if (!s.length) return t.length;
        if (!t.length) return s.length;
    
        return Math.min(
            this.levenshteinDistance(s.substr(1), t) + 1,
            this.levenshteinDistance(t.substr(1), s) + 1,
            this.levenshteinDistance(s.substr(1), t.substr(1)) + (s[0] !== t[0] ? 1 : 0)
        ) + 1;
    }

    tabulate(data, columns) {
        var table = d3.select(this.node).append('table');
        var thead = table.append('thead');
        var tbody = table.append('tbody');

        for (var i = 0; i < data.length; i++) {
            var newRow = {};
            for (var key in Object.keys(data[i])) {
                if (!key.includes("in_")) {
                    newRow[key] = data[i][key];
                }
            }
        }

        var newColumns = [];
        for (var i = 0; i < columns.length; i++) {
            if (!columns[i].includes("in_")) {
                newColumns.push(columns[i]);
            }
        }


    columns = newColumns;

    // append the header row
    thead.append('tr')
      .selectAll('th')
      .data(columns).enter()
      .append('th')
      .text(function (column) { return column; });

    // create a row for each object in the data
    var rows = tbody.selectAll('tr')
      .data(data)
      .enter()
      .append('tr');

    // create a cell in each row for each column
    rows.selectAll('td')
      .data(function (row) {
        return columns.map(function (column) {
          return { column: column, value: row[column] };
        });
      })
      .enter()
      .append('td')
      .text(function (d) { return d.value; });

    return table;
    }
    
    redoDiff(data, idx) {
        var pair = data.slice(idx, idx+2);
        var diff = this.clone(pair[0]);
        for (var k of Object.keys(diff)) {
            if (this.diffCols.includes(k)) {
                if (['year', 'age'].includes(k)) {
                    diff[k] = (+pair[0][k]) - (+pair[1][k]);
                }
                
                if (['race', 'sex', 'state'].includes(k)) {
                    diff[k] = pair[0][k] == pair[1][k];
                }

                if (['firstname', 'lastname'].includes(k)) {
                    diff[k] = this.levenshteinDistance(pair[0][k], pair[1][k]);
                }
            } else {
                diff[k] = "";
            }
        }
        return diff;
    }
    
    initialize(node, props) {
        this.node = node;
        this.diffCols = props.diffCols;
        this.cols = ['firstname', 'lastname', "race", "year", "sex", "state"];
        var data = props.data;
        
        var idx = props.idx;
        var diff = this.redoDiff(data, idx);
        this.pairTable = this.tabulate([diff], this.cols);
    }

    update(props, oldProps) {
        var data = props.data;
        var idx = props.idx;
        this.diffCols = props.diffCols
        
        this.pairTable.remove();
        var diff = this.redoDiff(data, idx);
        this.pairTable = this.tabulate([diff], this.cols);
    }
}

module.exports = CustomD3Component;
