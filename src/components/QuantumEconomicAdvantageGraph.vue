<script setup>

import Highcharts, { Legend, color } from 'highcharts'
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

function processDataToGraph(data) {
    // data contains classicalCostSteps, classicalSteps, quantumCostSteps, quantumSteps, stepCostStar, nCostStar, stepStar, nStar
    // the steps ara list of lists of the form [problem size, step]
    // I want to round the problem sizes to 2 decimal places, and remove duplicates
    let nStar = utils.round(data.nStar, 2)
    let nCostStar = utils.round(data.nCostStar, 2)
    let tStar = utils.round(data.tStar, 2)
    let tCostStar = utils.round(data.tCostStar, 2)

    const midY = (nCostStar + nStar) / 2
    const midX = (tStar + tCostStar) / 2

    const maxY = (midY * 2)
    const maxX = midX + (midX - 2024)

    let quantumAdvantage = data.quantumAdvantage.filter(step => step[0] <= maxX && step[1] <= maxY)
    let quantumCostAdvantage = data.quantumCostAdvantage.filter(step => step[0] <= maxX && step[1] <= maxY)
    let quantumFeasible = data.quantumFeasible.filter(step => step[0] <= maxX && step[1] <= maxY)

    let quantumAdvantageArea = data.quantumAdvantage.filter(step => step[0] >= tStar)
    let quantumCostAdvantageArea = data.quantumCostAdvantage.filter(step => step[0] >= tCostStar)
    const quantumFeasibleAux = Object.fromEntries(data.quantumFeasible.map(step => [step[0], step[1]]))
    const quantumCostAdvantageAux = Object.fromEntries(data.quantumCostAdvantage.map(step => [step[0], step[1]]))
    const quantumAdvantageAux = Object.fromEntries(data.quantumAdvantage.map(step => [step[0], step[1]]))

    quantumAdvantageArea = quantumAdvantageArea.map(step => [step[0], step[1], Math.min(
        nStar >= nCostStar ? maxY : quantumCostAdvantageAux[step[0]], quantumFeasibleAux[step[0]])])
    quantumCostAdvantageArea = quantumCostAdvantageArea.map(step => [step[0], step[1], Math.min(
        nCostStar > nStar ? maxY : quantumAdvantageAux[step[0]], quantumFeasibleAux[step[0]])])

    // Calculate the midpoint for quantumAdvantageArea
    const advantageAreaXSum = quantumAdvantageArea.reduce((sum, step) => sum + step[0], 0);
    const advantageAreaYSum = quantumAdvantageArea.reduce((sum, step) => sum + step[1], 0);
    const advantageAreaXMid = advantageAreaXSum / quantumAdvantageArea.length;
    const advantageAreaYMid = advantageAreaYSum / quantumAdvantageArea.length;

    // Calculate the midpoint for quantumCostAdvantageArea
    const costAdvantageAreaXSum = quantumCostAdvantageArea.reduce((sum, step) => sum + step[0], 0);
    const costAdvantageAreaYSum = quantumCostAdvantageArea.reduce((sum, step) => sum + step[1], 0);
    const costAdvantageAreaXMid = costAdvantageAreaXSum / quantumCostAdvantageArea.length;
    const costAdvantageAreaYMid = costAdvantageAreaYSum / quantumCostAdvantageArea.length;

    // Define the midpoints for advantage and cost advantage areas
    const advantageAreaMid = [advantageAreaXMid, advantageAreaYMid];
    const costAdvantageAreaMid = [costAdvantageAreaXMid, costAdvantageAreaYMid];

    const problemName = props.data.problemName.split('(')[0]

    const graphTitle = 'Quantum Economic Advantage for ' + (problemName.length > 40 ? '<br>' + problemName : problemName)

    return { graphTitle, quantumAdvantage, quantumCostAdvantage, quantumFeasible, tStar, nStar, tCostStar, nCostStar, maxY, maxX, quantumAdvantageArea, quantumCostAdvantageArea, advantageAreaXMid, advantageAreaYMid, costAdvantageAreaXMid, costAdvantageAreaYMid, advantageAreaMid, costAdvantageAreaMid }
}

let data = processDataToGraph(props.data)

const key = ref(0);



