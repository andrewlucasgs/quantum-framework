<script setup>

import Highcharts from 'highcharts'
import highchartsMore from 'highcharts/highcharts-more';
import highchartsAnnotations from 'highcharts/modules/annotations';
highchartsAnnotations(Highcharts);
highchartsMore(Highcharts);
import { Chart } from 'highcharts-vue'

import { ref, defineProps, watch } from 'vue';

const props = defineProps({
    data: Object,
})


const key = ref(0);


function round(number) {
    return Math.round(number * 100) / 100;
}


const chartOptions = {
    chart: {
        type: 'spline',
       
    },
    credits: {
        enabled: false
    },
    title: {
        text: 'Quantum Logical Qubits',
        style: {
            fontSize: '14px'
        }
    },
    tooltip: {
        useHTML: true,
        formatter: function () {
            return `<b>${this.series.name}</b><br/>Year: ${round(this.x)}<br/>Logical Qubits: 10<sup>${round(this.y)}</sup>`
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
            text: 'Logical Qubits'
        },
        type: 'linear',
        labels: {
            useHTML: true,
            formatter: function () {
                return `10<sup>${this.value}</sup>`;
            }
        },
        min: 0,
    },
    series: [
        {
            name: 'Logical Qubits',
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

function yearToQuarter(yearFloat) {
    const year = Math.floor(yearFloat); // Extracts the year part
    const fraction = yearFloat - year; // Gets the fractional part of the year
    const quarter = Math.floor(fraction * 4) + 1; // Calculates the quarter

    return `${year} Q${quarter}`;
}

function yearToMonth(yearFloat) {
    const year = Math.floor(yearFloat); // Extracts the year part
    const fraction = yearFloat - year; // Gets the fractional part of the year
    const monthIndex = Math.floor(fraction * 12); // Calculates the month index (0-11)

    // Array of month abbreviations
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Select the correct month abbreviation using the month index
    const monthAbbreviation = months[monthIndex];

    return `${year} ${monthAbbreviation}`;
}



function updateGraph() {  
    const currentYear = new Date().getFullYear()
    const lastYear = Math.max(...props.data.quantumFeasible.map(point => point[0]))
    chartOptions.xAxis.labels = {
        useHTML: true,
        formatter: function () {
            if (lastYear - currentYear > 3)
                return this.value.toFixed(0);
            if (lastYear - currentYear > 1)
                return yearToQuarter(this.value);
            return yearToMonth(this.value);
        }
    }


    chartOptions.series = [
        {
            name: 'Logical Qubits',
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