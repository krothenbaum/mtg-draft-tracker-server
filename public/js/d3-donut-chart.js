$(function() {

	donutData = local_donut_data;

	var donuts = new DonutCharts();
	donuts.create(donutData);

});
		

function DonutCharts() {

				var charts = d3.select('#donut-charts');

				var chart_m,
						chart_r,
						color = {Blue:'#4286f4',
						Black: '#150b00',
						White: '#f8e7b9',
						Red: '#d3202a',
						Green: '#00733e'};

				var createCenter = function(pie) {

						var eventObj = {
								'mouseover': function(d, i) {
										d3.select(this)
												.transition()
												.attr("r", chart_r * 0.65);
								},

								'mouseout': function(d, i) {
										d3.select(this)
												.transition()
												.duration(500)
												.ease('bounce')
												.attr("r", chart_r * 0.6);
								},

								'click': function(d, i) {
										var paths = charts.selectAll('.clicked');
										pathAnim(paths, 0);
										paths.classed('clicked', false);
										resetAllCenterText();
								}
						}

						var donuts = d3.selectAll('.donut');

						// The circle displaying total data.
						donuts.append("svg:circle")
								.attr("r", chart_r * 0.6)
								.style("fill", "#E7E7E7")
								.on(eventObj);
		
						donuts.append('text')
										.attr('class', 'center-txt type')
										.attr('y', chart_r * -0.16)
										.attr('text-anchor', 'middle')
										.style('font-weight', 'bold')
										.text(function(d, i) {
												return d.type;
										});

						donuts.append('text')
										.attr('class', 'center-txt percentage')
										.attr('y', chart_r * 0.16)
										.attr('text-anchor', 'middle')
										.style('fill', '#A2A2A2');
				}

				var setCenterText = function(thisDonut) {
						var sum = d3.sum(thisDonut.selectAll('.clicked').data(), function(d) {
								return d.data.val;
						});

						thisDonut.select('.value')
								.text(function(d) {
										console.log(d);
										return (sum)? sum.toFixed(1) + d.unit
																: d.total.toFixed(1) + d.unit;
								});
						thisDonut.select('.percentage')
								.text(function(d) {
										return (sum)? (sum/d.total*100).toFixed(2) + '%'
																: '';
								});
				}

				var resetAllCenterText = function() {
						charts.selectAll('.value')
								.text(function(d) {
										return d.total.toFixed(1) + d.unit;
								});
						charts.selectAll('.percentage')
								.text('');
				}

				var pathAnim = function(path, dir) {
						switch(dir) {
								case 0:
										path.transition()
												.duration(500)
												.ease('bounce')
												.attr('d', d3.svg.arc()
														.innerRadius(chart_r * 0.7)
														.outerRadius(chart_r)
												);
										break;

								case 1:
										path.transition()
												.attr('d', d3.svg.arc()
														.innerRadius(chart_r * 0.7)
														.outerRadius(chart_r * 1.08)
												);
										break;
						}
				}

				var updateDonut = function() {

						var eventObj = {

								'mouseover': function(d, i, j) {
										pathAnim(d3.select(this), 1);

										var thisDonut = charts.select('.type' + j);
										thisDonut.select('.value').text(function(donut_d) {
												return d.data.val.toFixed(1) + donut_d.unit;
										});
										thisDonut.select('.percentage').text(function(donut_d) {
												return (d.data.val/donut_d.total*100).toFixed(2) + '%';
										});
								},
								
								'mouseout': function(d, i, j) {
										var thisPath = d3.select(this);
										if (!thisPath.classed('clicked')) {
												pathAnim(thisPath, 0);
										}
										var thisDonut = charts.select('.type' + j);
										setCenterText(thisDonut);
								},

								'click': function(d, i, j) {
										var thisDonut = charts.select('.type' + j);

										if (0 === thisDonut.selectAll('.clicked')[0].length) {
												thisDonut.select('circle').on('click')();
										}

										var thisPath = d3.select(this);
										var clicked = thisPath.classed('clicked');
										pathAnim(thisPath, ~~(!clicked));
										thisPath.classed('clicked', !clicked);

										setCenterText(thisDonut);
								}
						};

						var pie = d3.layout.pie()
														.sort(null)
														.value(function(d) {
																return d.val;
														});

						var arc = d3.svg.arc()
														.innerRadius(chart_r * 0.7)
														.outerRadius(function() {
																return (d3.select(this).classed('clicked'))? chart_r * 1.08
																																					 : chart_r;
														});

						// Start joining data with paths
						var paths = charts.selectAll('.donut')
														.selectAll('path')
														.data(function(d, i) {
																return pie(d.data);
														});

						paths
								.transition()
								.duration(1000)
								.attr('d', arc);

						paths.enter()
								.append('svg:path')
										.attr('d', arc)
										.style('fill', function(d, i) {
												return color[d.data.cat];
										})
										.style('stroke', '#FFFFFF')
										.on(eventObj)

						paths.exit().remove();

						resetAllCenterText();
				}

				this.create = function(dataset) {
						var $charts = $('#donut-charts');
						chart_m = $charts.innerWidth() / dataset.length / 2 * 0.14;
						chart_r = $charts.innerWidth() / dataset.length / 2 * 0.85;

						var donut = charts.selectAll('.donut')
														.data(dataset)
												.enter().append('svg:svg')
														.attr('width', (chart_r + chart_m) * 2)
														.attr('height', (chart_r + chart_m) * 2)
												.append('svg:g')
														.attr('class', function(d, i) {
																return 'donut type' + i;
														})
														.attr('transform', 'translate(' + (chart_r+chart_m) + ',' + (chart_r+chart_m) + ')');


						createCenter();

						updateDonut();
				}
		
				this.update = function(dataset) {
						// Assume no new categ of data enter
						var donut = charts.selectAll(".donut")
												.data(dataset);

						updateDonut();
				}
		}