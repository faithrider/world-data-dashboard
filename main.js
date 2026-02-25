// main.js
// Load and parse the combined data, then call visualization functions


let globalData = null;
d3.csv("combined_all_years.csv").then(data => {
    // Convert numeric columns
    data.forEach(d => {
        d["Richest 1%"] = +d["Richest 1%"];
        d["Next 9%"] = +d["Next 9%"];
        d["Middle 40%"] = +d["Middle 40%"];
        d["Poorest 50%"] = +d["Poorest 50%"];
        d["Life expectancy"] = +d["Life expectancy"];
        d["Year"] = +d["Year"];
    });
    globalData = data;

    // Get all years in the data
    const years = Array.from(new Set(data.map(d => d.Year))).sort((a, b) => a - b);
    const yearSlider = document.getElementById('year-slider');
    yearSlider.min = years[0];
    yearSlider.max = years[years.length - 1];
    yearSlider.value = years[years.length - 1];
    document.getElementById('year-value').textContent = yearSlider.value;

    let selectedYear = +yearSlider.value;
    let selectedPovertyLine = document.getElementById('poverty-line-select').value;
    let mapMetric = document.getElementById('map-metric-select').value;

    // Draw all charts for the selected year
    drawAll(data, selectedPovertyLine, mapMetric, selectedYear);

    // Listen for slider changes
    yearSlider.addEventListener('input', function() {
        selectedYear = +this.value;
        document.getElementById('year-value').textContent = this.value;
        drawAll(data, selectedPovertyLine, mapMetric, selectedYear);
    });
    // Listen for dropdown changes
    document.getElementById('poverty-line-select').addEventListener('change', function() {
        selectedPovertyLine = this.value;
        drawAll(data, selectedPovertyLine, mapMetric, selectedYear);
    });
    document.getElementById('map-metric-select').addEventListener('change', function() {
        mapMetric = this.value;
        drawAll(data, selectedPovertyLine, mapMetric, selectedYear);
    });
});

function drawAll(data, povertyLine, mapMetric, year) {
    // Filter data for the selected year
    const yearData = data.filter(d => d.Year === year);
    drawPovertyChart(yearData, povertyLine);
    drawLifeChart(yearData);
    drawScatterplot(yearData, povertyLine);
    drawChoroplethMap(yearData, povertyLine, mapMetric);
}

// Draws a choropleth map of the selected poverty line or life expectancy
function drawChoroplethMap(data, povertyLine, mapMetric) {
    const svg = d3.select('#map svg');
    svg.selectAll('*').remove();

    const width = 1100;
    const height = 600;

    // Projection and path
    const projection = d3.geoNaturalEarth1()
        .scale(260)
        .translate([width / 2, height / 2 + 30]);
    const path = d3.geoPath().projection(projection);

    // Which metric to show
    let metric, label, colorInterp;
    if (mapMetric === 'life') {
        metric = 'Life expectancy';
        label = 'Life Expectancy (years)';
        colorInterp = d3.interpolateYlOrRd;
    } else {
        metric = povertyLine;
        label = `${povertyLine} (% of national income)`;
        colorInterp = d3.interpolateYlGnBu;
    }
    const values = data.map(d => d[metric]);
    const color = d3.scaleSequential()
        .domain([d3.min(values), d3.max(values)])
        .interpolator(colorInterp);

    // Map country code to value
    const valueByCode = {};
    data.forEach(d => { valueByCode[d.Code] = d[metric]; });

    // Load GeoJSON and draw
    d3.json('world.geojson').then(world => {
        svg.append('g')
            .selectAll('path')
            .data(world.features)
            .enter()
            .append('path')
            .attr('d', path)
            .attr('fill', d => {
                const code = d.id;
                const v = valueByCode[code];
                return v != null ? color(v) : '#eee';
            })
            .attr('stroke', '#aaa')
            .attr('stroke-width', 0.5)
            .on('mouseover', function(event, d) {
                const code = d.id;
                const v = valueByCode[code];
                tooltip.style('display', 'block')
                    .html(`<strong>${d.properties.name}</strong><br>${label}: ${v != null ? v.toFixed(2) : 'N/A'}`)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 28) + 'px');
                d3.select(this).attr('stroke', '#222').attr('stroke-width', 2);
            })
            .on('mousemove', function(event) {
                tooltip.style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 28) + 'px');
            })
            .on('mouseout', function() {
                tooltip.style('display', 'none');
                d3.select(this).attr('stroke', '#aaa').attr('stroke-width', 0.5);
            });

        // Legend
        const legendWidth = 300, legendHeight = 12;
        const legendSvg = svg.append('g')
            .attr('transform', `translate(${width - legendWidth - 40},${height - 40})`);
        const defs = svg.append('defs');
        const linearGradient = defs.append('linearGradient')
            .attr('id', 'legend-gradient');
        linearGradient.selectAll('stop')
            .data(d3.range(0, 1.01, 0.01))
            .enter().append('stop')
            .attr('offset', d => d)
            .attr('stop-color', d => color(d3.min(values) + d * (d3.max(values) - d3.min(values))));
        legendSvg.append('rect')
            .attr('width', legendWidth)
            .attr('height', legendHeight)
            .style('fill', 'url(#legend-gradient)');
        // Legend axis
        const legendScale = d3.scaleLinear()
            .domain([d3.min(values), d3.max(values)])
            .range([0, legendWidth]);
        const legendAxis = d3.axisBottom(legendScale)
            .ticks(6)
            .tickFormat(d => d.toFixed(1));
        legendSvg.append('g')
            .attr('transform', `translate(0,${legendHeight})`)
            .call(legendAxis);
        legendSvg.append('text')
            .attr('x', legendWidth / 2)
            .attr('y', -6)
            .attr('text-anchor', 'middle')
            .attr('font-size', '12px')
            .text(label);

        // Tooltip
        let tooltip = d3.select('body').selectAll('.map-tooltip').data([null]);
        tooltip = tooltip.enter()
            .append('div')
            .attr('class', 'map-tooltip')
            .style('position', 'absolute')
            .style('background', '#fff')
            .style('border', '1px solid #ccc')
            .style('padding', '6px 10px')
            .style('border-radius', '4px')
            .style('pointer-events', 'none')
            .style('font-size', '13px')
            .style('display', 'none')
            .merge(tooltip);
    });
}

