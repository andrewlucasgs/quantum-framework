<script setup>
import { computed, ref, watch } from 'vue';
import nerdamer from 'nerdamer';
import 'nerdamer/Solve';

import { Chart } from 'highcharts-vue'
import { useStateStore } from '../store/state';

const store = useStateStore();


const nValues = computed(() => {
    console.log(store.nStar)
    if (store.nStar === 'No solution' || store.nStar <= 1) {
        return [1, 10 ** 6, 10 ** 12, 10 ** 18]
    }
    return [
        1,
        Math.sqrt(Math.sqrt(Math.sqrt(Math.sqrt(store.nStar)))),
        Math.sqrt(Math.sqrt(Math.sqrt(store.nStar))),
        Math.sqrt(Math.sqrt(store.nStar)),
        Math.sqrt(store.nStar),
        store.nStar,
        Math.pow(store.nStar, 2),
    ]
})

// calculate point for each n
const classicalPoints = computed(() => {
    const points = [];
    for (let i = 0; i < nValues.value.length; i++) {
        const n = nValues.value[i];
        const time = nerdamer(store.classicalRuntime).evaluate({ n });
        points.push({
            x: n,
            y: Number(time.text('decimals')) <= 0 ? 1 : Number(time.text('decimals'))
        })
    }
    return points;


});


const quantumPoints = computed(() => {
    const points = [];
    for (let i = 0; i < nValues.value.length; i++) {
        const n = nValues.value[i];
        const time = nerdamer(`(${store.quantumRuntime} * (10^${store.hardwareSlowdown}))`).evaluate({ n });
        points.push({
            x: n,
            y: Number(time.text('decimals')) <= 0 ? 1 : Number(time.text('decimals'))
        })
    }
    return points;

});

function toBase10HTML(number) {
    // Calculate the base 10 logarithm of the number.
    var exponent = Math.log10(number);
    if (exponent === -Infinity) {
        return '10<sup>0</sup>';
    }


    return `10<sup>${Math.round(exponent * 100) / 100}</sup>`;

}

const chartOptions = {
    chart: {
        type: 'spline'
    },
    title: {
        text: 'Big O'
    },
    tooltip: {
        useHTML: true,
        formatter: function () {
            return `Problem Size: ${toBase10HTML(this.x)}<br/>Steps: ${toBase10HTML(this.y)}`;
        }
    },
    xAxis: {
        title: {
            text: 'n',
        },
        type: 'logarithmic',
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
        min: 1,

        labels: {

            useHTML: true,
            formatter: function () {
                return toBase10HTML(this.value);
            }
        }

    },
    yAxis: {
        title: {
            text: 'Time'
        },
        type: 'logarithmic',
        labels: {

            useHTML: true,
            formatter: function () {
                return toBase10HTML(this.value);
            }
        },
        min: 1,

    },
    series: [{
        name: 'Classical',
        data: classicalPoints.value
    }, {
        name: 'Quantum',
        data: quantumPoints.value
    }]

}

const key = ref(0);

watch([store], () => {
    chartOptions.series[0].data = classicalPoints.value;
    chartOptions.series[1].data = quantumPoints.value;
    chartOptions.xAxis.plotLines[0].value = store.nStar ? store.nStar : 1;
    chartOptions.xAxis.plotLines[0].label.text = `N* = ${toBase10HTML(store.nStar)}`;

    key.value += 1;
})



</script>

<template>
    <div>
        <Chart :key="key" :options="chartOptions" />
    </div>
</template>