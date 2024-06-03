
<script setup>
import { Chart } from 'highcharts-vue'
import { number } from 'mathjs';
import { defineProps, ref, watch } from 'vue';

const props = defineProps({
    data: Object,
    extrapolationType: String
});

function simpleLinearRegression(x, y) {
    let n = x.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    for (let i = 0; i < n; i++) {
        sumX += x[i];
        sumY += y[i];
        sumXY += x[i] * y[i];
        sumXX += x[i] * x[i];
    }
    let slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    let intercept = (sumY - slope * sumX) / n;
    // console.log("printing year probably")
    // console.log(x)
    // console.log("printing log qubits?")
    // console.log(y)
    // console.log("slope intercept")
    // console.log(slope, intercept)
    return { slope, intercept };
}

function linearInterpolation(xValues, yValues, x) {
    let i = 0;
    for (; i < xValues.length - 1; i++) {
        if (x <= xValues[i + 1]) break;
    }
    let x1 = xValues[i], y1 = yValues[i];
    let x2 = xValues[i + 1], y2 = yValues[i + 1];
    return y1 + (y2 - y1) * (x - x1) / (x2 - x1);
}

function exponentialRegression(x, y) {
    let n = x.length;
    let sumX = 0, sumLogY = 0, sumXLogY = 0, sumXX = 0;
    for (let i = 0; i < n; i++) {
        // Compute sums for the regression, taking log of y values
        sumX += x[i];
        sumLogY += Math.log(y[i]);
        sumXLogY += x[i] * Math.log(y[i]);
        sumXX += x[i] * x[i];
    }
    let b = (n * sumXLogY - sumX * sumLogY) / (n * sumXX - sumX * sumX);
    let a = (sumLogY - b * sumX) / n;

    // Convert 'a' back to the original scale
    a = Math.exp(a);

    return { a, b }; // Returns the coefficients of y = ae^(bx)
}

function exponentialInterpolation(xValues, yValues, x) {
    let i = 0;
    // Find the interval [x[i], x[i+1]] where the value x lies
    for (; i < xValues.length - 1; i++) {
        if (x <= xValues[i + 1]) break;
    }

    let x1 = xValues[i], y1 = yValues[i];
    let x2 = xValues[i + 1], y2 = yValues[i + 1];

    // Compute the logarithms of y1 and y2 for the interpolation in log-space
    let logY1 = Math.log(y1);
    let logY2 = Math.log(y2);

    // Perform linear interpolation in log-space
    let logY = logY1 + (logY2 - logY1) * (x - x1) / (x2 - x1);

    // Convert the interpolated value back to the original scale
    return Math.exp(logY);
}

const regressionFunctions = {
    linear: simpleLinearRegression,
    exponential: exponentialRegression
}

const interpolationFunctions = {
    linear: linearInterpolation,
    exponential: exponentialInterpolation
}

// a map containing serialized strings of the inputs to the linear regression function mapped to their output regression
const linearRegressions = {}

