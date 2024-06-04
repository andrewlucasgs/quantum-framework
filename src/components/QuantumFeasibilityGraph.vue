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

const chartOptions = {
    chart: {
        type: 'spline',
       
    },
    credits: {
        enabled: false
    },
    title: {
        text: 'Quantum Feasibility',
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
                return utils.toBase10HTML(this.value);
            }
        },
        min: 0,
    },
    series: [
        {
            name: 'Feasibility',
            data: props.data.quantumFeasible.map(point => [point[0], Math.max(0, point[1])]),
            color: 'green',
            dashStyle: 'solid',
            marker: {
                enabled: false,
                symbol: 'circle'
            }
        },
    ]
}

watch(() => props.data, async () => {
    updateGraph()

    key.value += 1;
}, { immediate: true, deep: true })

function updateGraph() {  
    const currentYear = new Date().getFullYear()
    const lastYear = Math.max(...props.data.quantumFeasible.map(point => point[0]))
  
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
            // min 0 to avoid negative values
            data: props.data.quantumFeasible.map(point => [point[0], Math.max(0, point[1])]),
            color: 'green',
            dashStyle: 'solid',
            marker: {
                enabled: false,
                symbol: 'circle'
            }
        },
    ]
}



</script>

<template>
    <div>
        <Chart :key="key" :options="chartOptions" />
    </div>
</template>