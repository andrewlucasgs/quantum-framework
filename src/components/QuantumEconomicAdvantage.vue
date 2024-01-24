<script setup>
import { inject, ref, watch } from 'vue';
import Highcharts from 'highcharts'
import highchartsMore from 'highcharts/highcharts-more';
import highchartsAnnotations from 'highcharts/modules/annotations';
highchartsAnnotations(Highcharts);
highchartsMore(Highcharts);
import { Chart } from 'highcharts-vue'


import { useGraphStore } from '../store/graph.js';

const graphStore = useGraphStore();

function drawDashLine(chart, point, dashLine) {
    console.log('djlkajdlkajldsk')
    console.log(point)


    const xAxis = chart.xAxis[0]
    const yAxis = chart.yAxis[0]

    const x = Math.round(xAxis.toPixels(point[0]))
    const y = Math.round(yAxis.toPixels(Math.log10(point[1])))
    const d = ['M', xAxis.left, y, 'L', x, y, 'L', x, yAxis.top + yAxis.height]

    return dashLine
        ? dashLine.attr({ d })
        : chart.renderer.path(d).attr({ 'stroke-dasharray': '8,4', 'stroke': 'rgba(255,0,0,0.3)', 'stroke-width': 2, zIndex: 1 }).add()
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
    plotOptions: {
        areaspline: {
            fillOpacity: 0.5,
            threshold: 20
        }
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

function getAreaData() {
    const xMax = 2024 + (graphStore.quantumEconomicAdvantage.tStar - 2024) * 2;
    const tStar = graphStore.quantumEconomicAdvantage.tStar;
    const feasibility = graphStore.quantumEconomicAdvantage.quantumFeasible.filter(point => point[0] <= xMax && point[0] >= tStar);
    const advantage = graphStore.quantumEconomicAdvantage.quantumAdvantage.filter(point => point[0] <= xMax && point[0] >= tStar);
    const data = feasibility.map((point, i) => [point[0], advantage[i][1], point[1]])
    return data



}

async function updateGraphData() {
    const xMax = 2024 + (graphStore.quantumEconomicAdvantage.tStar - 2024) * 2;
    const yMax = graphStore.quantumEconomicAdvantage.quantumFeasible[graphStore.quantumEconomicAdvantage.quantumFeasible.length - 1][1]
    chartOptions.series = [
        {
            name: 'Feasibility',
            data: graphStore.quantumEconomicAdvantage.quantumFeasible.filter(point => point[0] <= xMax && point[1] <= yMax),
            color: 'green',
            dashStyle: 'dash',
            zoneAxis: 'x',
            zones: [{
                value: graphStore.quantumEconomicAdvantage.tStar,
            }, {
                dashStyle: 'solid'
            }],
            marker: {
                enabled: false,
                symbol: 'circle'
            }
        },
        {
            name: 'Quantum Advantage',
            data: graphStore.quantumEconomicAdvantage.quantumAdvantage.filter(point => point[0] <= xMax && point[1] <= yMax),
            color: 'blue',
            dashStyle: 'dash',
            zoneAxis: 'x',
            zones: [{
                value: graphStore.quantumEconomicAdvantage.tStar,
            }, {
                dashStyle: 'solid'
            }],

            marker: {
                enabled: false,
                symbol: 'circle'
            }
        },
        {
            name: 'Intersection',
            data: [[graphStore.quantumEconomicAdvantage.tStar, Math.log10(graphStore.quantumEconomicAdvantage.nStar)]],
            color: 'red',
            type: 'scatter',
            maxPointWidth: 1,
            marker: {
                enabled: true,
                symbol: 'circle'
            },
        },
        {
            name: 'Quantum Economic Advantage',
            type: 'areasplinerange',
            data: getAreaData(),

        }



    ]

    chartOptions.annotations = [
        {
            draggable: "",
            labelOptions: {
                backgroundColor: "#002D9D", 
                shape: "rect"
            },
            labels: [
                {
                    point: {
                        x: graphStore.quantumEconomicAdvantage.tStar + 2,
                        y: Math.log10(graphStore.quantumEconomicAdvantage.nStar) + 2,
                        xAxis: 0,
                        yAxis: 0
                    },
                    useHTML: true,
                    text: "QUANTUM ECONOMIC\n ADVANTAGE"
                },
            ]
        }
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