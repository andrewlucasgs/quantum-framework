<script setup>
import { computed, ref, watch } from 'vue';
import nerdamer from 'nerdamer';
import 'nerdamer/Solve';

import { Chart } from 'highcharts-vue'
import { useStateStore } from '../store/state';

const store = useStateStore();

const roadmaps = {
    'IBM': [
        {
            year: 2021,
            qubits: 127,
        },
        {
            year: 2022,
            qubits: 433,
        },
        {
            year: 2023,
            qubits: 1121,
        },
        {
            year: 2025,
            qubits: 4158,
        },
    ],
    'Intel': [
        {
            year: 2017,
            qubits: 17,
        },
        {
            year: 2023,
            qubits: 49,
        },
    ],
    'IQM': [
        {
            year: 2021,
            qubits: 5,
        },
        {
            year: 2023,
            qubits: 20,
        },
        {
            year: 2024,
            qubits: 54,
        },
        {
            year: 2025,
            qubits: 150,
        },
    ],
}

function estimateQubits(organization, targetYear) {
    if (!roadmaps[organization]) {
        return `No data available for ${organization}`;
    }

    const data = roadmaps[organization];
    const sortedData = data.sort((a, b) => a.year - b.year); // Ensure data is sorted by year
    const lastDataPoint = sortedData[sortedData.length - 1];

    if (targetYear > lastDataPoint.year) {
        // Doubling the qubits for each year beyond the last known year
        const yearsDifference = targetYear - lastDataPoint.year;
        return lastDataPoint.qubits * Math.pow(2, yearsDifference);
    }

    // Find the two closest years for interpolation
    let before = null;
    let after = null;
    for (const entry of sortedData) {
        if (entry.year === targetYear) {
            return entry.qubits; // Exact year match
        } else if (entry.year < targetYear) {
            before = entry;
        } else if (entry.year > targetYear && !after) {
            after = entry;
        }
    }

    // Linear interpolation if both before and after are found
    if (before && after) {
        const slope = (after.qubits - before.qubits) / (after.year - before.year);
        return Math.round(before.qubits + slope * (targetYear - before.year));
    }

    // Return the closest known data if only one point is found
    return before ? before.qubits : after.qubits;
}

const years = Array.from({ length: 31 }, (_, i) => i + 2020);

function toBase10HTML(number) { //??? if this exact function exists elsewhere, it may be best to call them both from a single place
    // Calculate the base 10 logarithm of the number.
    var exponent = Math.log10(number);
    if (exponent === -Infinity) {
        return '10<sup>0</sup>';
    }

    return `10<sup>${Math.round(exponent * 100) / 100}</sup>`;
}

const chartOptions = {
    chart: {
        type: 'spline',
        zoomType: 'xy'
    },
    title: {
        text: 'Quantum Economic Advantage'
    },
    tooltip: {
        useHTML: true,
        formatter: function () {
            return `Problem Size: ${toBase10HTML(this.y)}<br>Year: ${this.x}`;
        }
    },
    xAxis: {
        title: {
            text: 'Year',
        },

    },
    yAxis: {
        title: {
            text: 'Problem Size'
        },
        plotLines: [{
            color: 'red',
            width: 2,
            value: store.nStar ? store.nStar : 1,

            label: {
                y: -15,
                useHTML: true,

                rotation: 0,
                text: `N* = ${toBase10HTML(store.nStar)}`,
                align: 'left',
                verticalAlign: 'bottom',
                orientation: 'horizontal',
                style: {
                    color: 'red'
                }
            },
            zIndex: 5
        }],
        type: 'logarithmic',
        labels: {

            useHTML: true,
            formatter: function () {
                return toBase10HTML(this.value);
            }
        },
        min: 1,
        max: store.nStar ? store.nStar * store.nStar : 1000000

    },
    series: [

        {
            name: 'IBM',
            data: years.map(year => [year, Math.pow(2,estimateQubits('IBM', year)/1000)]),
            zoneAxis: 'x',
            zones: [{
                value: 2023
            }, {
                dashStyle: 'dash'
            }]
        },
        {
            name: 'Intel',
            data: years.map(year => [year, Math.pow(2,estimateQubits('Intel', year)/1000)]),

            zoneAxis: 'x',
            zones: [{
                value: 2023
            }, {
                dashStyle: 'dash'
            }]
        },
        {
            name: 'IQM',
            data: years.map(year => [year, Math.pow(2,estimateQubits('IQM', year)/1000)]),
            zoneAxis: 'x',
            zones: [{
                value: 2023
            }, {
                dashStyle: 'dash'
            }]
        },
    ],

}

const key = ref(0);

watch([store], () => {
    chartOptions.yAxis.plotLines[0].value = store.nStar ? store.nStar : 1;
    chartOptions.yAxis.plotLines[0].label.text = `N* = ${toBase10HTML(store.nStar)}`;
    chartOptions.yAxis.max = store.nStar ? store.nStar * store.nStar : 1000000;
    key.value += 1;

})

</script>

<template>
    <div>
        <Chart :key="key" :options="chartOptions" />
    </div>
</template>