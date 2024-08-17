<script setup>
import { ref, watch } from 'vue';
import { Chart } from 'highcharts-vue'
import * as utils from "../store/utils"
import { split } from 'postcss/lib/list';

const props = defineProps({
    data: Object
});
const key = ref(0);


function processDataToGraph(data) {
    // data contains classicalCostSteps, classicalSteps, quantumCostSteps, quantumSteps, stepCostStar, nCostStar, stepStar, nStar
    // the steps ara list of lists of the form [problem size, step]
    // I want to round the problem sizes to 2 decimal places, and remove duplicates
    let stepCostStar = utils.round(data.stepCostStar, 2)
    let nCostStar = utils.round(data.nCostStar, 2)
    let stepStar = utils.round(data.stepStar, 2)
    let nStar = utils.round(data.nStar, 2)

    const midY = (stepCostStar + stepStar) / 2
    const midX = (nStar + nCostStar) / 2

    const maxY = midY * 2
    const maxX = midX * 2


    let classicalSteps = data.classicalSteps.filter(step => step[0] <= maxX && step[1] <= maxY)
    let quantumCostSteps = data.quantumCostSteps.sort((a, b) => a[0] - b[0]).filter(step => step[0] <= maxX && step[1] <= maxY)
    let quantumSteps = data.quantumSteps.filter(step => step[0] <= maxX && step[1] <= maxY)



    return { classicalSteps, quantumCostSteps, quantumSteps, stepCostStar, nCostStar, stepStar, nStar, maxY, maxX }
}

let data = processDataToGraph(props.data)



console.log(data)
const chartOptions = {
    chart: {
        marginRight: 60,
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
        shared: true,
        crosshairs: true,
        shadow: false,
        backgroundColor: 'transparent',
        formatter: function () {
            const problemSize = utils.toBase10HTML(this.points[0].x)
           
            
         console.log(this)
            return `
            <div class="flex flex-col gap-1 bg-white p-2 rounded-lg shadow-md">
                <p class="text-gray-700 mb-1 font-bold">Problem Size: <span >${problemSize}</span></p>
                ${
                    this.points.map(point => `<div class="flex items-center gap-1">
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
            text: 'Problem Size',
        },
        min: 0,
        max: data.maxX,
        labels: {
            useHTML: true,
            formatter: function () {
                return utils.toBase10HTML(this.value);
            }
        },
        plotBands: [{
            from: data.nStar,
            to: data.maxX,
            color: 'rgba(68, 170, 213, .2)'
        },
        {
            from: data.nCostStar,
            to: data.maxX,
            color: 'rgba(255, 102, 0, .2)'
        }
        ]

    },
    legend: false,
    yAxis: {
        title: {
            text: 'Classical Time Steps / Cost'
        },
        type: 'linear',
        labels: {

            useHTML: true,
            formatter: function () {
                return utils.toBase10HTML(this.value);
            }
        },
        gridLineWidth: 1,
        gridLineColor: 'rgba(250,250,250,0.25)',




        min: 0,
        max: data.maxY,
        endOnTick: false,
    },
    plotOptions: {
        series: {
            label: {
                connectorAllowed: false
            },
            lineWidth: 2,
        }
    },
    series: []

}

watch(() => props.data, async () => {
    data = processDataToGraph(props.data)
    updateGraphData();
    key.value += 1;
}, { immediate: true, deep: true })