const chartOptions = {
    chart: {
        // zooming: {
        //     type: 'xy'
        // }

        marginRight: 80,
    },
    credits: {
        enabled: false
    },
    title: {
        text: data.graphTitle,
        style: {
            fontSize: '14px'
        }
    },
    legend: false,
    tooltip: {
        useHTML: true,
        shared: true,
        crosshairs: true,
        shadow: false,
        backgroundColor: 'transparent',
        formatter: function () {

            const year = utils.round(this.points[0].x, data.maxX - 2024 <= 5 ? 1 : 0)


            return `
            <div class="flex flex-col gap-1 bg-white p-2 rounded-lg shadow-md">
                <p class="text-gray-700 mb-1 font-bold"><span >${year}</span></p>
                ${this.points.map(point => `<div class="flex items-center gap-1">
                        <span class="w-4 h-[2px]" style="background-color: ${point.series.color};"></span>
                        <span class="flex-1 gap-1 flex justify-between" >${point.series.name === 'Classical' ? 'Classical Steps/Cost' : point.series.name}: <span class="min-w-[5ch] text-gray-700 font-bold">${utils.toBase10HTML(point.y)}</span></span>
                        </div>`).join('')
                }
            </div>
            `
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
        max: data.maxX,
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
        max: data.maxY,
        gridLineWidth: 1,
        gridLineColor: 'rgba(250,250,250,1)',
        endOnTick: false,
        

    },
    plotOptions: {
        areaspline: {
            fillOpacity: 0.5,
            threshold: 20
        },
        series: {
            labels: {
                connectorAllowed: false
            },
            lineWidth: 2,
            animation: false,

        },
        scatter: {
            dataLabels: {
                color: 'black',
                verticalAlign: 'bottom',
                enabled: true
            },
            enableMouseTracking: false,
            marker: {
                enabled: false
            }
        }
    },
    series: [

    ]
}

watch(() => props.data, async () => {
    data = processDataToGraph(props.data)
    updateGraph()

    key.value += 1;
}, { immediate: true, deep: true })


function updateGraph() {
    if (data.tStar <= 0) {
        chartOptions.yAxis.max = 100
    } else {
        chartOptions.yAxis.max = data.maxY
    }

    chartOptions.title.text = data.graphTitle
    chartOptions.xAxis.max = data.maxX
    const currentYear = new Date().getFullYear()
    const lastYear = data.maxX
    const mid = parseInt((data.maxX - 2024) / 2) + 2024
    chartOptions.xAxis.tickPositions = [
        currentYear,
        (currentYear + mid) / 2,
        mid,
        (mid + lastYear) / 2,
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
            name: 'Quantum Speed Advantage',
            type: 'areasplinerange',
            data: data.quantumAdvantageArea,
            showInLegend: false,
            enableMouseTracking: false,
            color: {
                linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
                stops: data.tStar <= data.tCostStar ? [
                    [0, 'rgba(219,234,254,.2)'],
                    [0.7, 'rgba(0,45,157,.3)'],
                    [1, 'rgba(0,45,157,.3)'],
                ] : [
                    [0, 'rgba(24,102,201,.2)'],
                    [0.2, 'rgba(24,102,201,0.5)'],
                    [1, 'rgba(24,102,201,.2)'],
                ]
            },
            // hide points
            marker: {
                enabled: false,
                symbol: 'circle'
            },

        },
        {
            name: 'Quantum Cost Advantage',
            type: 'areasplinerange',
            data: data.quantumCostAdvantageArea,
            showInLegend: false,
            enableMouseTracking: false,
            color: {
                linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
                stops: data.tStar <= data.tCostStar ? [
                    [0, 'rgba(24,102,201,.2)'],
                    [0.2, 'rgba(24,102,201,0.5)'],
                    [1, 'rgba(24,102,201,0.2)'],
                ] : [
                    [0, 'rgba(219,234,254,.2)'],
                    [0.7, 'rgba(48,158,244,.3)'],
                    [1, 'rgba(48,158,244,.3)'],
                ]

            },

            // hide points
            marker: {
                enabled: false,
                symbol: 'circle'
            },
        },

        {
            name: 'Quantum Feasibility',
            data: [...data.quantumFeasible, ({
                dataLabels: {
                    enabled: true,
                    align: 'left',
                    x: 3,
                    verticalAlign: 'middle',
                    overflow: false,
                    crop: false,
                    color: 'darkred',
                    shadow: false,
                    style: {
                        fontSize: '12px',
                        fontWeight: 'bold',
                        textOutline: 'none'
                    },
                    // breakline
                    useHTML: true,
                    formatter: function () {
                        return '<div style="text-align: cnter;">Quantum<br>Feasibility</div>';
                    }

                },
                x: data.quantumFeasible[data.quantumFeasible.length - 1][0],
                y: data.quantumFeasible[data.quantumFeasible.length - 1][1],

            })],
            color: 'darkred',
            dashStyle: 'dash',
            zoneAxis: 'x',
            zones: [{
                value: data.tStar,
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
            data: [...data.quantumAdvantage, ({
                dataLabels: {
                    enabled: true,
                    align: 'left',
                    x: 3,
                    verticalAlign: 'middle',
                    overflow: true,
                    crop: false,
                    color: 'rgba(0,45,157,1)',
                    shadow: false,
                    style: {
                        fontSize: '12px',
                        fontWeight: 'bold',
                        textOutline: 'none'
                    },
                    // breakline
                    useHTML: true,
                    formatter: function () {
                        return '<div style="text-align: cnter;">Speed<br/>Advantage</div>';
                    }

                },
                x: data.quantumAdvantage[data.quantumAdvantage.length - 1][0],
                y: data.quantumAdvantage[data.quantumAdvantage.length - 1][1],

            })],
            color: 'rgba(0,45,157,1)',
            dashStyle: 'dash',
            zoneAxis: 'x',
            zones: [{
                value: data.tStar,
            }, {
                dashStyle: 'solid'
            }],

            marker: {
                enabled: false,
                symbol: 'circle'
            },

        },
        {
            name: 'Quantum Cost Advantage',
            data: [...data.quantumCostAdvantage, ({
                dataLabels: {
                    enabled: true,
                    align: 'left',
                    x: 3,
                    verticalAlign: 'middle',
                    overflow: true,
                    crop: false,
                    color: 'rgba(48,158,244,1)',
                    shadow: false,
                    style: {
                        fontSize: '12px',
                        fontWeight: 'bold',
                        textOutline: 'none'
                    },
                    // breakline
                    useHTML: true,
                    formatter: function () {
                        return '<div style="text-align: cnter;">Cost<br/>Advantage</div>';
                    }

                },
                x: data.quantumCostAdvantage[data.quantumCostAdvantage.length - 1][0],
                y: data.quantumCostAdvantage[data.quantumCostAdvantage.length - 1][1],

            })],
            color: 'rgba(48,158,244,1)',
            dashStyle: 'dash',
            zoneAxis: 'x',
            zones: [{
                value: data.tCostStar,
            }, {
                dashStyle: 'solid'
            }],

            marker: {
                enabled: false,
                symbol: 'circle'
            },
            dataLabels: {
                enabled: true,
                align: 'right',
                x: 5,
                formatter: function () {
                    // Only show label for the last data point
                    if (this.point.index === this.series.data.length - 1) {
                        return 'Quantum Cost Advantage';
                    }
                    return null;
                }
            },
        }, {
            name: 'Quantum Cost Advantage',
            data: [[data.tCostStar, data.nCostStar,]],
            color: 'rgba(48,158,244,1)',
            type: 'scatter',
            maxPointWidth: 1,
            dataLabels: {
                enabled: true,
                align: 'right',
                useHTML: true,
                formatter: function () {
                    return `
                    <p class="text-gray-700 mb-1 font-bold" style="color: ${this.series.color};">${utils.round(this.x, data.maxX - 2024 <= 5 ? 1 : 0)}</p>
                    `
                },
            },
            marker: {
                enabled: true,
                symbol: 'circle'
            },
            showInLegend: false
        },
        {
            name: 'Quantum Advantage',
            data: [[data.tStar, data.nStar]],
            color: 'rgba(0,45,157,1)',
            type: 'scatter',
            maxPointWidth: 1,
            dataLabels: {
                enabled: true,
                align: 'right',
                useHTML: true,

                formatter: function () {
                    return `
                    <p class="text-gray-700 mb-1 font-bold" style="color: ${this.series.color};">${utils.round(this.x, data.maxX - 2024 <= 5 ? 1 : 0)}</p>
                    `
                },
            },
            marker: {
                enabled: true,
                symbol: 'circle'
            },
            showInLegend: false
        }







    ]
    chartOptions.annotations = [
        {
            allowOverlap: true,
            draggable: "",
            labelrank: data.tStar <= data.tCostStar ? 1 : 0,
            labelOptions: {
                backgroundColor: "transparent",
                borderColor: "transparent",
                color: "black",
                shape: "",
                fontSize: '12px',
                fontColor: 'black',
                rotation: -25
            },
            labels: [
                {
                                        point: {
                        x: data.costAdvantageAreaMid[0],
                        y: data.costAdvantageAreaMid[1],
                        xAxis: 0,
                        yAxis: 0
                    },
                    color: 'black',
                    x: data.maxX * 0.5,
                    y: data.maxY * 0.1,
                    useHTML: true,
                    text: data.tStar <= data.tCostStar ? '<b class="">Quantum<br>Economic Advantage:</b><br>Faster and Cheaper' : 'Quantum cheaper',
                    style: {
                        color: 'rgba(48,158,244,.9)',  // Sets the text color to black
                        fontSize: '12px',
                        fontWeight: '',
                        textAlign: 'center',
                        pointerEvents: 'none'  // Disable pointer events
                    },
                },
            ]
        },
        {
            allowOverlap: true,
            draggable: "",
            labelrank: data.tStar > data.tCostStar ? 1 : 0,
            labelOptions: {
                backgroundColor: "transparent",
                borderColor: "transparent",
                color: "black",
                shape: "",
                fontSize: '12px',
                fontColor: 'black',
                
            },
            labels: [
                {
                    point: {
                        x: data.advantageAreaMid[0],
                        y: data.advantageAreaMid[1],
                        xAxis: 0,
                        yAxis: 0
                    },
                    
                    x: data.maxX * 0.5,
                    y: data.maxY * 0.1,
                    color: 'black',
                    useHTML: true,
                    text: data.tStar >= data.tCostStar ? '<b class="">Quantum<br>Economic Advantage:</b><br>Faster and Cheaper' : 'Quantum faster',
                    style: {
                        fontSize: '12px',
                        fontWeight: '',
                        textAlign: 'center',
                        color: 'rgba(0,45,157,.9)',  // Sets the text color to black
                        pointerEvents: 'none'  // Disable pointer events
                    },
                },
            ]
        },
    ].sort((a, b) => b.labelrank - a.labelrank);

}

</script>

<template>
    <div>
        <Chart :key="key" :options="chartOptions" />
    </div>
</template>