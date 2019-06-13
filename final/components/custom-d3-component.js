const React = require('react');
const D3Component = require('idyll-d3-component');
const d3 = require('d3');

const size = 1200;

class CustomD3Component extends D3Component {
  getRandomSubarray(arr, size) {
    var shuffled = arr.slice(0), i = arr.length, temp, index;
    while (i--) {
      index = Math.floor((i + 1) * Math.random());
      temp = shuffled[index];
      shuffled[index] = shuffled[i];
      shuffled[i] = temp;
    }
    return shuffled.slice(0, size);
  }

  blockedCombinate(data1, data2, blocks) {
    var counter = 0;
    var newData = [];
    for (var i = 0; i < data1.length; i++) {
      for (var j = 0; j < data2.length; j++) {
        var flag = false;

        for (var b in blocks) {
          var block = blocks[b];
          console.log(data1[i][block]);
          console.log(data2[j][block]);
          
          if (data1[i][block] != data2[j][block]) {
            flag = true;
            break;
          }
        }
        if (!flag) {
          var newRow = {};
          for (var k in data1[i]) {
            if (i >= j && !k.includes("in_")) {
              newRow[k] = "(" +
                data1[i][k] + ", " +
                data2[j][k] + ")";
              newRow['id1'] = data1[i]['id'];
              newRow['id2'] = data2[j]['id'];
            }
          }

          if (Object.keys(newRow).length > 0) {
            counter++;
            newRow['pair_id'] = counter;
            newData.push(newRow);
          }
        }

      }

    }
    return newData;
  }

  combinate(data1, data2) {
    var counter = 0;
    var newData = [];
    for (var i = 0; i < data1.length; i++) {
      for (var j = 0; j < data2.length; j++) {

        var newRow = {};
        for (var k in data1[i]) {
          if (i >= j && !k.includes("in_")) {
            newRow[k] = "(" +
              data1[i][k] + ", " +
              data2[j][k] + ")";
            newRow['id1'] = data1[i]['id'];
            newRow['id2'] = data2[j]['id'];
          }

        }

        if (Object.keys(newRow).length > 0) {
          counter++;
          newRow['pair_id'] = counter;
          newData.push(newRow);
        }
      }
    }
    return newData;
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


  initialize(node, props) {
    this.node = node;
    this.cols = ['id', 'firstname', 'lastname', "race", "year", "sex", "state"];
    this.comboCols = ['firstname', 'lastname', "race", "year", "sex", "state"]
    var police = props.police;

    for (var k = 0; k < +police.length; k++) {
      police[k]['id'] = k + "";
    }

    this.left = this.getRandomSubarray(police, 4)
    this.right = this.getRandomSubarray(police, 4)
    this.left = this.left.concat(police[10]);
    this.right = this.right.concat(police[10]);

    this.combined = this.blockedCombinate(this.left, this.right, []);

    this.tabulate(this.left, this.cols);
    this.tabulate(this.right, this.cols);
    this.combinedTable = this.tabulate(this.combined, this.comboCols);
  }
  update(props, oldProps) {
    var blocks = [];
    if (props.blockVal != 'none') {
      var blocks = [props.blockVal];
    }

    this.combinedTable.remove();
    this.combined = this.blockedCombinate(this.left, this.right, blocks);
    console.log(blocks);
    this.combinedTable = this.tabulate(this.combined, this.comboCols);
    this.combinedTable.attr("class", "fuck");
  }

}

module.exports = CustomD3Component;
