<script setup>
import { ref, watch } from 'vue';
import { Chart } from 'highcharts-vue'
import * as utils from "../store/utils"

const props = defineProps({
    data: Object
});
const key = ref(0);


const chartOptions = {
    chart: {
        type: 'spline',
        events: {
            load: function () {
                this.dashLines = [[props.data.nStar, props.data.stepStar]].map(point => utils.drawDashLine(this, point))
            },
            redraw: function () {
                this.dashLines.forEach((line, i) => utils.drawDashLine(this, [[props.data.nStar, props.data.stepStar]][i], line))
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
            return `Problem Size: ${utils.toBase10HTML(this.x)}<br/>Steps: ${utils.toBase10HTML(this.y)}`;
        }
    },
    xAxis: {
        title: {
            text: 'Problem Size',
        },
        min: 0,
        labels: {
            useHTML: true,
            formatter: function () {
                return utils.toBase10HTML(this.value);
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
        type: 'linear',
        labels: {

            useHTML: true,
            formatter: function () {
                return utils.toBase10HTML(this.value);
            }
        },
        min: 0
    },
    series: []

}

watch(() => props.data, async () => {
    updateGraphData();
    key.value += 1;
}, { immediate: true, deep: true})

function updateGraphData() {
    if(props.data.nStar  <= 0){
        chartOptions.xAxis.tickPositions = [0, 25, 50, 75, 100]
    } else {
        chartOptions.xAxis.tickPositions = [0, props.data.nStar / 2, props.data.nStar, props.data.nStar * 3 / 2, props.data.nStar * 2]
    }
    chartOptions.series = [
        {
            name: 'Classical',
            data: props.data.classicalSteps,
            color: 'green',
            marker: {
                enabled: false
            }
        },
        {
            name: 'Quantum',
            data: props.data.quantumSteps,
            color: 'blue',
            marker: {
                enabled: false
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
                        y: props.data.stepStar / 1.1,
                        xAxis: 0,
                        yAxis: 0
                    },
                    useHTML: true,
                    text: utils.toBase10HTML(props.data.stepStar),

                },
            ]
        },
        {
            draggable: "",
            labelOptions: {
                backgroundColor: "#ffffffdd",
                borderColor: "red",
                // color: "red",
                shape: "rect"
            },
            labels: [
                {
                    point: {
                        x: props.data.nStar * 1.1,
                        y: chartOptions.yAxis.min,
                        xAxis: 0,
                        yAxis: 0
                    },
                    useHTML: true,
                    text: utils.toBase10HTML(props.data.nStar),

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