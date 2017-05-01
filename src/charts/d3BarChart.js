import d3 from 'd3'
import './d3BarChart.css'

export default class {
  create = (el, props, state) => {
    let margin = {top: props.margin.top, right: props.margin.right, bottom: props.margin.bottom, left: props.margin.left}
    let width = props.width - margin.left - margin.right
    let height = props.height - margin.top - margin.bottom

    let color = d3.scale.category20()

    var x = d3.scale.ordinal().rangeRoundBands([0, width], .05)

    var y = d3.scale.linear().range([height, 0])

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom')

    var yAxis = d3.svg.axis()
        .scale(y)
        .tickSize(width)
        .orient('right')

    var svg = d3.select(el).append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
      .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`)

    x.domain(state.map(function(d) { return d.key }))
    y.domain([0, d3.max(state, function(d) { return d.val })])

    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', `translate(0,${height})`)
        .call(xAxis)

var gy = svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis)

    gy.selectAll('g').filter(d => d)
     .classed('minor', true);

    gy.append('text')
      .text(props.labels.y)
      .attr('x', 4)

    svg.selectAll('bar')
        .data(state)
      .enter().append('rect')
        .style('fill', d => color(d.key))
        .attr('x', function(d) { return x(d.key) })
        .attr('y', function(d) { return y(d.val) })
        .attr('width', x.rangeBand())
        .attr('height', function(d) { return height - y(d.val) })

    svg.selectAll('bar')
        .data(state)
      .enter().append('text')
        .text(d => {
          let result = ''
          if(d.val != 0) result = `${d.val} ${d.unit}`
          if(d.unit == '$') result = `${d.unit}${d.val.toFixed(2)}`
          return result
        })
        .attr('text-anchor', 'middle')
        //.attr('x', (d, i) => i * (width / state.length) + (width / dataset.length - 1) / 2)
        //.attr('y', d => height - (d.val * 4) + 14)
        .attr('x', d => x(d.key) + x.rangeBand() / 2)
        .attr('y', d => y(d.val) + 20)
        //.attr('font-family', 'sans-serif')
        //.attr('font-size', '11px')
        .attr('fill', 'white')
  }
}
