<script setup>

import Highcharts from 'highcharts'
import highchartsMore from 'highcharts/highcharts-more';
import highchartsAnnotations from 'highcharts/modules/annotations';
highchartsAnnotations(Highcharts);
highchartsMore(Highcharts);
import { Chart } from 'highcharts-vue'
import { ref, defineProps, watch } from 'vue';
import * as utils from "../store/utils"


const props = defineProps({
    data: Object,
})


const key = ref(0);

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

                    this.dashLines = [[props.data.tStar, props.data.nStar]].map(point => utils.drawDashLine(this, point))
                }


            },
            redraw: function () {
                this.dashLines.forEach((line, i) => utils.drawDashLine(this, [[props.data.tStar, props.data.nStar]][i], line))
            }
        },
    },
    credits: {
        enabled: false
    },
    title: {
        text: 'Cost Advantage',
        style: {
            fontSize: '14px'
        }
    },
    tooltip: {
        useHTML: true,
        formatter: function () {
            return `<b>${this.series.name}</b><br/>Year: ${utils.round(this.x)}<br/>Problem Size: 10<sup>${utils.round(this.y)}</sup>`
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
                // return `10<sup>${this.value}</sup>`;
                return utils.toBase10HTML(this.value);
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
            name: 'Cost Advantage',
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
            name: 'Cost Advantage Region',
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



watch(() => props.data, async () => {
    updateGraph()

    key.value += 1;
}, { immediate: true, deep: true })


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
                return utils.yearToQuarter(this.value);
            return utils.yearToMonth(this.value);
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
            name: 'Cost Advantage',
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
                
                backgroundColor: "#ffffff55",
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
                        x: (props.data.tStar + lastYear) / 2,
                        y: props.data.nStar,
                        xAxis: 0,
                        yAxis: 0
                    },
                    useHTML: true,
                    formatter: function () {
                        return `<p class="text-center">COST ADVANTAGE REGION</p>`
                    },
                },
            ]
        },

        {
            draggable: "",
            labelOptions: {
                backgroundColor: "#ffffffdd",
                borderColor: " red",
                shape: "rect"
            },
            labels: [
                {
                    point: {
                        x: chartOptions.xAxis.min,
                        y: props.data.nStar /1.1,
                        xAxis: 0,
                        yAxis: 0
                    },
                    useHTML: true,
                    text: utils.toBase10HTML(props.data.nStar),

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
                        x: props.data.tStar + (lastYear - props.data.tStar) / 9,
                        y: chartOptions.yAxis.min,
                        xAxis: 0,
                        yAxis: 0
                    },
                    useHTML: true,
                    text: `${utils.round(props.data.tStar)}`,

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