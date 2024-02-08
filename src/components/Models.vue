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
function bisectionMethod(f, a, b, tol = 1e-12, maxIter = 10000000) {
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


function getQuantumAdvantage(classicalRuntime, quantumRuntime, hardwareSlowdown, quantumImprovementRate = 2, year = 2024) {
    function toSolve(n) {
        const N = 10 ** n;
        let adjustmentFactor = hardwareSlowdown * (Math.pow(quantumImprovementRate, year - 2024));
        return classicalRuntime(N) - (quantumRuntime(N) * adjustmentFactor)
    }
    let result = bisectionMethod(toSolve, 0.0001, 308);
    return result
}


function calculateCurrentAdvantage(model) {
    let quantumRuntime = model.quantumRuntime;
    let classicalRuntime = model.classicalRuntime;
    let hardwareSlowdown = 10 ** model.hardwareSlowdown;
    let quantumImprovementRate = ((100 - model.quantumImprovementRate) / 100)
    let year = new Date().getFullYear();
    let advantage = getQuantumAdvantage(classicalRuntime, quantumRuntime, hardwareSlowdown, quantumImprovementRate, year);
    currentAdvantageData.value = {
        nStar: advantage,
        stepStar: classicalRuntime(10 ** advantage),
        quantumSteps: Array.from({ length: advantage * 2 }, (_, i) => quantumRuntime(10 ** i) * (hardwareSlowdown * (Math.pow(quantumImprovementRate, year - 2024))) + 1),
        classicalSteps: Array.from({ length: advantage * 2 }, (_, i) => classicalRuntime(10 ** i))
    }
}


function getQuantumFeasible(year, roadmap, physicalLogicalQubitsRatio = 1000) {
    year = parseFloat(year);
    let years = Object.keys(roadmap).map(Number);
    let qubits = Object.values(roadmap);

    let numberOfPhysicalQubits;
    if (roadmap.hasOwnProperty(year)) {
        numberOfPhysicalQubits = roadmap[year];
    } else if (year > Math.max(...years)) {
        // Simplified linear regression for years > 2024
        let regression = simpleLinearRegression(years.filter(y => y >= 2024), qubits.filter((_, index) => years[index] >= 2024));
        numberOfPhysicalQubits = regression.slope * year + regression.intercept;
    } else {
        // Implement a simple linear interpolation
        numberOfPhysicalQubits = linearInterpolation(years, qubits, year);
    }

    let problemSize = Math.pow(2, numberOfPhysicalQubits / physicalLogicalQubitsRatio);
    return problemSize;
}


function calculateQuantumEconomicAdvantage(model) {
    let quantumRuntime = model.quantumRuntime;
    let classicalRuntime = model.classicalRuntime;
    let hardwareSlowdown = 10 ** model.hardwareSlowdown;
    let physicalLogicalQubitsRatio = model.physicalLogicalQubitsRatio;
    let quantumImprovementRate = ((100 - model.quantumImprovementRate) / 100)
    let year = new Date().getFullYear();
    function qf(roadmap) {
        return year => Math.log10(getQuantumFeasible(year, roadmap, physicalLogicalQubitsRatio))
    }

    function qa(classicalRuntime, quantumRuntime, hardwareSlowdown, quantumImprovementRate) {
        return year => getQuantumAdvantage(classicalRuntime, quantumRuntime, hardwareSlowdown, quantumImprovementRate, year)
    }

    let quantumFeasible = qf(model.roadmap);
    console.log(quantumImprovementRate)
    let quantumAdvantage = qa(classicalRuntime, quantumRuntime, hardwareSlowdown, quantumImprovementRate);
    const tStar = bisectionMethod(year => quantumFeasible(year) - quantumAdvantage(year), 2024, 2100);
    quantumEconomicAdvantageData.value = {
        tStar: tStar,
        nStar: quantumFeasible(tStar),
        quantumFeasible: Array.from({ length: (tStar - year) * 2 + 1 }, (_, i) => [year + i, quantumFeasible(year + i)]),
        quantumAdvantage: Array.from({ length: (tStar - year) * 2 + 1 }, (_, i) => [year + i, quantumAdvantage(year + i)])
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
            <Form :modelIndex="modelIndex" />
        </div>
        <div class="md:flex gap-4 px-8  py-2">

            <QuantumAdvantageGraph :data="currentAdvantageData" />
            <QuantumEconomicAdvantageGraph :data="quantumEconomicAdvantageData" />
        </div>
    </div>
</template>

