"""
SHAP Visualization Module

Generates D3.js-based SHAP explanation visualizations including:
- Global feature importance charts
- Alternative waterfall charts with floating bars
- Standard waterfall charts
"""

import os


def get_base_styles():
    """Load shared CSS styles for visualizations."""
    styles_path = os.path.join(os.path.dirname(__file__), 'styles.css')
    with open(styles_path, 'r') as f:
        return f.read()


def get_feature_importance_html(feature_importance_json):
    """
    Generate HTML for global feature importance chart.

    This function creates a horizontal bar chart showing mean absolute SHAP values
    for each feature, indicating which features have the most impact across all
    predictions.

    Args:
        feature_importance_json (str): JSON string containing feature importance data.
                                       Expected format: [{"feature": "name", "value": 0.123}, ...]

    Returns:
        str: Complete HTML document as a string with embedded CSS and JavaScript

    Example:
        >>> import json
        >>> data = [{"feature": "sex", "value": 0.456}, {"feature": "pclass", "value": 0.234}]
        >>> html = get_feature_importance_html(json.dumps(data))
        >>> # Use with streamlit: components.html(html, height=400)
    """
    html_code = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <script src="https://d3js.org/d3.v7.min.js"></script>
        <style>
            {get_base_styles()}

            .bar {{
                fill: #52b788;
                opacity: 0.8;
            }}
            .bar:hover {{
                opacity: 1;
            }}
            .axis text {{
                fill: #fafafa;
                font-size: 12px;
            }}
            .axis line, .axis path {{
                stroke: #666;
            }}
        </style>
    </head>
    <body>
        <div id="waterfall"></div>
        <script>
            const data = {feature_importance_json};

            const margin = {{top: 20, right: 30, bottom: 60, left: 80}};
            const width = 280 - margin.left - margin.right;
            const height = 300 - margin.top - margin.bottom;

            const svg = d3.select("#waterfall")
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${{margin.left}},${{margin.top}})`);

            // Create scales
            const y = d3.scaleBand()
                .domain(data.map(d => d.feature))
                .range([0, height])
                .padding(0.2);

            const x = d3.scaleLinear()
                .domain([0, d3.max(data, d => d.value)])
                .range([0, width]);

            // Add bars
            svg.selectAll(".bar")
                .data(data)
                .enter()
                .append("rect")
                .attr("class", "bar")
                .attr("y", d => y(d.feature))
                .attr("x", 0)
                .attr("height", y.bandwidth())
                .attr("width", d => x(d.value));

            // Add value labels
            svg.selectAll(".label")
                .data(data)
                .enter()
                .append("text")
                .attr("class", "label")
                .attr("y", d => y(d.feature) + y.bandwidth() / 2)
                .attr("x", d => x(d.value) + 5)
                .attr("dy", "0.35em")
                .attr("fill", "#fafafa")
                .attr("font-size", "11px")
                .text(d => d.value.toFixed(3));

            // Add Y axis
            svg.append("g")
                .attr("class", "axis")
                .call(d3.axisLeft(y));

            // Add X axis
            svg.append("g")
                .attr("class", "axis")
                .attr("transform", `translate(0,${{height}})`)
                .call(d3.axisBottom(x).ticks(5));

            // Add X axis label
            svg.append("text")
                .attr("x", width / 2)
                .attr("y", height + 40)
                .attr("fill", "#fafafa")
                .attr("text-anchor", "middle")
                .attr("font-size", "11px")
                .text("Mean |SHAP value|");
        </script>
    </body>
    </html>
    """

    return html_code


def get_alternative_waterfall_html(waterfall_data_json, base_value, final_prediction):
    """
    Generate HTML for alternative waterfall chart with floating bars.

    This function creates a horizontal waterfall visualization showing how each
    feature contribution adds to the base value to reach the final prediction.
    Features are displayed as floating bars positioned at their cumulative value,
    with connector lines showing the progression.

    Args:
        waterfall_data_json (str): JSON string containing waterfall data.
                                   Expected format: [
                                       {"feature": "Base Value", "value": 0, "start": -0.5,
                                        "end": -0.5, "cumulative": -0.5, "feature_value": ""},
                                       {"feature": "sex", "value": 0.3, "start": -0.5,
                                        "end": -0.2, "cumulative": -0.2, "feature_value": 0},
                                       ...
                                   ]
        base_value (float): The baseline prediction value before feature contributions
        final_prediction (float): The final prediction after all feature contributions

    Returns:
        str: Complete HTML document as a string with embedded CSS and JavaScript

    Example:
        >>> import json
        >>> data = [{"feature": "Base Value", "value": 0, "start": -0.5,
        ...          "end": -0.5, "cumulative": -0.5, "feature_value": ""}]
        >>> html = get_alternative_waterfall_html(json.dumps(data), -0.5, 0.2)
        >>> # Use with streamlit: components.html(html, height=400)
    """
    html_code = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <script src="https://d3js.org/d3.v7.min.js"></script>
        <style>
            {get_base_styles()}

            .bar-positive {{
                fill: #52b788;
                stroke: #6fcf97;
                stroke-width: 1.5;
            }}
            .bar-negative {{
                fill: #e76f51;
                stroke: #f4a261;
                stroke-width: 1.5;
            }}
            .bar-base {{
                fill: #666;
                stroke: #888;
                stroke-width: 1.5;
            }}
            .connector-line {{
                stroke: #888;
                stroke-width: 1.5;
                stroke-dasharray: 3,3;
            }}
            .axis text {{
                fill: #fafafa;
                font-size: 10px;
            }}
            .axis line, .axis path {{
                stroke: #666;
            }}
            .value-label {{
                fill: #fafafa;
                font-size: 9px;
                font-weight: bold;
            }}
        </style>
    </head>
    <body>
        <div id="alternative-waterfall-global"></div>
        <script>
            const data = {waterfall_data_json};
            const baseValue = {base_value};
            const finalValue = {final_prediction};

            const margin = {{top: 20, right: 60, bottom: 50, left: 100}};
            const width = 650 - margin.left - margin.right;
            const height = 300 - margin.top - margin.bottom;

            const svg = d3.select("#alternative-waterfall-global")
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${{margin.left}},${{margin.top}})`);

            // Title with base value and final prediction
            svg.append("text")
                .attr("x", width / 2)
                .attr("y", -5)
                .attr("text-anchor", "middle")
                .attr("fill", "#fafafa")
                .attr("font-size", "11px")
                .attr("font-weight", "bold")
                .text(`Base Value: ${{baseValue.toFixed(3)}} → Final Prediction: ${{finalValue.toFixed(3)}}`);

            // Create scales - HORIZONTAL orientation
            const y = d3.scaleBand()
                .domain(data.map((d, i) => i))
                .range([0, height])
                .padding(0.3);

            const allValues = data.flatMap(d => [d.start, d.end]);
            const xExtent = d3.extent(allValues);
            const x = d3.scaleLinear()
                .domain(xExtent)
                .range([0, width])
                .nice();

            // Add X axis
            svg.append("g")
                .attr("class", "axis")
                .attr("transform", `translate(0,${{height}})`)
                .call(d3.axisBottom(x).ticks(5));

            // Add X axis label
            svg.append("text")
                .attr("x", width / 2)
                .attr("y", height + 38)
                .attr("fill", "#fafafa")
                .attr("text-anchor", "middle")
                .attr("font-size", "11px")
                .text("Cumulative SHAP");

            // Draw connector lines between bars (horizontal)
            for (let i = 0; i < data.length - 1; i++) {{
                const current = data[i];
                const next = data[i + 1];

                svg.append("line")
                    .attr("class", "connector-line")
                    .attr("x1", x(current.end))
                    .attr("y1", y(i) + y.bandwidth())
                    .attr("x2", x(next.start))
                    .attr("y2", y(i + 1));
            }}

            // Draw floating bars (horizontal)
            svg.selectAll(".bar")
                .data(data)
                .enter()
                .append("rect")
                .attr("class", (d, i) => {{
                    if (i === 0) return "bar-base";
                    return d.value >= 0 ? "bar-positive" : "bar-negative";
                }})
                .attr("y", (d, i) => y(i))
                .attr("x", d => x(Math.min(d.start, d.end)))
                .attr("height", y.bandwidth())
                .attr("width", d => Math.abs(x(d.start) - x(d.end)) || 3)
                .attr("rx", 2);

            // Add value labels on bars (skip base value, smaller font)
            svg.selectAll(".value-label")
                .data(data.filter((d, i) => i > 0))
                .enter()
                .append("text")
                .attr("class", "value-label")
                .attr("y", (d, i) => y(i + 1) + y.bandwidth() / 2)
                .attr("x", d => x(d.end) + (d.value >= 0 ? 5 : -5))
                .attr("dy", "0.35em")
                .attr("text-anchor", d => d.value >= 0 ? "start" : "end")
                .attr("fill", d => d.value >= 0 ? "#52b788" : "#e76f51")
                .text(d => (d.value >= 0 ? "+" : "") + d.value.toFixed(2));

            // Add Y axis with feature labels
            svg.append("g")
                .attr("class", "axis")
                .call(d3.axisLeft(y).tickFormat((d, i) => {{
                    const item = data[i];
                    if (i === 0) return "Base";
                    return item.feature_value !== "" ? `${{item.feature}}=${{item.feature_value}}` : item.feature;
                }}));
        </script>
    </body>
    </html>
    """

    return html_code


def get_standard_waterfall_html(waterfall_data_json, base_value, final_prediction):
    """
    Generate HTML for standard waterfall chart.

    This function creates a traditional waterfall visualization showing how each
    feature's SHAP value contributes to the prediction. Bars extend from their
    cumulative starting position, with positive contributions in green and
    negative in red.

    Args:
        waterfall_data_json (str): JSON string containing waterfall data.
                                   Expected format: [
                                       {"feature": "sex", "value": 0.3, "start": -0.5,
                                        "end": -0.2, "feature_value": 0},
                                       {"feature": "pclass", "value": -0.1, "start": -0.2,
                                        "end": -0.3, "feature_value": 2},
                                       ...
                                   ]
        base_value (float): The baseline prediction value before feature contributions
        final_prediction (float): The final prediction after all feature contributions

    Returns:
        str: Complete HTML document as a string with embedded CSS and JavaScript

    Example:
        >>> import json
        >>> data = [{"feature": "sex", "value": 0.3, "start": -0.5,
        ...          "end": -0.2, "feature_value": 0}]
        >>> html = get_standard_waterfall_html(json.dumps(data), -0.5, 0.2)
        >>> # Use with streamlit: components.html(html, height=450)
    """
    html_code = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <script src="https://d3js.org/d3.v7.min.js"></script>
        <style>
            {get_base_styles()}

            .bar-positive {{
                fill: #52b788;
            }}
            .bar-negative {{
                fill: #e76f51;
            }}
            .axis text {{
                fill: #fafafa;
                font-size: 12px;
            }}
            .axis line, .axis path {{
                stroke: #666;
            }}
            .baseline {{
                stroke: #666;
                stroke-width: 2;
                stroke-dasharray: 5,5;
            }}
        </style>
    </head>
    <body>
        <div id="individual-waterfall"></div>
        <script>
            const data = {waterfall_data_json};
            const baseValue = {base_value};
            const finalValue = {final_prediction};

            const margin = {{top: 40, right: 30, bottom: 60, left: 120}};
            const width = 700 - margin.left - margin.right;
            const height = 350 - margin.top - margin.bottom;

            const svg = d3.select("#individual-waterfall")
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${{margin.left}},${{margin.top}})`);

            // Title
            svg.append("text")
                .attr("x", width / 2)
                .attr("y", -20)
                .attr("text-anchor", "middle")
                .attr("fill", "#fafafa")
                .attr("font-size", "14px")
                .attr("font-weight", "bold")
                .text(`Base Value: ${{baseValue.toFixed(3)}} → Final Prediction: ${{finalValue.toFixed(3)}}`);

            // Create scales
            const y = d3.scaleBand()
                .domain(data.map(d => d.feature))
                .range([0, height])
                .padding(0.2);

            const allValues = data.flatMap(d => [d.start, d.end]);
            const xExtent = d3.extent(allValues);
            const x = d3.scaleLinear()
                .domain(xExtent)
                .range([0, width]);

            // Add baseline at x=0
            svg.append("line")
                .attr("class", "baseline")
                .attr("x1", x(0))
                .attr("x2", x(0))
                .attr("y1", 0)
                .attr("y2", height);

            // Add bars
            svg.selectAll(".bar")
                .data(data)
                .enter()
                .append("rect")
                .attr("class", d => d.value >= 0 ? "bar-positive" : "bar-negative")
                .attr("y", d => y(d.feature))
                .attr("x", d => x(Math.min(d.start, d.end)))
                .attr("height", y.bandwidth())
                .attr("width", d => Math.abs(x(d.end) - x(d.start)));

            // Add value labels
            svg.selectAll(".label")
                .data(data)
                .enter()
                .append("text")
                .attr("y", d => y(d.feature) + y.bandwidth() / 2)
                .attr("x", d => x(d.end) + (d.value >= 0 ? 5 : -5))
                .attr("dy", "0.35em")
                .attr("fill", "#fafafa")
                .attr("font-size", "11px")
                .attr("text-anchor", d => d.value >= 0 ? "start" : "end")
                .text(d => d.value.toFixed(3));

            // Add Y axis with feature labels
            svg.append("g")
                .attr("class", "axis")
                .call(d3.axisLeft(y).tickFormat(d => {{
                    const item = data.find(x => x.feature === d);
                    return `${{d}} = ${{item.feature_value}}`;
                }}));

            // Add X axis
            svg.append("g")
                .attr("class", "axis")
                .attr("transform", `translate(0,${{height}})`)
                .call(d3.axisBottom(x).ticks(5));

            // Add X axis label
            svg.append("text")
                .attr("x", width / 2)
                .attr("y", height + 45)
                .attr("fill", "#fafafa")
                .attr("text-anchor", "middle")
                .attr("font-size", "12px")
                .text("SHAP Value (Impact on Prediction)");
        </script>
    </body>
    </html>
    """

    return html_code
