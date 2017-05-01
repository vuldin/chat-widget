import d3 from 'd3'
//import d3Tip from 'd3-tip'
import './d3PieChart.css'

export default class {
  create = (el, props, state) => {
    let width = props.width,
      height = props.height,
      radius = Math.min(width, height) / 2,
      labelr = radius * .5

    let color = d3.scale.category20()

    let arc = d3.svg.arc()
      .outerRadius(radius - 10)
      .innerRadius(0)

    let pie = d3.layout.pie()
      .sort(null)
      .value( d => d.value)

    /*
    let tip = d3Tip()
      .attr('class', 'd3-tip')
      .offset([0, -radius * 1.6])
      .html(d => `${d.data.label}: ${d.value}%`)
    */

    let svg = d3.select(el).append('svg')
        .attr('width', width)
        .attr('height', height)
      .append('g')
        .attr('transform', `translate(${width / 2},${height / 2})`)

    svg.append('rect')
      .attr('id', 'piechart-tooltip')
      .attr('width', 50)
      .attr('height', 50)
    //svg.call(tip)

    let g = svg.selectAll('.arc')
        .data(pie(state))
      .enter().append('g')
        .attr('class', 'arc')

    g.append('path')
        //.attr('id', (d, i) => `piece${i}`)
        .attr('d', arc)
        .style('fill', d => color(d.data.label))
        //.on('mouseover', (d, i) => tip.show(d, document.querySelector(`#piece${i}`)))
        //.on('mouseover', d => tip.show(d, document.querySelector('#piechart-tooltip')))
        //.on('mouseout', tip.hide)

    g.append('text')
        .attr('transform', d => {
          let c = arc.centroid(d),
            x = c[0],
            y = c[1],
            h = Math.sqrt(x * x + y * y)
          return `translate(${x/h * labelr},${y/h * labelr})`
        })
        .attr('dy', '.35em')
        .text(d => `${d.data.label}: ${d.value}%`)
  }
}