function updateGraphData() {
    chartOptions.plotOptions.series.label.connectorAllowed = false

    chartOptions.xAxis.max = data.maxX
    chartOptions.yAxis.max = data.maxY
    console.log(data.maxX, data.maxY)

    chartOptions.xAxis.plotBands = []

    chartOptions.xAxis.plotBands.push({
        from: data.nStar,
        to: data.nStar > data.nCostStar ? data.maxX : data.nCostStar,
        color: {
            linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
            stops: [
                [0, 'rgba(219,234,254,.2)'],
                [1, 'rgba(0,45,157,.3)'],
            ]
        },
    })
    chartOptions.xAxis.plotBands.push({
        from: data.nCostStar,
        to: data.nStar <= data.nCostStar ? data.maxX : data.nStar,
        color: '#0000FF55',
        color: {
            linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
            stops: [
                [0, 'rgba(219,234,254,.2)'],
                [1, 'rgba(0,45,255,.3)'],
            ]
        },
    })
    chartOptions.xAxis.plotLines = []
    chartOptions.xAxis.plotLines.push({
        value: data.nStar,
        width: 1,
        color: 'rgba(0,45,157,.5)',

       
    })
    chartOptions.xAxis.plotLines.push({
        value: data.nCostStar,
        width: 1,
        color: 'rgba(0,45,255,.5)',
        
    })

    chartOptions.series = [
        {
            name: 'Classical',
            data: [...data.classicalSteps, ({
                dataLabels: {
                    enabled: true,
                    align: 'left',
                    x: 3,
                    verticalAlign: 'middle',
                    overflow: true,
                    crop: false,
                    format: '{series.name}',
                    color: 'green',
                    shadow: false,
                    style: {
                        fontSize: '12px',
                        fontWeight: 'bold',
                        textOutline: 'none'
                    }

                },
                x: data.classicalSteps[data.classicalSteps.length - 1][0],
                y: data.classicalSteps[data.classicalSteps.length - 1][1],

            })],
            color: 'green',
            marker: {
                enabled: false,
                symbol: 'circle'
            }

        },
        {
            name: 'Quantum Steps',
            data: [...data.quantumSteps, ({
                dataLabels: {
                    enabled: true,
                    align: 'left',
                    x: 3,
                    verticalAlign: 'middle',
                    overflow: true,
                    crop: false,
                    color: '#002D9D',
                    shadow: false,
                    style: {
                        fontSize: '12px',
                        fontWeight: 'bold',
                        textOutline: 'none'
                    },
                    useHTML: true,
                    formatter: function () {
                        return '<div style="text-align: cnter;">Quantum<br/>Steps</div>';
                    }
                },
                x: data.quantumSteps[data.quantumSteps.length - 1][0],
                y: data.quantumSteps[data.quantumSteps.length - 1][1],

            })],
            color: '#002D9D',
            marker: {
                enabled: false,
                symbol: 'circle'
            }
        },
        {
            name: 'Quantum Cost',
            data: data.quantumCostSteps,
            data: [...data.quantumCostSteps, ({
                dataLabels: {
                    enabled: true,
                    align: 'left',
                    x: 3,
                    verticalAlign: 'middle',
                    overflow: true,
                    crop: false,
                    color: 'blue',
                    shadow: false,
                    style: {
                        fontSize: '12px',
                        fontWeight: 'bold',
                        textOutline: 'none'
                    },
                    // breakline
                    useHTML: true,
                    formatter: function () {
                        return '<div style="text-align: cnter;">Quantum<br/>Cost</div>';
                    }

                },
                x: data.quantumCostSteps[data.quantumCostSteps.length - 1][0],
                y: data.quantumCostSteps[data.quantumCostSteps.length - 1][1],

            })],
            type: 'spline',
            style: {
                linewidth: 22,
                color: 'blue'
            },
            color: 'blue',
            marker: {
                enabled: false,
                symbol: 'circle'
            }
        },

        {
            name: 'Quantum Cost Advantage',
            data: [[data.nCostStar, data.stepCostStar]],
            color: 'blue',
            type: 'scatter',
            maxPointWidth: 1,
            marker: {
                enabled: true,
                symbol: 'circle'
            },
           
            showInLegend: false
        },
        {
            name: 'Quantum Advantage',
            data: [[data.nStar, data.stepStar]],
            color: '#002D9D',
            type: 'scatter',
            maxPointWidth: 1,
            marker: {
                enabled: true,
                symbol: 'circle'
            },
            
            showInLegend: false
        },
    ]

    chartOptions.annotations = [

       
        {
            draggable: "",
            labelOptions: {
                backgroundColor: "transparent",
                borderColor: "transparent",
                color: "black",
                shape: "rect",
                fontSize: '12px',
                fontColor: 'black',
                zIndex: 0,

            },
            labels: [
                {
                    point: {
                        x: data.nCostStar,
                        y: 0,
                        xAxis: 0,
                        yAxis: 0
                    },
                    align: data.nStar > data.nCostStar ? 'right' : 'left',
                    color: 'black',
                    useHTML: true,
                    text:utils.toBase10HTML(data.nCostStar.toFixed(1)) +'<br>Cheaper',

                    style: {
                        fontSize: '12px',

                        color: 'rgba(0,45,255,.9)',  // Sets the text color to black
                        textAlign: data.nStar > data.nCostStar ? 'right' : 'left',
                    },
                },
            ]
        },
        {
            draggable: "",
            labelOptions: {
                backgroundColor: "transparent",
                borderColor: "transparent",
                color: "black",
                shape: "rect",
                fontSize: '12px',
                fontColor: 'black',
                rotation: -25

            },
            labels: [
                {
                    point: {
                        x: data.nStar,
                        y: 0,
                        xAxis: 0,
                        yAxis: 0
                    },
                    color: 'black',
                    align: data.nStar <= data.nCostStar ? 'right' : 'left',

                    useHTML: true,
                    text:utils.toBase10HTML(data.nStar.toFixed(1)) +'<br>Faster',
                    style: {
                        fontSize: '12px',

                        color: 'rgba(0,45,157,.9)',  // Sets the text color to black
                        textAlign: data.nStar <= data.nCostStar ? 'right' : 'left',

                    },
                },
            ]
        }



    ]
}

</script>

<template>
    <div>
        <Chart :key="key" :options="chartOptions" />
    </div>
</template>
