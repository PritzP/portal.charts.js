var portal = portal || {};

portal.charts = [];

portal.Chart = function (el, type, data, options) {

    portal.charts.push(this);

    this.el = el;
    this.type = type;
    this.data = data;
    this.options = options;

    var container = document.getElementById(el)
      , containerWidth = container.offsetWidth
      , chartGroupHeight = options.svg.height - options.svg.chart.margin.bottom;

    if ( this.type === 'doughnut' || this.type === 'pie' ) {
        this.chart = _generateDoughnut(this.data, this.options);
    } else {
        this.chart = _generateBar(this.data, this.options);
    }

    function _generateSegmentAngles(data, total) {
        var segments = {};
        for (var property in data) {
            if (data.hasOwnProperty(property)) {
                segments[property] = 360 * data[property] / total;
            }
        }
        return segments;
    }

    /**
     * Sum all values
     *
     * Sum all values in a data object and return the value
     *
     * @param {Object} data
     * @returns {number}
     * @private
     */
    function _sumAllValues(data) {
        var total = 0;
        for (var property in data) {
            if (data.hasOwnProperty(property)) {
                total += data[property];
            }
        }
        return total;
    }

    /**
     * Pluck Largest Value
     *
     * Returns the largest value in an object
     *
     * @param object
     * @returns {number}
     * @private
     */
    function _pluckLargestValue(object) {
        var largestValue = -1;
        for (var property in object) {
            if (object.hasOwnProperty(property)) {
                var value = object[property];
                if (value > largestValue) {
                    largestValue = value;
                }
            }
        }
        return largestValue;
    }

    /**
     * Create SVG Tag
     *
     * Helper function to create a namespaced SVG element with a specified object of attributes
     *
     * @param {String} tag
     * @param {Object} attrs
     * @returns {HTMLElement}
     * @private
     */
    function _createSVGTag(tag, attrs) {
        var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
        for (var attr in attrs) {
            if (attrs.hasOwnProperty(attr)) {
                el.setAttribute(attr, attrs[attr]);
            }
        }
        return el;
    }

    /**
     * TODO: Generate Doughnut Chart
     *
     * @param data
     * @param options
     * @private
     */
    function _generateDoughnut(data, options) {
        var svg = _createSVGTag('svg', {width: containerWidth, height: options.svg.height})
            , total = _sumAllValues(data)
            , segments = _generateSegmentAngles(data, total)
            , centerPoint = Math.min.apply(Math, [containerWidth, options.svg.height]) / 2
            , svgPadding = 5
            , centroidPadding = options.svg.chart.doughnut.centroidPadding || 0
            , radius = centerPoint - svgPadding
            , endAngle = 0
            , milesAvailableTextNode
            , milesTextNode
            , prop;

        for (prop in data) {
            var startAngle = endAngle
                , coords = {outer: {alpha: {}, beta: {}}, inner: {alpha: {}, beta: {}}}
                , d
                , path;

            endAngle = startAngle + segments[prop];

            coords.outer.alpha.x = Math.round(centerPoint + radius * Math.cos(Math.PI * startAngle / 180));
            coords.outer.alpha.y = Math.round(centerPoint + radius * Math.sin(Math.PI * startAngle / 180));
            coords.outer.beta.x = Math.round(centerPoint + radius * Math.cos(Math.PI * endAngle / 180));
            coords.outer.beta.y = Math.round(centerPoint + radius * Math.sin(Math.PI * endAngle / 180));
            coords.inner.alpha.x = Math.round(centerPoint + centroidPadding * Math.cos(Math.PI * startAngle / 180));
            coords.inner.alpha.y = Math.round(centerPoint + centroidPadding * Math.sin(Math.PI * startAngle / 180));
            coords.inner.beta.x = Math.round(centerPoint + centroidPadding * Math.cos(Math.PI * endAngle / 180));
            coords.inner.beta.y = Math.round(centerPoint + centroidPadding * Math.sin(Math.PI * endAngle / 180));

            // move to start of outer arc
            d = 'M' + coords.outer.alpha.x + ',' + coords.outer.alpha.y;

            // arc around outer edge of segment
            d += ' A ' + radius + ',' + radius + ' 0 ' + ((endAngle - startAngle > 180) ? '1' : '0') + ' 1 ' + coords.outer.beta.x + ',' + coords.outer.beta.y;

            // line to inner edge of segment
            d += ' L ' + coords.inner.beta.x + ',' + coords.inner.beta.y;

            // arc around inner end of segment
            d += ' A ' + centroidPadding + ',' + centroidPadding + ' 0 ' + ((endAngle - startAngle > 180) ? '1' : '0') + ' 0 ' + coords.inner.alpha.x + ',' + coords.inner.alpha.y;

            // end
            d += ' z';

            path = _createSVGTag("path", {d: d, id: el + '-' + prop});

            svg.appendChild(path);
        }

        milesAvailableTextNode = _createSVGTag("text", {x: centerPoint - 24, y: centerPoint - 60, id: 'miles-available-text'});
        milesAvailableTextNode.appendChild(document.createTextNode(data['available']));
        svg.appendChild(milesAvailableTextNode);

        milesTextNode = _createSVGTag("text", {x: centerPoint - 78, y: centerPoint - 20, id: 'miles-available-text'});
        milesTextNode.appendChild(document.createTextNode('Miles Available'));
        svg.appendChild(milesTextNode);

        container.appendChild(svg);

        return container;
    }

    /**
     * Generate Bar
     *
     * Generate a bar chart from a given data set and config options
     *
     * @param {Object} data
     * @param {Object} options
     * @returns {HTMLElement}
     * @private
     */
    function _generateBar(data, options) {
        var svg = _createSVGTag('svg', {width: containerWidth, height: options.svg.height})
          , chartGroup = _createSVGTag('g', {})
          , valuesGroup = _createSVGTag('g', {id: 'values-group'})
          , keysGroup = _createSVGTag('g', {id: 'keys-group'})
          , largestDataValue = _pluckLargestValue(data)
          , numDataValues = Object.size(data)
          , barWidth = containerWidth / numDataValues - options.svg.chart.bar.margin.right
          , barHeight, x, y, textNode, prop, i = 0;

        for ( prop in data ) {
            if (data.hasOwnProperty(prop)) {

                barHeight = data[prop] / largestDataValue * chartGroupHeight;
                y = options.svg.height - barHeight - options.svg.chart.margin.bottom;
                x = (barWidth + options.svg.chart.bar.margin.right) * i++;

                // bar
                chartGroup.appendChild(_createSVGTag('rect', {width: barWidth, height: barHeight, x: x, y: y}));


                // value text node
                // minus 10 - hack to center 2 digit numbers as usually 2 digits
                textNode = _createSVGTag("text", {x: x + barWidth / 2 - 10, y: y + 30});
                textNode.appendChild(document.createTextNode(data[prop]));
                valuesGroup.appendChild(textNode);

                // key text node (x axis)
                textNode = _createSVGTag("text", {x: x + barWidth / 2 - 15, y: options.svg.height - options.svg.padding.bottom});
                textNode.appendChild(document.createTextNode(prop));
                keysGroup.appendChild(textNode);
            }
        }

        svg.appendChild(chartGroup);
        svg.appendChild(valuesGroup);
        svg.appendChild(keysGroup);
        container.appendChild(svg);

        return container;
    }

    this.resize = function () {

        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }

        containerWidth = container.offsetWidth;

        if ( this.type === 'doughnut' || this.type === 'pie' ) {
            this.chart = _generateDoughnut(this.data, this.options);
        } else {
            this.chart = _generateBar(this.data, this.options);
        }
    }

};





window.onresize = function() {
    var i;

    for ( i = 0; i < portal.charts.length; i++ ) {
        portal.charts[i].resize();
    }
};



/**
 * Object.size(obj)
 *
 * Returns the size of a javascript object
 *
 * @param obj
 * @returns {number}
 */
Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};