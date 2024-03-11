<script setup>

import Highcharts from 'highcharts'
import highchartsMore from 'highcharts/highcharts-more';
import highchartsAnnotations from 'highcharts/modules/annotations';
highchartsAnnotations(Highcharts);
highchartsMore(Highcharts);
import { Chart } from 'highcharts-vue'

import { ref, defineProps, watch } from 'vue';

const props = defineProps({
    data: Object,
})


const key = ref(0);


function round(number) {
    return Math.round(number * 100) / 100;
}

function drawDashLine(chart, point, dashLine) {


    const xAxis = chart.xAxis[0]
    const yAxis = chart.yAxis[0]

    const x = Math.round(xAxis.toPixels(point[0]))
    const y = Math.round(yAxis.toPixels((point[1])))
    const d = ['M', xAxis.left, y, 'L', x, y, 'L', x, yAxis.top + yAxis.height]

    return dashLine
        ? dashLine.attr({ d })
        : chart.renderer.path(d).attr({ 'stroke-dasharray': '8,4', 'stroke': 'rgba(255,0,0,0.3)', 'stroke-width': 2, zIndex: 1 }).add()
}

function getAreaData() {
    // >= tstar
    const quantumAdvantage = props.data.quantumAdvantage.filter(point => point[0] >= props.data.tStar)
    const quantumFeasible = props.data.quantumFeasible.filter(point => point[0] >= props.data.tStar)
    const areaData = quantumAdvantage.map((point, i) => [point[0], quantumFeasible[i][1], point[1]])
    return [[props.data.tStar, props.data.nStar, props.data.nStar]].concat(areaData)
}