function getPhysicalQubits(year, roadmap) {
    year = parseFloat(year);
    let years = Object.keys(roadmap).map(Number);
    // let qubits = Object.values(roadmap).map(x => Math.log10(x))
    let qubits = Object.values(roadmap).map(Number)

    //actual value of the number of physical qubits
    let numberOfPhysicalQubits;
    //logOfPhysicalQubits variable holds log_{10} of the true number of physical qubits
    let logOfPhysicalQubits;
    if (roadmap.hasOwnProperty(year)) {
        // logOfPhysicalQubits = Math.log10(roadmap[year])
        numberOfPhysicalQubits = roadmap[year]
        logOfPhysicalQubits = Math.log10(numberOfPhysicalQubits);

    } else if (year > Math.max(...years)) {
        if (props.extrapolationType === 'linear') {
            let key = JSON.stringify([years.slice(-2), qubits.slice(-2)]);
            let regression;
            if (linearRegressions.hasOwnProperty(key)) {
                console.log("cached")
                regression = linearRegressions[key]
            }
            else{
                console.log("new")
                regression = regressionFunctions["linear"](years.slice(-2), qubits.slice(-2));
                linearRegressions[key] = regression
            }

            // console.log("slope, intercept")
            // console.log(regression.slope, regression.intercept)
            numberOfPhysicalQubits = regression.slope * year + regression.intercept;
            logOfPhysicalQubits = Math.log10(numberOfPhysicalQubits);
        } else {
            let key = JSON.stringify([years.slice(-2), qubits.slice(-2).map(x => Math.log10(x))]);
            let regression;
            if (linearRegressions.hasOwnProperty(key)) {
                console.log("cached")
                regression = linearRegressions[key]
            }
            else{
                console.log("new")
                regression = regressionFunctions["linear"](years.slice(-2), qubits.slice(-2).map(x => Math.log10(x)));
                linearRegressions[key] = regression
            }
            //exponential regression is just linear regression in log space
            // let regression = regressionFunctions[props.extrapolationType](years.slice(-2), qubits.slice(-2).map(x => Math.log10(x)));
            // console.log("slope, intercept in logspace")
            // console.log(regression.slope, regression.intercept)
            // numberOfPhysicalQubits = 10 ** (regression.slope * year + regression.intercept);
            logOfPhysicalQubits = regression.slope * year + regression.intercept;

        }

    } else {
        console.log("interpolation")
        numberOfPhysicalQubits = interpolationFunctions[props.extrapolationType](years, qubits, year)
        logOfPhysicalQubits = Math.log10(numberOfPhysicalQubits);
    }


    return logOfPhysicalQubits
}

// function getPhysicalQubits(year, roadmap) {
//     year = parseFloat(year);
//     let years = Object.keys(roadmap).map(Number);
//     // let qubits = Object.values(roadmap).map(x => Math.log10(x))
//     let qubits = Object.values(roadmap).map(Number)

//     //actual value of the number of physical qubits
//     let numberOfPhysicalQubits;
//     //logOfPhysicalQubits variable holds log_{10} of the true number of physical qubits
//     let logOfPhysicalQubits;
//     if (roadmap.hasOwnProperty(year)) {
//         // logOfPhysicalQubits = Math.log10(roadmap[year])
//         numberOfPhysicalQubits = roadmap[year]
//         logOfPhysicalQubits = Math.log10(numberOfPhysicalQubits);

//     } else if (year > Math.max(...years)) {
//         if (props.extrapolationType === 'linear') {
//             let regression = regressionFunctions["linear"](years.slice(-2), qubits.slice(-2));
//             // console.log("slope, intercept")
//             // console.log(regression.slope, regression.intercept)
//             numberOfPhysicalQubits = regression.slope * year + regression.intercept;
//             logOfPhysicalQubits = Math.log10(numberOfPhysicalQubits);
//         } else {
//             //exponential regression is just linear regression in log space
//             let regression = regressionFunctions["linear"](years.slice(-2), qubits.slice(-2).map(x => Math.log10(x)));
//             // let regression = regressionFunctions[props.extrapolationType](years.slice(-2), qubits.slice(-2).map(x => Math.log10(x)));
//             // console.log("slope, intercept in logspace")
//             // console.log(regression.slope, regression.intercept)
//             // numberOfPhysicalQubits = 10 ** (regression.slope * year + regression.intercept);
//             logOfPhysicalQubits = regression.slope * year + regression.intercept;

//         }

//     } else {
//         console.log("interpolation")
//         numberOfPhysicalQubits = interpolationFunctions[props.extrapolationType](years, qubits, year)
//         logOfPhysicalQubits = Math.log10(numberOfPhysicalQubits);
//     }


//     return logOfPhysicalQubits
// }

// function getPhysicalQubits(year, roadmap) {
//     year = parseFloat(year);
//     let years = Object.keys(roadmap).map(Number);
//     let qubits = Object.values(roadmap).map(x => Math.log10(x))
//     // let qubits = Object.values(roadmap).map(Number)

