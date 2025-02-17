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
    // the steps are a list of lists of the form [problem size, step]
    // Round the problem sizes to 2 decimal places and remove duplicates
    let stepCostStar = utils.round(data.stepCostStar, 2);
    let nCostStar = utils.round(data.nCostStar, 2);
    let stepStar = utils.round(data.stepStar, 2);
    let nStar = utils.round(data.nStar, 2);

    const midY = (stepCostStar + stepStar) / 2;
    const midX = (nStar + nCostStar) / 2;

    // Set maxY and maxX to the minimum values among classicalSteps, quantumSteps, and quantumCostSteps if midY or midX is 0
    const maxY = (midY === 0)
        ? Math.min(...[data.classicalSteps, data.classicalCostSteps, data.quantumSteps, data.quantumCostSteps].map(arr => Math.max(...arr.map(step => step[1]))))
        : midY * 2;
    const maxX = (midX === 0)
        ? Math.min(...[data.classicalSteps, data.classicalCostSteps, data.quantumSteps, data.quantumCostSteps].map(arr => Math.max(...arr.map(step => step[0]))))
        : midX * 2;

    let classicalSteps = data.classicalSteps.filter(step => step[0] <= maxX && step[1] <= maxY);
    let classicalCostSteps = data.classicalCostSteps.filter(step => step[0] <= maxX && step[1] <= maxY);
    let quantumCostSteps = data.quantumCostSteps.filter(step => step[0] <= maxX && step[1] <= maxY);
    let quantumSteps = data.quantumSteps.filter(step => step[0] <= maxX && step[1] <= maxY);

    const problemName = props.data.problemName.split('(')[0];
    const graphTitle = problemName + (problemName.length > 40 ? '<br>' : ' ') + 'Problem Sizes';

    return { graphTitle, classicalSteps, classicalCostSteps, quantumCostSteps, quantumSteps, stepCostStar, nCostStar, stepStar, nStar, maxY, maxX };
}


let data = processDataToGraph(props.data)



