<script setup>
import { inject, ref, watch } from 'vue';
import { useInputStore } from '../store/input.js'
import Highcharts from 'highcharts'
import highchartsMore from 'highcharts/highcharts-more';
import highchartsAnnotations from 'highcharts/modules/annotations';
highchartsAnnotations(Highcharts);
highchartsMore(Highcharts);
import { Chart } from 'highcharts-vue'
import * as utils from "../store/utils"
import { useGraphStore } from '../store/graph.js';
import { max } from 'mathjs';


const props = defineProps(["hardwareIndex"])

const inputStore = useInputStore();
const graphStore = useGraphStore();

const chartOptions = {
    chart: {
        type: 'spline',
        width: 500,
        events: {
            load: function () {
                this.dashLines = [[graphStore.quantumEconomicAdvantage[props.hardwareIndex].tStar, graphStore.quantumEconomicAdvantage[props.hardwareIndex].nStar]].map(point => utils.drawDashLine(this, point))
            },
            redraw: function () {
                this.dashLines.forEach((line, i) => utils.drawDashLine(this, [[graphStore.quantumEconomicAdvantage[props.hardwareIndex].tStar, graphStore.quantumEconomicAdvantage[props.hardwareIndex].nStar]][i], line))
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
                // return `10<sup>${this.value}</sup>`;
                return utils.toBase10HTML(this.value);
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

let lastQueryString = ""
let cheapFlag = ref(false)

watch(() => graphStore.quantumEconomicAdvantage, async () => {
    // console.log("in qea watch")
    // console.log(props.hardwareIndex)
    //graphstore changes with any input change, so this check only rerenders graph if a crucial input changed
    let qeaQueryString = `${inputStore.classicalRuntime}_${inputStore.quantumRuntime}__${inputStore.createdHardwares[props.hardwareIndex].hardwareString}`
    // if (qeaQueryString === lastQueryString) {
    //     return
    // }
    lastQueryString = qeaQueryString
    await updateGraphData();
    key.value += 1;

}, {
    immediate: true

})

function getAreaData() {
    const xMax = 2024 + (graphStore.quantumEconomicAdvantage[props.hardwareIndex].tStar - 2024) * 2;
    const tStar = graphStore.quantumEconomicAdvantage[props.hardwareIndex].tStar;
    const feasibility = graphStore.quantumEconomicAdvantage[props.hardwareIndex].quantumFeasible.filter(point => point[0] <= xMax && point[0] >= tStar);
    const advantage = graphStore.quantumEconomicAdvantage[props.hardwareIndex].quantumAdvantage.filter(point => point[0] <= xMax && point[0] >= tStar);
    
    console.log("in area data")
    console.log(graphStore.quantumEconomicAdvantage[props.hardwareIndex].tStar)
    console.log(xMax, tStar)
    console.log(graphStore.quantumEconomicAdvantage[props.hardwareIndex])
    console.log(feasibility.length)
    console.log(advantage.length)
    
    // const data = feasibility.map((point, i) => [point[0], advantage[i][1], point[1]])
    //^^^ apparently feasiblity and advantage don't always have exact same length, will fix later
    let length = Math.min(feasibility.length, advantage.length)
    let data = []
    for (let i = 0; i < length; i++) {
        let point = feasibility[i]
        data.push([point[0], advantage[i][1], point[1]])
    }
    return data



}

async function updateGraphData() {
    if (props.hardwareIndex in graphStore.quantumAdvantage) {
        cheapFlag.value = true
    }
    else {
        cheapFlag.value = false
        chartOptions.series = []
        return
    }

    const xMax = 2024 + (graphStore.quantumEconomicAdvantage[props.hardwareIndex].tStar - 2024) * 2;

    console.log("qeaaaa", graphStore.quantumEconomicAdvantage[props.hardwareIndex])

    const yMax = graphStore.quantumEconomicAdvantage[props.hardwareIndex].quantumFeasible[graphStore.quantumEconomicAdvantage[props.hardwareIndex].quantumFeasible.length - 1][1]
    chartOptions.series = [
        {
            name: 'Feasibility',
            data: graphStore.quantumEconomicAdvantage[props.hardwareIndex].quantumFeasible.filter(point => point[0] <= xMax && point[1] <= yMax),
            color: 'green',
            dashStyle: 'dash',
            zoneAxis: 'x',
            zones: [{
                value: graphStore.quantumEconomicAdvantage[props.hardwareIndex].tStar,
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
            data: graphStore.quantumEconomicAdvantage[props.hardwareIndex].quantumAdvantage.filter(point => point[0] <= xMax && point[1] <= yMax),
            color: 'blue',
            dashStyle: 'dash',
            zoneAxis: 'x',
            zones: [{
                value: graphStore.quantumEconomicAdvantage[props.hardwareIndex].tStar,
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
            data: [[graphStore.quantumEconomicAdvantage[props.hardwareIndex].tStar, Math.log10(graphStore.quantumEconomicAdvantage[props.hardwareIndex].nStar)]],
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
            enableMouseTracking: false

        }
        
        
    ]
    console.log('free me', chartOptions.series[0].data.length)

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
                        x: graphStore.quantumEconomicAdvantage[props.hardwareIndex].tStar + 2,
                        y: Math.log10(graphStore.quantumEconomicAdvantage[props.hardwareIndex].nStar) + 2,
                        xAxis: 0,
                        yAxis: 0
                    },
                    useHTML: true,
                    text: "QUANTUM ECONOMIC\n ADVANTAGE"
                },
            ]
        },
       
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
                        y: Math.log10(graphStore.quantumEconomicAdvantage[props.hardwareIndex].nStar) - 4,
                        xAxis: 0,
                        yAxis: 0
                    },
                    useHTML: true,
                    text: `10<sup>${Math.round(Math.log10(graphStore.quantumEconomicAdvantage[props.hardwareIndex].nStar) * 100) / 100}</sup`,
                    
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
                        x: graphStore.quantumEconomicAdvantage[props.hardwareIndex].tStar + 0.5,
                        y: 0,
                        xAxis: 0,
                        yAxis: 0
                    },
                    useHTML: true,
                    text: `${utils.round(graphStore.quantumEconomicAdvantage[props.hardwareIndex].tStar * 100)}`,
                    
                },
            ]
        },

    ]

    chartOptions.yAxis.max = Math.log10(graphStore.quantumEconomicAdvantage[props.hardwareIndex].nStar) * 2;

}

const key = ref(0);

</script>

<template>
    <div>
        <Chart :key="key" :options="chartOptions" v-if="cheapFlag" />
    </div>
</template>