//     let numberOfPhysicalQubits;
//     if (roadmap.hasOwnProperty(Number(year))) {
//         numberOfPhysicalQubits = roadmap[Number(year)]

//     } else if (year > Math.max(...years)) {
//         let regression = regressionFunctions[props.extrapolationType](years.slice(-2), qubits.slice(-2));
//         if (props.extrapolationType === 'linear') {
//             numberOfPhysicalQubits = regression.slope * year + regression.intercept;
//         } else {
//             numberOfPhysicalQubits = regression.a * Math.exp(regression.b * year);
//         }
        
//     } else {
//         numberOfPhysicalQubits = interpolationFunctions[props.extrapolationType](years, qubits, year)
//     }

//     let logPhysicalQubits = Math.log10(numberOfPhysicalQubits)
//     return logPhysicalQubits
// }

const physicalQubits = ref(Array.from({
    length: Math.max(Math.max(...Object.keys(props.data)) + 10, 2024 + 10) - 2024
}, (_, i) => [
    i + 2024,
    getPhysicalQubits(i + 2024, props.data)
]))

const chartOptions = {
    chart: {
        type: 'spline',
        zoomType: 'xy'
    },
    title: {
        // hide title
        text: null
    },
    credits: {
        enabled: false
    },
    tooltip: {
        useHTML: true,
        formatter: function () {
            return `Qubits: ${parseInt(10 ** this.y)}<br>Year: ${this.x}`;
        }
    },
    legend: {
        enabled: true,
        align: 'left',
        verticalAlign: 'top',
        layout: 'vertical',
        x: 60,
        y: 0,
        floating: true


    },
    xAxis: {
        title: {
            text: 'Year',
        },
        startOnTick: true,
        min: 2024,


    },
    yAxis: {
        title: {
            text: 'Qubits'
        },
        logarithmic: true,
        labels: {

            formatter: function () {
                return `10<sup>${this.value}</sup>`;
            },
            useHTML: true,

        },


    },
    series: [
        {
            data: physicalQubits.value,
            type: 'line',
            color: '#002D9D55',
            enableMouseTracking: false,
            // hide on legend 
            showInLegend: false,
        },
        {
            name: 'Roadmap',
            // if value is not a key in the roadmap, then it is a linear interpolation
            data: physicalQubits.value.filter(([year, qubits]) => props.data.hasOwnProperty(year)),
            type: 'scatter',
            color: 'blue',
            marker: {
                symbol: 'circle'
            },
            dataLabels: {
                enabled: true,
                formatter: function () {
                    return parseInt(10 ** this.y);
                },
                style: {
                    fontSize: '9px',
                    color: 'blue',
                    fontWeight: 'light',
                    textOutline: false
                }
            }
        },
        {
            name: 'Extrapolated',
            data: physicalQubits.value.filter(([year, qubits]) => !props.data.hasOwnProperty(year)),
            type: 'scatter',
            color: 'red',
            marker: {
                symbol: 'circle'
            },
            dataLabels: {
                enabled: true,
                formatter: function () {
                    return parseInt(10 ** this.y);
                },
                style: {
                    fontSize: '9px',
                    color: 'red',
                    fontWeight: 'light',
                    textOutline: false
                }
            }
        },

    ],

}

const key = ref(0);

watch(() => [props.data, props.extrapolationType],
    () => {

        physicalQubits.value = Array.from({
            length: Math.max(Math.max(...Object.keys(props.data)), 2024 + 10) - 2024 + 1
        }, (_, i) => [
            i + 2024,
            getPhysicalQubits(i + 2024, props.data)
        ])
        chartOptions.series[0].data = physicalQubits.value;
        chartOptions.series[1].data = physicalQubits.value.filter(([year, qubits]) => props.data.hasOwnProperty(year));
        chartOptions.series[2].data = physicalQubits.value.filter(([year, qubits]) => !props.data.hasOwnProperty(year));
        key.value += 1;
    }, { deep: true });


</script>

<template>
    <div>
        <Chart :key="key" :options="chartOptions" />
    </div>
</template>