const chartOptions = {
    chart: {
        type: 'spline',
        events: {
            load: function () {

                if (props.data.tStar <= 0) {
                    // delete the line
                    if (this.dashLines && this.dashLines.length > 0)
                        this.dashLines.forEach((line, i) => line.destroy())
                } else {

                    this.dashLines = [[props.data.tStar, props.data.nStar]].map(point => drawDashLine(this, point))
                }


            },
            redraw: function () {


                this.dashLines.forEach((line, i) => drawDashLine(this, [[props.data.tStar, props.data.nStar]][i], line))


            }
        },
    },
    credits: {
        enabled: false
    },
    title: {
        text: 'Economic Advantage of Quantum Computing',
        style: {
            fontSize: '14px'
        }
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
                return this.value.toFixed(2);
            }
        },
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
        min: 0,
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
            name: 'Feasibility',
            data: props.data.quantumFeasible,
            color: 'green',
            dashStyle: 'dash',
            zoneAxis: 'x',
            zones: [{
                value: props.data.tStar,
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
            data: props.data.quantumAdvantage,
            color: 'blue',
            dashStyle: 'dash',
            zoneAxis: 'x',
            zones: [{
                value: props.data.tStar,
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
            data: [[props.data.tStar, (props.data.nStar)]],
            color: 'red',
            type: 'scatter',
            maxPointWidth: 1,
            marker: {
                enabled: true,
                symbol: 'circle'
            },
            showInLegend: false
        },
        {
            name: 'Quantum Economic Advantage',
            type: 'areasplinerange',
            data: getAreaData(),
            showInLegend: false,
            enableMouseTracking: false,
            // hide points
            marker: {
                enabled: false,
                symbol: 'circle'
            },

        }



    ]




}


chartOptions.annotations = [
    {
        draggable: "",
        labelOptions: {
            backgroundColor: "transparent",
            shape: "rect",
            borderColor: "transparent",
            style: {
                border: 0,
                color: "black",
                fontSize: "9px",
                text: "center",
            }
        },
        labels: [
            {
                point: {
                    x: props.data.tStar + 1.5,
                    y: props.data.nStar - 2.05,
                    xAxis: 0,
                    yAxis: 0
                },
                useHTML: true,
                formatter: function () {
                    return `<p class="text-center">QUANTUM ECONOMIC <BR>ADVANTAGE</p>`
                },
            },
        ]
    },

    {
        draggable: "",
        labelOptions: {
            backgroundColor: "transparent",
            borderColor: "red",
            shape: "rect"
        },
        labels: [
            {
                point: {
                    x: chartOptions.xAxis.min,
                    y: Math.log10(props.data.nStar) - 4,
                    xAxis: 0,
                    yAxis: 0
                },
                useHTML: true,
                text: `10<sup>${Math.round(Math.log10(props.data.nStar) * 100) / 100}</sup`,

            },
        ]
    },
    {
        draggable: "",
        labelOptions: {
            backgroundColor: "transparent",
            borderColor: "red",
            // color: "red",
            shape: "rect"
        },
        labels: [
            {
                point: {
                    x: props.data.tStar + 0.5,
                    y: 0,
                    xAxis: 0,
                    yAxis: 0
                },
                useHTML: true,
                text: `${Math.round(props.data.tStar * 100) / 100}`,

            },
        ]
    },

]

watch(() => props.data, async () => {
    updateGraph()

    key.value += 1;
}, { immediate: true, deep: true })

function yearToQuarter(yearFloat) {
    const year = Math.floor(yearFloat); // Extracts the year part
    const fraction = yearFloat - year; // Gets the fractional part of the year
    const quarter = Math.floor(fraction * 4) + 1; // Calculates the quarter

    return `${year} Q${quarter}`;
}

function yearToMonth(yearFloat) {
    const year = Math.floor(yearFloat); // Extracts the year part
    const fraction = yearFloat - year; // Gets the fractional part of the year
    const monthIndex = Math.floor(fraction * 12); // Calculates the month index (0-11)

    // Array of month abbreviations
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Select the correct month abbreviation using the month index
    const monthAbbreviation = months[monthIndex];

    return `${year} ${monthAbbreviation}`;
}



function updateGraph() {
    if (props.data.tStar <= 0) {
        chartOptions.yAxis.max = 100
    } else {
        chartOptions.yAxis.max = Math.max(props.data.nStar * 2, 2)
    }
    const currentYear = new Date().getFullYear()
    const lastYear = Math.max(...props.data.quantumFeasible.map(point => point[0]))
    const tStar = parseInt(props.data.tStar)
    chartOptions.xAxis.tickPositions = [
        currentYear,
        (currentYear + tStar) / 2,
        tStar,
        (tStar + lastYear) / 2,
        lastYear
    ]
    chartOptions.xAxis.labels = {

        useHTML: true,
        formatter: function () {
            if (lastYear - currentYear > 3)
                return this.value.toFixed(0);
            if (lastYear - currentYear > 1)
                return yearToQuarter(this.value);
            return yearToMonth(this.value);
        }
    }


    chartOptions.series = [
        {
            name: 'Feasibility',
            data: props.data.quantumFeasible,
            color: 'green',
            dashStyle: 'dash',
            zoneAxis: 'x',
            zones: [{
                value: props.data.tStar,
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
            data: props.data.quantumAdvantage,
            color: 'blue',
            dashStyle: 'dash',
            zoneAxis: 'x',
            zones: [{
                value: props.data.tStar,
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
            data: [[props.data.tStar, (props.data.nStar)]],
            color: 'red',
            type: 'scatter',
            maxPointWidth: 1,
            marker: {
                enabled: true,
                symbol: 'circle'
            },
            showInLegend: false
        },
        {
            name: 'Quantum Economic Advantage',
            type: 'areasplinerange',
            data: getAreaData(),
            showInLegend: false,
            enableMouseTracking: false,
            // hide points
            marker: {
                enabled: false,
                symbol: 'circle'
            },

        }
    ]
    chartOptions.annotations = [
        {
            draggable: "",
            labelOptions: {
                backgroundColor: "transparent",
                shape: "rect",
                borderColor: "transparent",
                style: {
                    border: 0,
                    color: "black",
                    fontSize: "9px",
                    text: "center",
                }
            },
            // labels: [
            //     {
            //         point: {
            //             x: props.data.tStar + 1.5,
            //             y: props.data.nStar - 2.05,
            //             xAxis: 0,
            //             yAxis: 0
            //         },
            //         useHTML: true,
            //         formatter: function () {
            //             return `<p class="text-center">QUANTUM ECONOMIC <BR>ADVANTAGE</p>`
            //         },
            //     },
            // ]
        },

        {
            draggable: "",
            labelOptions: {
                backgroundColor: "transparent",
                borderColor: " red",
                shape: "rect"
            },
            labels: [
                {
                    point: {
                        x: chartOptions.xAxis.min,
                        y: Math.log10(props.data.nStar) - 4,
                        xAxis: 0,
                        yAxis: 0
                    },
                    useHTML: true,
                    text: `10<sup>${Math.round(Math.log10(props.data.nStar) * 100) / 100}</sup`,

                },
            ]
        },
        {
            draggable: "",
            labelOptions: {
                backgroundColor: "transparent",
                borderColor: "red",
                // color: "red",
                shape: "rect"
            },
            labels: [
                {
                    point: {
                        x: props.data.tStar + 0.5,
                        y: 0,
                        xAxis: 0,
                        yAxis: 0
                    },
                    useHTML: true,
                    text: `${Math.round(props.data.tStar * 100) / 100}`,

                },
            ]
        },

    ]
}



</script>

<template>
    <div>
        <Chart :key="key" :options="chartOptions" />
    </div>
</template>