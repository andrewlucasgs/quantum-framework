<script setup>
import { watch, ref } from 'vue';
import QuantumAdvantageGraph from './QuantumAdvantageGraph.vue';
import QuantumEconomicAdvantageGraph from './QuantumEconomicAdvantageGraph.vue';
import Form from './Form.vue';

const props = defineProps({
    model: Object,
    modelIndex: Number
});


// find when f(x) = 0
function bisectionMethod(f, a, b, tol = 1e-2, maxIter = 10000000) {
    let fa = f(a);
    let fb = f(b);
    if (fa * fb >= 0) {
        return null;
    }

    let c = a;
    for (let i = 0; i < maxIter; i++) {
        c = (a + b) / 2;
        let fc = f(c);
        if (fc === 0 || (b - a) / 2 < tol) {
            return c;
        }
        if (fa * fc < 0) {
            b = c;
            fb = fc;
        } else {
            a = c;
            fa = fc;
        }
    }
    return c;
}

// Implement simpleLinearRegression and linearInterpolation functions based on your needs
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



function getQuantumAdvantage(classicalRuntime, quantumRuntime, hardwareSlowdown, quantumImprovementRate = 0.5, year = 2024) {
    let adjustmentFactor = Number(hardwareSlowdown) + Math.log10(Math.pow(quantumImprovementRate, year - 2024));
    if (adjustmentFactor <= 0) {
        return 0;
    }
    function toSolve(n) {

        return classicalRuntime(n) - (quantumRuntime(n) + adjustmentFactor)
    }
    let result = bisectionMethod(toSolve, 0, 100000);
    if (result >= 99999) return Infinity
    if (result === null) return 0
    return result
}



function calculateCurrentAdvantage(model) {
    let quantumRuntime = model.quantumRuntime;
    let classicalRuntime = model.classicalRuntime;
    let hardwareSlowdown = Number(model.hardwareSlowdown);
    let quantumImprovementRate = ((100 - model.quantumImprovementRate) / 100)
    let year = new Date().getFullYear();
    let advantage = getQuantumAdvantage(classicalRuntime, quantumRuntime, hardwareSlowdown, quantumImprovementRate, year);
    // range from 0 to double of the advantage with 200 ticks
    let range = []


    if (advantage === Infinity) {
        for (let i = 0; i < 300; i += 300 / 100) {
            range.push(i);
        }
        currentAdvantageData.value = {
            nStar: -1,
            stepStar: -1,
            // replace NaN with Infinity
            quantumSteps: range.map((i) => [i, quantumRuntime(i) + hardwareSlowdown]).map(([x, y]) => [x, y === NaN ? 99999 : y]),
            classicalSteps: range.map((i) => [i, classicalRuntime(i)]).map(([x, y]) => [x, isNaN(y) ? -1 : y])
        }
    }
    else if (advantage === 0) {
        for (let i = 0; i < 300; i += 300 / 100) {
            range.push(i);
        }
        currentAdvantageData.value = {
            nStar: 0,
            stepStar: classicalRuntime(0),
            // replace NaN with Infinity
            quantumSteps: range.map((i) => [i, quantumRuntime(i) + hardwareSlowdown]).map(([x, y]) => [x, y === NaN ? 99999 : y]),
            classicalSteps: range.map((i) => [i, classicalRuntime(i)]).map(([x, y]) => [x, isNaN(y) ? 0 : y])
        }


    } else {

        for (let i = 0; i < advantage * 2; i += advantage / 100) {
            range.push(i);
        }
        currentAdvantageData.value = {
            nStar: advantage,
            stepStar: classicalRuntime(advantage),
            quantumSteps: range.map((i) => [i, quantumRuntime(i) + hardwareSlowdown]),
            classicalSteps: range.map((i) => [i, classicalRuntime(i)])
        }
    }
}


