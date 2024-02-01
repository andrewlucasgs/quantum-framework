<script setup>
import { computed, inject, ref, watch } from 'vue';
import { Chart } from 'highcharts-vue'
import { useInputStore } from '../store/input.js'
import { useGraphStore } from '../store/graph.js';

const props = defineProps(["hardwareIndex"])

const inputStore = useInputStore();
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
        : chart.renderer.path(d).attr({ 'stroke-dasharray': '8,4', 'stroke': 'rgba(255,0,0,0.3)', 'stroke-width': 2, zIndex: 1 }).add()
}


const chartOptions = {
    chart: {
        type: 'spline',
        events: {
            load: function () {
                this.dashLines = [[graphStore.quantumAdvantage[props.hardwareIndex].nStar, graphStore.quantumAdvantage[props.hardwareIndex].stepStar]].map(point => drawDashLine(this, point))
            },
            redraw: function () {
                this.dashLines.forEach((line, i) => drawDashLine(this, [[graphStore.quantumAdvantage[props.hardwareIndex].nStar, graphStore.quantumAdvantage[props.hardwareIndex].stepStar]][i], line))
            }
        }
    },
    credits: {
        enabled: false
    },
    title: {
        text: 'Minimum Problem Size for Quantum Algorithmic Advantage'
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

// let lastQueryString = ""

let cheapFlag = ref(false)

watch(() => graphStore.quantumAdvantage, async () => {
    console.log("in QA WATCH")
    console.log(props.hardwareIndex)
    // // //graphstore changes with any input change, so this check only rerenders graph if a crucial input changed
    // let qaQueryString = `${inputStore.classicalRuntime}_${inputStore.quantumRuntime}__${inputStore.createdHardwares[props.hardwareIndex].hardwareSlowdown}`
    // if (qaQueryString === lastQueryString) {
    //     console.log("in PROBLEM")
    //     console.log(qaQueryString)
    //     console.log(lastQueryString)
    //     return
    // }
    // lastQueryString = qaQueryString
    
    updateGraphData();

    key.value += 1;
}, { immediate: true })

function updateGraphData() {
    console.log("in update graph qa")
    console.log(graphStore.quantumAdvantage)
    console.log(props.hardwareIndex)
    console.log(props.hardwareIndex in graphStore.quantumAdvantage)

    if (props.hardwareIndex in graphStore.quantumAdvantage) {
        cheapFlag.value = true
    }
    else {
        cheapFlag.value = false
        chartOptions.series = []
        return
    }
    chartOptions.series = [
        {
            name: 'Classical',
            data: graphStore.quantumAdvantage[props.hardwareIndex].classicalSteps,
            color: 'green',
            marker: {
                symbol: 'circle'
            }
        },
        {
            name: 'Quantum',
            data: graphStore.quantumAdvantage[props.hardwareIndex].quantumSteps,
            color: 'blue',
            marker: {
                symbol: 'circle'
            }
        },
        {
            name: 'Quantum Advantage',
            data: [[graphStore.quantumAdvantage[props.hardwareIndex].nStar, graphStore.quantumAdvantage[props.hardwareIndex].stepStar]],
            color: 'red',
            type: 'scatter',
            dashStyle: 'dash',
            showInLegend: false,
        }
    ]

    chartOptions.annotations = [
        {
            draggable : "",
            labelOptions: {
                backgroundColor: "transparent", 
                borderColor: "red",
                shape: "rect"
            },
            labels: [
                {
                    point: {
                        x: chartOptions.xAxis.min,
                        y: graphStore.quantumAdvantage[props.hardwareIndex].stepStar,
                        xAxis: 0,
                        yAxis: 0
                    },
                    useHTML: true,
                    text: `10<sup>${Math.round(Math.log10(graphStore.quantumAdvantage[props.hardwareIndex].stepStar) * 100) / 100}</sup>`,
                    
                },
            ]
        },
        {
            draggable : "",
            labelOptions: {
                backgroundColor: "transparent", 
                borderColor: "red",
                // color: "red",
                shape: "rect"
            },
            labels: [
                {
                    point: {
                        x: graphStore.quantumAdvantage[props.hardwareIndex].nStar * 100,//times 100 to slightly offset text in the offset scale
                        y: Math.log10(graphStore.quantumAdvantage[props.hardwareIndex].stepStar),
                        xAxis: 0,
                        yAxis: 0
                    },
                    useHTML: true,
                    text: `10<sup>${Math.round(Math.log10(graphStore.quantumAdvantage[props.hardwareIndex].nStar) * 100) / 100}</sup>`,
                    
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
        <Chart :key="key" :options="chartOptions" v-if="cheapFlag" />
    </div>
</template>