const chartOptions = {
    chart: {
        marginRight: 70,
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
    tooltip: {
        useHTML: true,
        shared: true,
        crosshairs: true,
        shadow: false,
        backgroundColor: 'transparent',
        formatter: function () {
            const problemSize = utils.toBase10HTML(this.points[0].x)
           
            
            return `
            <div class="flex flex-col gap-1 bg-white p-2 rounded-lg shadow-md">
                <p class="text-gray-700 mb-1 font-bold">Problem Size: <span >${problemSize}</span></p>
                ${
                    this.points.map(point => `<div class="flex items-center gap-1">
                        <span class="w-4 h-[2px]" style="background-color: ${point.series.color};"></span>
                        <span class="flex-1 gap-1 flex justify-between" >${point.series.name}: <span class="min-w-[5ch] text-gray-700 font-bold">${utils.toBase10HTML(point.y)}</span></span>
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
            animation: false,

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
    chartOptions.title.text = data.graphTitle

    chartOptions.plotOptions.series.label.connectorAllowed = false

    chartOptions.xAxis.max = data.maxX
    chartOptions.yAxis.max = data.maxY

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
                [1, 'rgba(48,158,244,.3)'],
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
        color: 'rgba(48,158,244,.5)',
        
    })

    chartOptions.series = [
        {
            name: 'Classical Steps',
            data: [...data.classicalSteps, ({
                dataLabels: {
                    enabled: true,
                    align: 'left',
                    x: 3,
                    verticalAlign: 'middle',
                    overflow: true,
                    crop: false,
                    // format: '{series.name}',
                    color: 'green',
                    shadow: false,
                    style: {
                        fontSize: '12px',
                        fontWeight: 'bold',
                        textOutline: 'none'
                    },
                    useHTML: true,
                    formatter: function () {
                        return '<div style="text-align: cnter;">Classical<br/>Algorithm</div>';
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
            name: 'Classical Cost',
            data: [...data.classicalCostSteps, ({
                dataLabels: {
                    enabled: true,
                    align: 'left',
                    x: 3,
                    verticalAlign: 'middle',
                    overflow: true,
                    crop: false,
                    color: 'rgba(0,255,0,1)', //Andrew should choose a better color
                    shadow: false,
                    style: {
                        fontSize: '12px',
                        fontWeight: 'bold',
                        textOutline: 'none'
                    },
                    // breakline
                    useHTML: true,
                    formatter: function () {
                        return '<div style="text-align: cnter;">Classical<br/>Algorithm<br/>Cost</div>';
                    }

                },
                x: data.classicalCostSteps[data.classicalCostSteps.length - 1][0],
                y: data.classicalCostSteps[data.classicalCostSteps.length - 1][1],

            })],
            type: 'spline',
            style: {
                linewidth: 22,
                color: 'rgba(0,255,0,1)'
            },
            color: 'rgba(0,255,0,1)',
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
                    color: 'rgba(0,45,157,1)',
                    shadow: false,
                    style: {
                        fontSize: '12px',
                        fontWeight: 'bold',
                        textOutline: 'none'
                    },
                    useHTML: true,
                    formatter: function () {
                        return '<div style="text-align: cnter;">Quantum<br/>Algorithm<br/>Steps</div>';
                    }
                },
                x: data.quantumSteps[data.quantumSteps.length - 1][0],
                y: data.quantumSteps[data.quantumSteps.length - 1][1],

            })],
            color: 'rgba(0,45,157,1)',
            marker: {
                enabled: false,
                symbol: 'circle'
            }
        },
        {
            name: 'Quantum Cost',
            data: [...data.quantumCostSteps, ({
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
                        return '<div style="text-align: cnter;">Quantum<br/>Algorithm<br/>Cost</div>';
                    }

                },
                x: data.quantumCostSteps[data.quantumCostSteps.length - 1][0],
                y: data.quantumCostSteps[data.quantumCostSteps.length - 1][1],

            })],
            type: 'spline',
            style: {
                linewidth: 22,
                color: 'rgba(48,158,244,1)'
            },
            color: 'rgba(48,158,244,1)',
            marker: {
                enabled: false,
                symbol: 'circle'
            }
        },

        {
            name: 'Quantum Cost Advantage',
            data: [[data.nCostStar, data.stepCostStar]],
            color: 'rgba(48,158,244,1)',
            type: 'scatter',
            maxPointWidth: 1,
            marker: {
                enabled: true,
                symbol: 'circle'
            },
            enableMouseTracking: false,

           
            showInLegend: false
        },
        {
            name: 'Quantum Advantage',
            data: [[data.nStar, data.stepStar]],
            color: 'rgba(0,45,157,1)',
            type: 'scatter',
            maxPointWidth: 1,
            marker: {
                enabled: true,
                symbol: 'circle'
            },
            enableMouseTracking: false,
            showInLegend: false
        },
    ]

    chartOptions.annotations = [

       
        {
            draggable: "",
            labelOptions: {
                backgroundColor: "transparent",
                borderColor: "rgba(48,158,244,1)",
                color: "black",
                shape: "connector",
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
                    align: (data.nStar >= data.nCostStar && (Math.abs(data.nCostStar - data.nStar) / data.maxX) < 0.13) ? 'right' : 'left',
                    color: 'black',
                    useHTML: true,
                    text: '<b>'+utils.toBase10HTML(data.nCostStar.toFixed(1))+'</b>' + (data.nStar >= data.nCostStar ? '<br>Quantum<br>Cheaper' : '<br>Quantum<br>Faster and Cheaper'),

                    style: {
                        fontSize: '14px',
                        
                        pointerEvents: 'none',  // Disable pointer events

                        color: 'rgba(48,158,244,1)',  // Sets the text color to black
                        textAlign: (data.nStar >= data.nCostStar && (Math.abs(data.nCostStar - data.nStar) / data.maxX) < 0.13) ? 'right' : 'left',
                    },
                },
            ]
        },
        {
            draggable: "",
            labelOptions: {
                backgroundColor: "transparent",
                borderColor: "rgba(0,45,157,1)",
                color: "black",
                shape: "connector",
                fontSize: '12px',
                fontColor: 'black',
                rotation: -25,
                allowOverlap: true

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
                    align: (data.nStar < data.nCostStar && (Math.abs(data.nCostStar - data.nStar) / data.maxX) < 0.13) ? 'right' : 'left',

                    useHTML: true,
                    text: '<b>'+utils.toBase10HTML(data.nStar.toFixed(1))+'</b>' + (data.nStar < data.nCostStar ? '<br>Quantum<br>Faster' : '<br>Quantum<br>Faster and Cheaper'),
                    style: {
                        fontSize: '14px',
                        pointerEvents: 'none',  // Disable pointer events

                        color: 'rgba(0,45,157,1)',  // Sets the text color to black
                        textAlign: (data.nStar < data.nCostStar && (Math.abs(data.nCostStar - data.nStar) / data.maxX) < 0.13) ? 'right' : 'left',

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
