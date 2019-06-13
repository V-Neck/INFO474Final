const React = require('react');
const D3Component = require('idyll-d3-component');
const d3 = require('d3');

const size = 1200;

class pairOfRecords extends D3Component {

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

    initialize(node, props) {
        this.node = node;
        var cols = ['id', 'firstname', 'lastname', "race", "year", "sex", "state"];
        this.pair = props.pair;
        var idx = props.idx;
        console.log(this.pair.slice(idx, idx+2));
        this.tabulate(this.pair.slice(idx, idx +2), cols);
    }
    
    initialize(node, props) {
        this.node = node;
        this.cols = ['id', 'firstname', 'lastname', "race", "year", "sex", "state"];
        this.data = props.pair;
        var idx = props.idx;
        this.pair = this.data.slice(idx, idx+2);
        this.pairTable = this.tabulate(this.pair, this.cols)
    }

    update(props, oldProps) {
        var idx = props.idx;
        this.pair = this.data.slice(idx, idx+2);
        this.pairTable.remove();
        this.pairTable = this.tabulate(this.data.slice(idx, idx +2), this.cols);
    }
}

module.exports = pairOfRecords;
