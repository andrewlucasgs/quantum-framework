<script setup>
import { computed, inject, ref, watch } from 'vue';
import { Chart } from 'highcharts-vue'
import { useGraphStore } from '../store/graph.js';

const graphStore = useGraphStore();

const key = ref(0);

function drawDashLine(chart, point, dashLine) {
    const xAxis = chart.xAxis[0]
    const yAxis = chart.yAxis[0]

    const x = Math.round(xAxis.toPixels(point[0]))
    const y = Math.round(yAxis.toPixels(point[1]))
    const d = ['M', xAxis.left, y, 'L', x, y, 'L', x, yAxis.top + yAxis.height]

    return dashLine
        ? dashLine.attr({ d })
        : chart.renderer.path(d).attr({ 'stroke-dasharray': '8,4', 'stroke': 'red', 'stroke-width': 2, zIndex: 1 }).add()
}


const chartOptions = {
    chart: {
        type: 'spline',
        events: {
            load: function () {
                this.dashLines = [[graphStore.quantumAdvantage.nStar, graphStore.quantumAdvantage.stepStar]].map(point => drawDashLine(this, point))
            },
            redraw: function () {
                this.dashLines.forEach((line, i) => drawDashLine(this, [[graphStore.quantumAdvantage.nStar, graphStore.quantumAdvantage.stepStar]][i], line))
            }
        }
    },
    title: {
        text: 'Time Complexities with Hardware Slowdown'
    },
    tooltip: {
        useHTML: true,
        formatter: function () {
            return `Problem Size: ${toBase10HTML(this.x)}<br/>Steps: ${toBase10HTML(this.y)}`;
        }
    },
    xAxis: {
        title: {
            text: 'Problem Size',
        },
        type: 'logarithmic',
        min: 1,
        labels: {
            useHTML: true,
            formatter: function () {
                return toBase10HTML(this.value);
            }
        }
    },
    yAxis: {
        title: {
            text: 'Classical Time Steps'
        },
        type: 'logarithmic',
        labels: {

            useHTML: true,
            formatter: function () {
                return toBase10HTML(this.value);
            }
        },
        min: 1,
    },
    series: []

}

watch(() => graphStore.quantumAdvantage, async () => {
    updateGraphData();


    key.value += 1;
}, { immediate: true })

function updateGraphData() {
   
    chartOptions.series = [
        {
            name: 'Classical',
            data: graphStore.quantumAdvantage.classicalSteps,
            color: 'green',
            marker: {
                symbol: 'circle'
            }
        },
        {
            name: 'Quantum',
            data: graphStore.quantumAdvantage.quantumSteps,
            color: 'blue',
            marker: {
                symbol: 'circle'
            }
        },
        {
            name: 'Quantum Advantage',
            data: [[graphStore.quantumAdvantage.nStar, graphStore.quantumAdvantage.stepStar]],
            color: 'red',
            type: 'scatter',
            dashStyle: 'dash',
        }
    ]
}


function toBase10HTML(number) {
    // Calculate the base 10 logarithm of the number.
    var exponent = Math.log10(number);
    if (exponent === -Infinity) {
        return '10<sup>0</sup>';
    }


    return `10<sup>${Math.round(exponent * 100) / 100}</sup>`;
}


</script>

<template>
    <div>
        <Chart :key="key" :options="chartOptions" />
    </div>
</template>