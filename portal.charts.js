var portal = portal || {};

portal.Chart = function (el) {

    var i = 0
      , chartGroup = _createSVGTag('g', {})
      , container = document.getElementById(el)
      , containerWidth = container.offsetWidth
      , chartGroupHeight;

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
          , valuesGroup = _createSVGTag('g', {id: 'values-group'})
          , keysGroup = _createSVGTag('g', {id: 'keys-group'})
          , largestDataValue = _pluckLargestValue(data)
          , numDataValues = Object.size(data)
          , barWidth = containerWidth / numDataValues - options.svg.chart.bar.margin.right
          , barHeight, x, y, textNode, prop;

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

    /**
     * Render chart
     *
     * @param type
     * @param data
     * @param options
     * @returns {*}
     */
    this.render = function (type, data, options) {

        chartGroupHeight = options.svg.height - options.svg.chart.margin.bottom;

        if ( type === 'doughnut' || type === 'pie' ) {
            return _generateDoughnut(data, options);
        } else {
            return _generateBar(data, options);
        }
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