// Draws a bar chart of the selected poverty line across countries
function drawPovertyChart(data, povertyLine) {
    // Clear previous chart
    const svg = d3.select('#poverty-chart svg');
    svg.selectAll('*').remove();

    const margin = {top: 30, right: 10, bottom: 50, left: 60};
    const width = 1100;
    const height = 420;
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Histogram binning
    const values = data.map(d => d[povertyLine]);
    const bins = d3.bin()
        .domain([d3.min(values), d3.max(values)])
        .thresholds(12)(values); // 12 bins

    // X scale: bin range
    const x = d3.scaleLinear()
        .domain([d3.min(values), d3.max(values)])
        .range([margin.left, margin.left + chartWidth]);

    // Y scale: count of countries in bin
    const y = d3.scaleLinear()
        .domain([0, d3.max(bins, d => d.length)])
        .nice()
        .range([margin.top + chartHeight, margin.top]);

    // Bars
    svg.selectAll('rect')
        .data(bins)
        .enter()
        .append('rect')
        .attr('x', d => x(d.x0))
        .attr('y', d => y(d.length))
        .attr('width', d => x(d.x1) - x(d.x0) - 1)
        .attr('height', d => y(0) - y(d.length))
        .attr('fill', '#4682B4')
        .on('mouseover', function(event, d) {
            tooltip.style('display', 'block')
                .html(`<strong>${d.length} countries</strong><br>${povertyLine}: ${d.x0.toFixed(2)}% - ${d.x1.toFixed(2)}%`)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 28) + 'px');
            d3.select(this).attr('fill', '#2a4d6b'); // keep hover a darker blue
        })
        .on('mousemove', function(event) {
            tooltip.style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', function() {
            tooltip.style('display', 'none');
            d3.select(this).attr('fill', '#4682B4'); // revert to blue on mouseout
        });

    // X axis
    svg.append('g')
        .attr('transform', `translate(0,${margin.top + chartHeight})`)
        .call(d3.axisBottom(x).ticks(10))
        .append('text')
        .attr('x', margin.left + chartWidth / 2)
        .attr('y', 40)
        .attr('fill', '#000')
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .text(`${povertyLine} (% of national income)`);

    // Y axis
    svg.append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));

    // Y label
    svg.append('text')
        .attr('x', margin.left - 40)
        .attr('y', margin.top - 10)
        .attr('text-anchor', 'start')
        .attr('font-size', '12px')
        .text('Number of countries');

    // Tooltip
    let tooltip = d3.select('body').selectAll('.poverty-tooltip').data([null]);
    tooltip = tooltip.enter()
        .append('div')
        .attr('class', 'poverty-tooltip')
        .style('position', 'absolute')
        .style('background', '#fff')
        .style('border', '1px solid #ccc')
        .style('padding', '6px 10px')
        .style('border-radius', '4px')
        .style('pointer-events', 'none')
        .style('font-size', '13px')
        .style('display', 'none')
        .merge(tooltip);
}

