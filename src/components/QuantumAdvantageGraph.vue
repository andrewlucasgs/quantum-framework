<script setup>
import { ref, watch } from 'vue';
import { Chart } from 'highcharts-vue'


const props = defineProps({
    data: Object
});
const key = ref(0);

function drawDashLine(chart, point, dashLine) {
    const xAxis = chart.xAxis[0]
    const yAxis = chart.yAxis[0]

    const x = Math.round(xAxis.toPixels(point[0]))
    const y = Math.round(yAxis.toPixels(point[1]))
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
                this.dashLines = [[props.data.nStar, props.data.stepStar]].map(point => drawDashLine(this, point))
            },
            redraw: function () {
                this.dashLines.forEach((line, i) => drawDashLine(this, [[props.data.nStar, props.data.stepStar]][i], line))
            }
        }
    },
    credits: {
        enabled: false
    },
    title: {
        text: 'Minimum Problem Size for Quantum Algorithmic Advantage',
        style: {
            fontSize: '14px'
        }
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
        min: 1,
        labels: {
            useHTML: true,
            formatter: function () {
                return toBase10HTML(10 ** this.value);
            }
        },
        tickPositions: [0, props.data.nStar / 2, props.data.nStar, props.data.nStar * 3 / 2, props.data.nStar * 2],
        startOnTick: true,
        endOnTick: true,
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

// let lastQueryString = ""


watch(() => props.data, async () => {


    updateGraphData();
    key.value += 1;
}, { immediate: true, deep: true})

function updateGraphData() {
    chartOptions.series = [
        {
            name: 'Classical',
            data: props.data.classicalSteps,
            color: 'green',
            marker: {
                symbol: 'circle'
            }
        },
        {
            name: 'Quantum',
            data: props.data.quantumSteps,
            color: 'blue',
            marker: {
                symbol: 'circle'
            }
        },
        {
            name: 'Quantum Advantage',
            data: [[props.data.nStar, props.data.stepStar]],
            color: 'red',
            type: 'scatter',
            dashStyle: 'dash',
            showInLegend: false,
        }
    ]

    chartOptions.annotations = [
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
                        y: props.data.stepStar,
                        xAxis: 0,
                        yAxis: 0
                    },
                    useHTML: true,
                    text: `10<sup>${Math.round(Math.log10(props.data.stepStar) * 100) / 100}</sup>`,

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
                        x: props.data.nStar * 100,//times 100 to slightly offset text in the offset scale
                        y: Math.log10(props.data.stepStar),
                        xAxis: 0,
                        yAxis: 0
                    },
                    useHTML: true,
                    text: `10<sup>${Math.round(Math.log10(props.data.nStar) * 100) / 100}</sup>`,

                },
            ]
        },

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