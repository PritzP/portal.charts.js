/**
 * This is the namespace for the portal related JS modules
 *
 * @type {*|{}}
 */
var portal = portal || {};

portal.Chart = (function (wrapper) {

    "use strict";

    var i;

    /**
     * Create SVG Tag
     *
     * Helper function to create an SVG tag with an object attributes
     *
     * @param tag
     * @param attrs
     * @returns {HTMLElement}
     * @private
     */
    function _createSVGTag(tag, attrs) {
        var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
        for (var attr in attrs) {
            if (attrs.hasOwnProperty(attr)) el.setAttribute(attr, attrs[attr]);
        }
        return el;
    }

    /**
     * Generate Doughnut
     *
     * Generate an SVG doughnut chart
     *
     * @param data
     * @param options
     * @returns {HTMLElement}
     * @private
     */
    function _generateDoughnut(data, options) {
        var svg = _createSVGTag('svg', {width: options.width, height: options.height, id: options.id})
            , container = document.getElementById(wrapper)
            , total = data.values.reduce(function (accumulated, thisVal) { return thisVal + accumulated; }, 0)
            , segments = data.values.map(function (val) { return 360 * val / total; })
            , centerPoint = ~~options.width / 2
            , svgPadding = ~~options.svgPadding || 5
            , centroidPadding = ~~options.centroidPadding || 0
            , radius = centerPoint - svgPadding
            , endAngle = 0;

        for ( i = 0; i < segments.length; i++ ) {
            var startAngle = endAngle,
                segmentCoords = {
                    outer: {
                        alpha: {},
                        beta: {}
                    },
                    inner: {
                        alpha: {},
                        beta: {}
                    }
                },
                d,
                path;

            endAngle = startAngle + segments[i];

            segmentCoords.outer.alpha.x = Math.round(centerPoint + radius * Math.cos(Math.PI * startAngle / 180));
            segmentCoords.outer.alpha.y = Math.round(centerPoint + radius * Math.sin(Math.PI * startAngle / 180));
            segmentCoords.outer.beta.x = Math.round(centerPoint + radius * Math.cos(Math.PI * endAngle / 180));
            segmentCoords.outer.beta.y = Math.round(centerPoint + radius * Math.sin(Math.PI * endAngle / 180));
            segmentCoords.inner.alpha.x = Math.round(centerPoint + centroidPadding * Math.cos(Math.PI * startAngle / 180));
            segmentCoords.inner.alpha.y = Math.round(centerPoint + centroidPadding * Math.sin(Math.PI * startAngle / 180));
            segmentCoords.inner.beta.x = Math.round(centerPoint + centroidPadding * Math.cos(Math.PI * endAngle / 180));
            segmentCoords.inner.beta.y = Math.round(centerPoint + centroidPadding * Math.sin(Math.PI * endAngle / 180));

            // move to start of outer arc
            d = 'M' + segmentCoords.outer.alpha.x + ',' + segmentCoords.outer.alpha.y;

            // arc around outer edge of segment
            d += ' A ' + radius + ',' + radius + ' 0 ' + ((endAngle - startAngle > 180) ? '1' : '0') + ' 1 ' + segmentCoords.outer.beta.x + ',' + segmentCoords.outer.beta.y;

            // line to inner edge of segment
            d += ' L ' + segmentCoords.inner.beta.x + ',' + segmentCoords.inner.beta.y;

            // arc around inner end of segment
            d += ' A ' + centroidPadding + ',' + centroidPadding + ' 0 ' + ((endAngle - startAngle > 180) ? '1' : '0') + ' 0 ' + segmentCoords.inner.alpha.x + ',' + segmentCoords.inner.alpha.y;

            // end
            d += ' z';

            path = _createSVGTag("path", {d: d, id: options.id + '-path-' + i, 'data-label': data.labels[i], 'data-value': data.values[i]});

            svg.appendChild(path);
        }

        container.appendChild(svg);

        return container;
    }

    /**
     * Generate Bar
     *
     * Generate an SVG bar chart
     *
     * @param data
     * @param options
     * @returns {HTMLElement}
     * @private
     */
    function _generateBar(data, options) {
        var container = document.getElementById(wrapper)
            , svg = _createSVGTag('svg', {width: options.width, height: options.height, id: options.id})
            , chartGroup = _createSVGTag('g', {transform: 'translate(' + options.chartPadding.left + ' , 0)'})
            , yAxisLabelGroup = _createSVGTag('g', {})
            , xAxisLabelGroup = _createSVGTag('g', {transform: 'translate(' + options.chartPadding.left + ' , 0)'})
            , maxValue = Math.max.apply( Math, data.values )
            , barXPadding = 5
            , SVGPadding = {
                top: 10,
                bottom: 10,
                left: 20
            }
            , chartPadding = {
                top: 20,
                bottom: 50,
                left: 50
            }
            , chartHeight = options.height - SVGPadding.top - SVGPadding.bottom - chartPadding.top - chartPadding.bottom
            , barWidth = Math.round((~~options.width - chartPadding.left) / data.values.length) - 2 * barXPadding
            , x, y, textNode, barHeight, yAxisLabel;

        // create rects
        for ( i = 0; i < data.values.length; i++ ) {

            barHeight = Math.round(data.values[i] / maxValue * chartHeight);
            y = options.height - barHeight - chartPadding.bottom - SVGPadding.bottom;

            x = (barWidth + barXPadding) * i;

            chartGroup.appendChild(_createSVGTag("rect",
                {
                    width: barWidth,
                    height: barHeight,
                    y: y,
                    x: x,
                    id: options.id + '-rect-' + i,
                    'data-label': data.labels[i],
                    'data-value': data.values[i]
                }
            ));

        }

        // create x-axis labels
        for ( i = 0; i < data.values.length; i++ ) {
            x = (barWidth + barXPadding) * i;
            textNode = _createSVGTag("text",
                {
                    x: x + SVGPadding.bottom,
                    y: options.height + (barWidth / 2),
                    transform: 'rotate(-90 ' + x + ',' + options.height + ')'
                }
            );

            textNode.appendChild(document.createTextNode(data.labels[i]));
            xAxisLabelGroup.appendChild(textNode);
        }

        // create y-axis labels
        // top
        yAxisLabel = _createSVGTag('text', {x: SVGPadding.left, y: SVGPadding.top + chartPadding.top});
        yAxisLabel.appendChild(document.createTextNode(String(maxValue)));
        yAxisLabelGroup.appendChild( yAxisLabel );

        // bottom
        yAxisLabel = _createSVGTag('text', {x: SVGPadding.left, y: options.height - SVGPadding.bottom - chartPadding.bottom});
        yAxisLabel.appendChild(document.createTextNode('0'));
        yAxisLabelGroup.appendChild( yAxisLabel );

        // middle
        yAxisLabel = _createSVGTag('text', {x: SVGPadding.left, y: options.height - SVGPadding.bottom - chartPadding.bottom - chartHeight / 2});
        yAxisLabel.appendChild(document.createTextNode(String(maxValue / 2)));
        yAxisLabelGroup.appendChild( yAxisLabel );

        svg.appendChild(xAxisLabelGroup);
        svg.appendChild(yAxisLabelGroup);
        svg.appendChild(chartGroup);
        container.appendChild(svg);

        return container;
    }

    return {
        render: function (type, data, options) {

            var chart;

            if (type === 'pie' || type === 'doughnut') {
                chart = _generateDoughnut(data, options);
            } else if (type === 'bar') {
                chart = _generateBar(data, options);
            }

            return chart;
        }
    }
});