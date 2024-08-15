<script setup>
import { ref, watch } from 'vue';
import { Chart } from 'highcharts-vue'
import * as utils from "../store/utils"

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
        marginTop: 60,
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
       
        // formatter: function () {
        //     if(this.series.name === "Quantum Cost" || this.series.name === "Quantum Cost Advantage"){
        //         return `Problem Size: ${utils.toBase10HTML(this.x)}<br/>Cost: ${utils.toBase10HTML(this.y)}`;
        //     } else if (this.series.name === "Classical"){
        //         return `Problem Size: ${utils.toBase10HTML(this.x)}<br/>Steps: ${utils.toBase10HTML(this.y)}<br/>Cost: ${utils.toBase10HTML(this.y)}`;
        //     }

        //     return `Problem Size: ${utils.toBase10HTML(this.x)}<br/>Steps: ${utils.toBase10HTML(this.y)}`;
        // }
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
            text: 'Classical Time Steps'
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
        endOnTick: true,
    },
    plotOptions: {
        series: {
            label: {
                connectorAllowed: false
            },
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
        to: data.maxX,
        color: '#FFA50055',
        color: {
            linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
            stops: [
                [0, 'rgba(0,190,255,0.25)'],
                [0.25, 'rgba(0,255,255,0.25)'],
                [1, 'rgba(0,190,255,0.25)'],
            ]
        },
    })
    chartOptions.xAxis.plotBands.push({
        from: data.nCostStar,
        to: data.maxX,
        color: '#0000FF55',
        color: {
            linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
            stops: [
                [0, 'rgba(100,190,0,0.25)'],
                [0.5, 'rgba(0,255,0,0.25)'],
                [1, 'rgba(100,190,0,0.25)'],
            ]
        },
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
                        fontSize: '10px',
                        fontWeight: 'bold',
                        textOutline: 'none'
                    }

                },
                x: data.classicalSteps[data.classicalSteps.length - 1][0],
                y: data.classicalSteps[data.classicalSteps.length - 1][1],

            })],
            color: 'green',
            marker: {
                enabled: false
            },

        },
        {
            name: 'Quantum',
            data: [...data.quantumSteps, ({
                dataLabels: {
                    enabled: true,
                    align: 'left',
                    x: 3,
                    verticalAlign: 'middle',
                    overflow: true,
                    crop: false,
                    format: '{series.name}',
                    color: 'blue',
                    shadow: false,
                    style: {
                        fontSize: '10px',
                        fontWeight: 'bold',
                        textOutline: 'none'
                    }

                },
                x: data.quantumSteps[data.quantumSteps.length - 1][0],
                y: data.quantumSteps[data.quantumSteps.length - 1][1],

            })],
            color: 'blue',
            marker: {
                enabled: false
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
                    color: 'orange',
                    shadow: false,
                    style: {
                        fontSize: '10px',
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
                color: 'orange'
            },
            color: 'orange',
            marker: {
                enabled: false
            }
        },

        {
            name: 'Quantum Cost Advantage',
            data: [[data.nCostStar, data.stepCostStar]],
            color: 'orange',
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
            color: 'red',
            type: 'scatter',
            maxPointWidth: 1,
            marker: {
                enabled: true,
                symbol: 'circle'
            },
            showInLegend: false
        }
    ]

    chartOptions.annotations = [

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
                        x: data.nStar + data.maxX * 0.05,
                        y: chartOptions.yAxis.max,
                        xAxis: 0,
                        yAxis: 0
                    },
                    useHTML: true,
                    text: utils.toBase10HTML(data.nStar.toFixed(1)),

                },
            ]
        },
        {
            draggable: "",
            labelOptions: {
                backgroundColor: "#ffffffdd",
                borderColor: "orange",
                // color: "red",
                shape: "rect"
            },
            labels: [
                {
                    point: {
                        x: data.nCostStar + data.maxX * 0.05,
                        y: chartOptions.yAxis.max,
                        xAxis: 0,
                        yAxis: 0
                    },
                    useHTML: true,
                    text: utils.toBase10HTML(data.nCostStar.toFixed(1)),

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
                fontSize: '10px',
                fontColor: 'black',
                rotation: -25

            },
            labels: [
                {
                    point: {
                        x: data.nCostStar + data.maxX * 0.05,
                        y: 0,
                        xAxis: 0,
                        yAxis: 0
                    },
                    color: 'black',
                    useHTML: true,
                    text: 'Cheaper',
                    style: {
                        color: 'black',  // Sets the text color to black
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
                fontSize: '10px',
                fontColor: 'black',
                rotation: -25

            },
            labels: [
                {
                    point: {
                        x: data.nStar + data.maxX * 0.05,
                        y: 0,
                        xAxis: 0,
                        yAxis: 0
                    },
                    color: 'black',
                    useHTML: true,
                    text: 'Faster',
                    style: {
                        color: 'black',  // Sets the text color to black
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