function getQuantumFeasible(year, roadmap, physicalLogicalQubitsRatio = 1000) {
    year = parseFloat(year);
    let years = Object.keys(roadmap).map(Number);
    let qubits = Object.values(roadmap).map(x => Math.log10(x))

    let numberOfPhysicalQubits;
    if (roadmap.hasOwnProperty(year)) {
        numberOfPhysicalQubits = Math.log10(roadmap[year])
    } else if (year > Math.max(...years)) {
        let regression = exponentialRegression(years.filter(y => y >= 2024), qubits.filter((_, index) => years[index] >= 2024));
        numberOfPhysicalQubits = regression.a * Math.exp(regression.b * year);

    } else {
        numberOfPhysicalQubits = exponentialInterpolation(years, qubits, year)

    }
    let problemSize = (numberOfPhysicalQubits + Math.log10(Math.log10(2)) - Math.log10(physicalLogicalQubitsRatio))
    return 10 ** problemSize;
}



function calculateQuantumEconomicAdvantage(model) {
    let quantumRuntime = model.quantumRuntime;
    let classicalRuntime = model.classicalRuntime;
    let hardwareSlowdown = model.hardwareSlowdown;
    let physicalLogicalQubitsRatio = model.physicalLogicalQubitsRatio;
    let quantumImprovementRate = ((100 - model.quantumImprovementRate) / 100)
    let year = new Date().getFullYear();
    function qf(roadmap) {
        return year => getQuantumFeasible(year, roadmap, physicalLogicalQubitsRatio)
    }

    function qa(classicalRuntime, quantumRuntime, hardwareSlowdown, quantumImprovementRate) {
        return year => getQuantumAdvantage(classicalRuntime, quantumRuntime, hardwareSlowdown, quantumImprovementRate, year)
    }
    let quantumFeasible = qf(model.roadmap);
    let quantumAdvantage = qa(classicalRuntime, quantumRuntime, hardwareSlowdown, quantumImprovementRate);
    // when there is no quantum advantage
    if (quantumAdvantage(2024) >= 99999) {
        let range = []

        for (let i = 0; i < (2030 - year) * 2; i += (2030 - year) / 100) {
            range.push(i);
        }
        quantumEconomicAdvantageData.value = {
            tStar: -1,
            nStar: -1,
            quantumFeasible: range.map(i => [year + i, quantumFeasible(year + i)]),
            quantumAdvantage: range.map(i => [year + i, Infinity])
        }
    } else {

        const tStar = bisectionMethod(year => quantumFeasible(year) - quantumAdvantage(year), 2024, 3000);

        let range = []

        if (tStar != null) {
            for (let i = 0; i < (tStar - year) * 2; i += (tStar - year) / 100) {
                range.push(i);
            }

            quantumEconomicAdvantageData.value = {
                tStar: tStar,
                nStar: quantumFeasible(tStar),
                quantumFeasible: range.map(i => [year + i, quantumFeasible(year + i)]),
                quantumAdvantage: range.map(i => [year + i, quantumAdvantage(year + i)])
            }
        } else {
            for (let i = 0; i < (2030 - year) * 2; i += (2030 - year) / 100) {
                range.push(i);
            }
            quantumEconomicAdvantageData.value = {
                tStar: 0,
                nStar: 0,
                quantumFeasible: range.map(i => [year + i, quantumFeasible(year + i)]),
                quantumAdvantage: range.map(i => [year + i, quantumAdvantage(year + i)])
            }

        }
    }
}

const currentAdvantageData = ref({});
const quantumEconomicAdvantageData = ref({});

// watch problems and hardwareslowdown
watch(() => props.model, (model) => {
    calculateCurrentAdvantage(props.model);
    calculateQuantumEconomicAdvantage(props.model);
}, { immediate: true, deep: true });


</script>

<template>
    <div class="max-w-7xl mx-auto my-4 border border-gray-100 rounded-lg shadow-lg ">

        <div>
            <Form :modelId="model.id" />
        </div>
        <div class="md:flex gap-4 px-8  py-2">

            <QuantumAdvantageGraph :data="currentAdvantageData" />
            <QuantumEconomicAdvantageGraph :data="quantumEconomicAdvantageData" />
        </div>
    </div>
</template>

