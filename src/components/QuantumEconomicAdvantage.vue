<script setup>
import { inject, ref, watch } from 'vue';
import Highcharts from 'highcharts'
import highchartsMore from 'highcharts/highcharts-more';
highchartsMore(Highcharts);
import { Chart } from 'highcharts-vue'


import { useGraphStore } from '../store/graph.js';

const graphStore = useGraphStore();

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
                this.dashLines = [[graphStore.quantumEconomicAdvantage.tStar, graphStore.quantumEconomicAdvantage.nStar]].map(point => drawDashLine(this, point))
            },
            redraw: function () {
                this.dashLines.forEach((line, i) => drawDashLine(this, [[graphStore.quantumEconomicAdvantage.tStar, graphStore.quantumEconomicAdvantage.nStar]][i], line))
            }
        }
    },
    title: {
        text: 'Economic Advantage of Quantum Computing'
    },
    tooltip: {
        useHTML: true,
        formatter: function () {
            return `<b>${this.series.name}</b><br/>Year: ${round(this.x)}<br/>Problem Size: 10<sup>${round(this.y)}</sup>`
        }
    },
    xAxis: {
        title: {
            text: 'Year'
        },
        type: 'linear',
        labels: {

            useHTML: true,
            formatter: function () {
                return this.value.toFixed(0);
            }
        },
        startOnTick: true,
        min: 2024,
    },
    yAxis: {
        title: {
            text: 'Problem Size'
        },
        type: 'linear',
        labels: {

            useHTML: true,
            formatter: function () {
                // return toBase10HTML(this.value);
                return `10<sup>${this.value}</sup>`;
            }
        },
        min: 1,
        // max: 10**20,
    },
    series: [

        {
            name: 'Classical',
            data: [],
            color: 'green',
            marker: {
                symbol: 'circle'
            }
        },
        {
            name: 'Quantum',
            data: [],
            color: 'red',
            marker: {
                symbol: 'circle'
            }
        }
    ],



}

watch(() => graphStore.quantumEconomicAdvantage, async () => {
    await updateGraphData();
    key.value += 1;

}, {
    immediate: true

})

async function updateGraphData() {
    const xMax = 2024 + (graphStore.quantumEconomicAdvantage.tStar - 2024) * 2;
    const yMax = graphStore.quantumEconomicAdvantage.quantumFeasible[graphStore.quantumEconomicAdvantage.quantumFeasible.length - 1][1]
    // console.log(xMax, yMax)
    chartOptions.series = [
        {
            name: 'Classical',
            data: graphStore.quantumEconomicAdvantage.quantumFeasible.filter(point => point[0] <= xMax && point[1] <= yMax),
            color: 'green',
            marker: {
                enabled: false,
                symbol: 'circle'
            }
        },
        {
            name: 'Quantum',
            data: graphStore.quantumEconomicAdvantage.quantumAdvantage.filter(point => point[0] <= xMax && point[1] <= yMax),
            color: 'blue',
            marker: {
                enabled: false,
                symbol: 'circle'
            }
        },
        {
            name: 'Quantum Advantage',
            data: [[graphStore.quantumEconomicAdvantage.tStar, Math.log10(graphStore.quantumEconomicAdvantage.nStar)]],
            color: 'red',
            type: 'scatter',
            maxPointWidth: 1,
            marker: {
                enabled: true,
                symbol: 'circle'
            },
        },



    ]
    
   chartOptions.yAxis.max = Math.log10(graphStore.quantumEconomicAdvantage.nStar) * 2;

}

// rounds input value to two decimal digits
function round(number) {
    return Math.round(number * 100) / 100;
}

function toBase10HTML(number) { //??? if this exact function exists elsewhere, it may be best to call them both from a single place
    // Calculate the base 10 logarithm of the number.
    var exponent = Math.log10(number);
    if (exponent === -Infinity) {
        return '10<sup>0</sup>';
    }

    return `10<sup>${Math.round(exponent * 100) / 100}</sup>`;
}



const key = ref(0);



</script>

<template>
    <div>
        <Chart :key="key" :options="chartOptions" />
    </div>
</template>