// Draws a bar chart of life expectancy across countries
function drawLifeChart(data) {
    const svg = d3.select('#life-chart svg');
    svg.selectAll('*').remove();

    const margin = {top: 30, right: 10, bottom: 50, left: 60};
    const width = 1100;
    const height = 420;
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Histogram binning
    const values = data.map(d => d["Life expectancy"]);
    const bins = d3.bin()
        .domain([d3.min(values), d3.max(values)])
        .thresholds(12)(values); // 12 bins

    // X scale: bin range
    const x = d3.scaleLinear()
        .domain([d3.min(values), d3.max(values)])
        .range([margin.left, margin.left + chartWidth]);

    // Y scale: count of countries in bin
    const y = d3.scaleLinear()
        .domain([0, d3.max(bins, d => d.length)])
        .nice()
        .range([margin.top + chartHeight, margin.top]);

    // Bars
    svg.selectAll('rect')
        .data(bins)
        .enter()
        .append('rect')
        .attr('x', d => x(d.x0))
        .attr('y', d => y(d.length))
        .attr('width', d => x(d.x1) - x(d.x0) - 1)
        .attr('height', d => y(0) - y(d.length))
        .attr('fill', '#6baed6')
        .on('mouseover', function(event, d) {
            tooltip.style('display', 'block')
                .html(`<strong>${d.length} countries</strong><br>Life Expectancy: ${d.x0.toFixed(2)} - ${d.x1.toFixed(2)}`)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 28) + 'px');
            d3.select(this).attr('fill', '#2171b5'); // keep hover a darker blue
        })
        .on('mousemove', function(event) {
            tooltip.style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', function() {
            tooltip.style('display', 'none');
            d3.select(this).attr('fill', '#6baed6'); // revert to blue on mouseout
        });

    // X axis
    svg.append('g')
        .attr('transform', `translate(0,${margin.top + chartHeight})`)
        .call(d3.axisBottom(x).ticks(10))
        .append('text')
        .attr('x', margin.left + chartWidth / 2)
        .attr('y', 40)
        .attr('fill', '#000')
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .text('Life Expectancy (years)');

    // Y axis
    svg.append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));

    // Y label
    svg.append('text')
        .attr('x', margin.left - 40)
        .attr('y', margin.top - 10)
        .attr('text-anchor', 'start')
        .attr('font-size', '12px')
        .text('Number of countries');

    // Tooltip
    let tooltip = d3.select('body').selectAll('.life-tooltip').data([null]);
    tooltip = tooltip.enter()
        .append('div')
        .attr('class', 'life-tooltip')
        .style('position', 'absolute')
        .style('background', '#fff')
        .style('border', '1px solid #ccc')
        .style('padding', '6px 10px')
        .style('border-radius', '4px')
        .style('pointer-events', 'none')
        .style('font-size', '13px')
        .style('display', 'none')
        .merge(tooltip);
}

// Draws a scatterplot of selected poverty line vs. life expectancy
function drawScatterplot(data, povertyLine) {
    const svg = d3.select('#scatterplot svg');
    svg.selectAll('*').remove();

    const margin = {top: 30, right: 30, bottom: 60, left: 60};
    const width = 1100;
    const height = 420;
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // X scale: poverty line
    const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => d[povertyLine]) || 1])
        .nice()
        .range([margin.left, margin.left + chartWidth]);

    // Y scale: life expectancy
    const y = d3.scaleLinear()
        .domain([50, d3.max(data, d => d["Life expectancy"]) || 90])
        .nice()
        .range([margin.top + chartHeight, margin.top]);

    // Points
    svg.selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx', d => x(d[povertyLine]))
        .attr('cy', d => y(d["Life expectancy"]))
        .attr('r', 5)
        .attr('fill', '#e6550d')
        .attr('opacity', 0.8)
        .on('mouseover', function(event, d) {
            tooltip.style('display', 'block')
                .html(`<strong>${d.Entity}</strong><br>${povertyLine}: ${d[povertyLine].toFixed(2)}%<br>Life Expectancy: ${d["Life expectancy"].toFixed(2)}`)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 28) + 'px');
            d3.select(this).attr('stroke', '#222').attr('stroke-width', 2);
        })
        .on('mousemove', function(event) {
            tooltip.style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', function() {
            tooltip.style('display', 'none');
            d3.select(this).attr('stroke', null);
        });

    // X axis
    svg.append('g')
        .attr('transform', `translate(0,${margin.top + chartHeight})`)
        .call(d3.axisBottom(x));
    svg.append('text')
        .attr('x', margin.left + chartWidth / 2)
        .attr('y', margin.top + chartHeight + 40)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .text(`${povertyLine} (% of national income)`);

    // Y axis
    svg.append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));
    svg.append('text')
        .attr('x', margin.left - 40)
        .attr('y', margin.top - 10)
        .attr('text-anchor', 'start')
        .attr('font-size', '12px')
        .text('Life Expectancy (years)');

    // Tooltip
    let tooltip = d3.select('body').selectAll('.scatter-tooltip').data([null]);
    tooltip = tooltip.enter()
        .append('div')
        .attr('class', 'scatter-tooltip')
        .style('position', 'absolute')
        .style('background', '#fff')
        .style('border', '1px solid #ccc')
        .style('padding', '6px 10px')
        .style('border-radius', '4px')
        .style('pointer-events', 'none')
        .style('font-size', '13px')
        .style('display', 'none')
        .merge(tooltip);
}
