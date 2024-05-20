<script setup>
import { watch, ref, defineAsyncComponent } from 'vue';
const QuantumAdvantageGraph = defineAsyncComponent(() => import('./QuantumAdvantageGraph.vue'));
const QuantumEconomicAdvantageGraph = defineAsyncComponent(() => import('./QuantumEconomicAdvantageGraph.vue'));
const LogicalQubitsGraph = defineAsyncComponent(() => import('./LogicalQubitsGraph.vue'));
const LogicalQubitsOnlyGraph = defineAsyncComponent(() => import('./LogicalQubitsOnlyGraph.vue'));
const QuantumFeasibilityGraph = defineAsyncComponent(() => import('./QuantumFeasibilityGraph.vue'));
const Form = defineAsyncComponent(() => import('./Form.vue'));

const props = defineProps({
    model: Object,
    modelIndex: Number
});


// find when f(x) = 0
function bisectionMethod(f, a, b, tol = 1e-5, maxIter = 10000000) {
    let fa = f(a);
    let fb = f(b);
    if (fa * fb >= 0) {
        return null;
    }

    let c = a;
    for (let i = 0; i < maxIter; i++) {
        c = (a + b) / 2;
        let fc = f(c);
        // if (fc === 0 || (b - a) / 2 < tol) {
        if (Math.abs(fc) < tol || (b - a) / 2 < tol) {
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


//returns log_10 of the problem size where qa is reached
function getQuantumAdvantage(problemName, penalty, classicalRuntime, quantumRuntime, hardwareSlowdown, quantumImprovementRate = 0.5, year = 2024) {
    let adjustmentFactor = Number(hardwareSlowdown) + Math.log10(Math.pow(quantumImprovementRate, year - 2024));
    if (adjustmentFactor <= 0) { //if adjustmentFactor is ever 0, then there is no hardware slowdown, so any problem should be QEA
        return 0;
    }
    // console.log("Inside QA")



    //assumes the penalty is log(n) or nothing
    if (problemName === "Database Search") {
        // console.log("Inside DS")
        // console.log(penalty)

        if (penalty === "log(n)") {
            let f = n => Math.log10(n) / 2 - adjustmentFactor - Math.log10(Math.log2(n))
            let result = bisectionMethod(f, 4, 10 ** 100); //starts at 4 because of function behavior
            if (year > 2100) {
                // console.log(year, adjustmentFactor, result, Math.log10(result))
            }
            // console.log("printing penalty n")
            // console.log(Math.log10(result))
            if (result === null) {
                console.log("null returned!!!!")
                return 0
            }
            // console.log(Math.log10(result))
            return Math.log10(result)
        }
        else {
            return 2 * adjustmentFactor
        }
    }
    else if (problemName === "Machine Learning") {
        if (penalty === "log(n)") {
            let f = n => Math.log10(n) / 2 - adjustmentFactor - Math.log10(Math.log2(n))
            let result = bisectionMethod(f, 2, 10 ** 100);
            if (result === null) {
                console.log("null returned!!!!")
                return 0
            }
            return Math.log10(result)
        }
        else {
            return 2 * adjustmentFactor
        }
    }
    else if (problemName === "Time Dependent Hartree-Fock Approximation (Quantum Chemistry)") {
        if (penalty === "log(n)") {
            let f = n => 2 * Math.log10(n) - adjustmentFactor - Math.log10(Math.log2(n))
            let result = bisectionMethod(f, 2, 10 ** 100);
            if (result === null) {
                console.log("null returned!!!!")
                return 0
            }
            return Math.log10(result)
        }
        else {
            return 0.5 * adjustmentFactor
        }
    }
    else if (problemName === "Linear Algebra") {
        if (penalty === "log(n)") {
            let f = n => 0.627 * Math.log10(n) - adjustmentFactor - Math.log10(Math.log2(n))
            let result = bisectionMethod(f, 2, 10 ** 100);
            if (result === null) {
                console.log("null returned!!!!")
                return 0
            }
            return Math.log10(result)
        }
        else {
            return adjustmentFactor / 0.627
        }
    }
    else if (problemName === "Traveling Salesman") {
        let f;
        if (penalty === "log(n)") {
            f = n => 2 * Math.log10(n) - adjustmentFactor - n * Math.log10(0.89) - Math.log10(Math.log2(n))
        }
        else {
            f = n => 2 * Math.log10(n) - adjustmentFactor - n * Math.log10(0.89)
        }
        let result = bisectionMethod(f, 2, 2000); //hardware slowdown of 10 ** (100) would yield an nstar of around 1700, plenty of buffer
        if (result === null) {
            console.log("null returned!!!!")
            return 0
        }
        return Math.log10(result)
    }
    else if (problemName === "Integer Factorization") {
        let f;
        if (penalty === "log(n)") {
            f = n => (64 * n / 9) ** (1 / 3) * (Math.log(n) ** (2 / 3)) * Math.log10(Math.E) - adjustmentFactor - 2 * Math.log10(n) - Math.log10(Math.log(n) * Math.log2(n))
        }
        else {
            f = n => (64 * n / 9) ** (1 / 3) * (Math.log(n) ** (2 / 3)) * Math.log10(Math.E) - adjustmentFactor - 2 * Math.log10(n) - Math.log10(Math.log(n))
        }
        // let result = bisectionMethod(f, 0, 100000); //100000 is overkill, no realistic slowdown would yield this
        let result = bisectionMethod(f, 2, 1000);
        if (result === null) {
            console.log("null returned!!!!")
            return 0
        }
        // if (result >= 99999) return Infinity
        return Math.log10(result)
    }
    else if (problemName === "Full Configuration Interaction (Quantum Chemistry)") {
        let f;
        if (penalty === "log(n)") {
            f = n => Math.log(n) * (n - 11) - n - adjustmentFactor * Math.log(10) - Math.log(Math.log2(n))
        }
        else {
            f = n => Math.log(n) * (n - 11) - n - adjustmentFactor * Math.log(10)
        }
        let result = bisectionMethod(f, 2, 60);
        if (result === null) {
            console.log("null returned!!!!")
            return 0
        }
        // if (result >= 99999) return Infinity
        return Math.log10(result)
    }

    return 0

    // function toSolve(n) {
    //     return classicalRuntime(n) - (quantumRuntime(n) + adjustmentFactor)
    // }
    // let result = bisectionMethod(toSolve, 0, 100000);
    // if (result >= 99999) return Infinity
    // if (result === null) return 0
    // return result
}



function calculateCurrentAdvantage(model) {
    // console.log("right hereerer")
    // console.log(model.hardwareSlowdown)
    // console.log(model.quantumImprovementRate)

    let problemName = model.problemName;
    let penalty = model.penalty;
    // let quantumRuntime = model.quantumRuntime;
    let quantumRuntime = addPenalty(model.quantumRuntime, model.penalty);
    let classicalRuntime = model.classicalRuntime;
    let hardwareSlowdown = Number(model.hardwareSlowdown);
    let quantumImprovementRate = ((100 - model.quantumImprovementRate) / 100)
    let year = new Date().getFullYear();
    let advantage = getQuantumAdvantage(problemName, penalty, classicalRuntime, quantumRuntime, hardwareSlowdown, quantumImprovementRate, year);

    // console.log(advantage)
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

const regressionFunctions = {
    linear: simpleLinearRegression,
    exponential: exponentialRegression
}

const interpolationFunctions = {
    linear: linearInterpolation,
    exponential: exponentialInterpolation
}

//returns the log_10 of the amount of logical qubits available with the given parameters
function getLogicalQubits(year, roadmap, physicalLogicalQubitsRatio, ratioImprovementRate) {
    year = parseFloat(year);
    let years = Object.keys(roadmap).map(Number);
    let qubits = Object.values(roadmap).map(x => Math.log10(x))

    //logOfPhysicalQubits variable holds log_{10} of the true number of physical qubits
    let logOfPhysicalQubits;
    if (roadmap.hasOwnProperty(year)) {
        logOfPhysicalQubits = Math.log10(roadmap[year])
    } else if (year > Math.max(...years)) {
        let regression = regressionFunctions[props.model.extrapolationType](years.slice(-2), qubits.slice(-2));
        if (props.model.extrapolationType === 'linear') {
            logOfPhysicalQubits = regression.slope * year + regression.intercept;
        } else {
            logOfPhysicalQubits = regression.a * Math.exp(regression.b * year);
        }

    } else {
        logOfPhysicalQubits = interpolationFunctions[props.model.extrapolationType](years, qubits, year)
    }

    //log_10 of the PLQR including the ratio improvement rate
    let adjustedPLQR = Math.log10(physicalLogicalQubitsRatio) + (year - 2024) * Math.log10(ratioImprovementRate);
    if (adjustedPLQR < Math.log10(3)) { //minimum PLQR is 3
        adjustedPLQR = Math.log10(3)
    }

    //logLogicalQubits has the log_10 of the true number of logical qubits
    // let logLogicalQubits = logOfPhysicalQubits - Math.log10(physicalLogicalQubitsRatio)
    let logLogicalQubits = logOfPhysicalQubits - adjustedPLQR
    return logLogicalQubits
}

//function returns the log of the problem size solvable, even though there is a "10 ** problemSize"
function getQuantumFeasible(year, roadmap, physicalLogicalQubitsRatio, ratioImprovementRate, qubitToProblemSize) {
    //logLogicalQubits has the log_10 of the true number of logical qubits
    let logLogicalQubits = getLogicalQubits(year, roadmap, physicalLogicalQubitsRatio, ratioImprovementRate)
    // logicalQubitsList.value.push(logLogicalQubits)

    if (qubitToProblemSize == "2^{# of qubits}") {
        // let problemSize = (logOfPhysicalQubits + Math.log10(Math.log10(2)) - Math.log10(physicalLogicalQubitsRatio))
        let problemSize = (logLogicalQubits + Math.log10(Math.log10(2)))
        return 10 ** problemSize;
    }
    else if (qubitToProblemSize == "2^(2^{# of qubits})") {
        // let problemSize = Math.pow(2, Math.pow(10, logOfPhysicalQubits) / physicalLogicalQubitsRatio) * Math.log10(2)
        let problemSize = Math.pow(2, Math.pow(10, logLogicalQubits)) * Math.log10(2)
        return problemSize;
    }
    else if (qubitToProblemSize == "{# of qubits}") {
        // let problemSize = logOfPhysicalQubits -  Math.log10(physicalLogicalQubitsRatio)
        let problemSize = logLogicalQubits
        return problemSize;
    }
    else if (qubitToProblemSize == "log({# of qubits})") {
        // let problemSize = Math.log10(logOfPhysicalQubits - Math.log10(physicalLogicalQubitsRatio)) - Math.log10(Math.log10(2))
        let problemSize = Math.log10(logLogicalQubits) - Math.log10(Math.log10(2))

        //true if logLogicalQubits is negative
        //(Amount of physical qubits is less than the ratio to achieve a single logical qubit))
        if (isNaN(problemSize)) {
            return 0;
        }

        return problemSize;
    }
}



function calculateQuantumEconomicAdvantage(model) {

    // let quantumRuntime = model.quantumRuntime;
    let problemName = model.problemName;
    let penalty = model.penalty;
    let quantumRuntime = addPenalty(model.quantumRuntime, model.penalty);
    let classicalRuntime = model.classicalRuntime;
    let hardwareSlowdown = model.hardwareSlowdown;
    let physicalLogicalQubitsRatio = model.physicalLogicalQubitsRatio;
    let ratioImprovementRate = ((100 - model.ratioImprovementRate) / 100);
    let quantumImprovementRate = ((100 - model.quantumImprovementRate) / 100);
    let qubitToProblemSize = model.qubitToProblemSize;
    let year = new Date().getFullYear();
    function qf(roadmap) {
        return year => getQuantumFeasible(year, roadmap, physicalLogicalQubitsRatio, ratioImprovementRate, qubitToProblemSize)
    }

    function qa(problemName, penalty, classicalRuntime, quantumRuntime, hardwareSlowdown, quantumImprovementRate) {
        return year => getQuantumAdvantage(problemName, penalty, classicalRuntime, quantumRuntime, hardwareSlowdown, quantumImprovementRate, year)
    }
    let quantumFeasible = qf(model.roadmap);
    let quantumAdvantage = qa(problemName, penalty, classicalRuntime, quantumRuntime, hardwareSlowdown, quantumImprovementRate);
    // when there is no quantum advantage
    if (quantumAdvantage(2024) >= 99999) {
        let range = []

        for (let i = 0; i < (2030 - year) * 2; i += (2030 - year) / 100) {
            range.push(i);
        }
        let quantumFeasibleList = range.map(i => [year + i, quantumFeasible(year + i)])
        quantumEconomicAdvantageData.value = {
            tStar: -1,
            nStar: -1,
            quantumFeasible: quantumFeasibleList,
            quantumAdvantage: range.map(i => [year + i, Infinity])
        }
        logicalQubitsData.value = {
            tStar: -1,
            qStar: -1,
            quantumFeasible: quantumFeasibleList.map(point => [point[0], problemSizeToQubits(point[1], qubitToProblemSize)]),
            // quantumFeasible: quantumFeasibleList.map(point => [point[0], problemSizeToQubits(point[1], qubitToProblemSize)]),
            quantumAdvantage: range.map(i => [year + i, Infinity])
        }


    } else {

        const tStar = bisectionMethod(year => quantumFeasible(year) - quantumAdvantage(year), 2024, 3000);

        let range = []

        if (tStar != null) {
            for (let i = 0; i < (tStar - year) * 2; i += (tStar - year) / 100) {
                range.push(i);
            }
            let nStar = quantumFeasible(tStar)
            // logicalQubitsList.value = []

            let quantumFeasibleList = range.map(i => [year + i, quantumFeasible(year + i)])
            let quantumAdvantageList = range.map(i => [year + i, quantumAdvantage(year + i)])

            // console.log(logicalQubitsList)
            // console.log(quantumFeasibleList.map(point => [point[0], problemSizeToQubits(point[1], qubitToProblemSize)]))
            quantumEconomicAdvantageData.value = {
                tStar: tStar,
                nStar: nStar,
                quantumFeasible: quantumFeasibleList,
                quantumAdvantage: quantumAdvantageList
            }
            logicalQubitsData.value = {
                tStar: tStar,
                qStar: problemSizeToQubits(nStar, qubitToProblemSize),
                quantumFeasible: quantumFeasibleList.map(point => [point[0], problemSizeToQubits(point[1], qubitToProblemSize)]),
                quantumAdvantage: quantumAdvantageList.map(point => [point[0], problemSizeToQubits(point[1], qubitToProblemSize)])
            }
        } else {
            for (let i = 0; i < (2030 - year) * 2; i += (2030 - year) / 100) {
                range.push(i);
            }
            let quantumFeasibleList = range.map(i => [year + i, quantumFeasible(year + i)])
            let quantumAdvantageList = range.map(i => [year + i, quantumAdvantage(year + i)])
            quantumEconomicAdvantageData.value = {
                tStar: 0,
                nStar: 0,
                quantumFeasible: quantumFeasibleList,
                quantumAdvantage: quantumAdvantageList
            }
            logicalQubitsData.value = {
                tStar: 0,
                qStar: 0,
                quantumFeasible: quantumFeasibleList.map(point => [point[0], problemSizeToQubits(point[1], qubitToProblemSize)]),
                quantumAdvantage: quantumAdvantageList.map(point => [point[0], problemSizeToQubits(point[1], qubitToProblemSize)])
            }

        }
    }
    console.log("out")
}

//returns the amount of logical qubits needed to achieve said problem size using the function specified by qubitToProblemSize
//(logSize parameter is log_10 of the actual problem size)
function problemSizeToQubits(logSize, qubitToProblemSize) {
    let loglogicalQubits = 0;
    if (qubitToProblemSize == "2^{# of qubits}") {
        loglogicalQubits = Math.log10(logSize) - Math.log10(Math.log10(2))
    }
    else if (qubitToProblemSize == "2^(2^{# of qubits})") {
        loglogicalQubits = Math.log10(Math.log2(logSize / Math.log10(2)))
    }
    else if (qubitToProblemSize == "{# of qubits}") {
        loglogicalQubits = logSize
    }
    else if (qubitToProblemSize == "log({# of qubits})") {
        loglogicalQubits = Math.pow(10, logSize) * Math.log10(2)
    }
    else {
        console.log("this should never print")
    }
    return loglogicalQubits;
}

function addPenalty(quantumRuntime, penalty) {
    // console.log(penalty)

    if (penalty == "log(n)") {
        // console.log('log penalty applied')
        return (n) => quantumRuntime(n) + Math.log10(n) + Math.log10(Math.log2(10))
    }
    else if (penalty == "n") {
        return (n) => quantumRuntime(n) + n;
    }
    else {
        return quantumRuntime;
    }
}

const currentAdvantageData = ref({});
const quantumEconomicAdvantageData = ref({});
const logicalQubitsData = ref({}); //is dependent on quantumEconomicAdvantageData being calculated
// const logicalQubitsList = ref([]); //holds the logical qubits associated with the data points in the quantum feasible list, used to prevent double calculating and rounding errors

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
        <template v-if="!model.quantumOnly">
            <div class="md:flex gap-4 px-8 py-2">

                <QuantumAdvantageGraph :data="currentAdvantageData" />
                <QuantumEconomicAdvantageGraph :data="quantumEconomicAdvantageData" />
            </div>
            <div class="md:flex gap-4 px-8 py-2 justify-center">

                <LogicalQubitsGraph :data="logicalQubitsData" />
            </div>
        </template>
        <template v-else>
            <div class="md:flex gap-4 px-8 py-2">
                <LogicalQubitsOnlyGraph :data="{
                    ...logicalQubitsData, quantumFeasible: logicalQubitsData.quantumFeasible.filter(
                        point => point[0] <= 2034
                    ),
                }" />

                <QuantumFeasibilityGraph :data="{
                    ...quantumEconomicAdvantageData, quantumFeasible: quantumEconomicAdvantageData.quantumFeasible.filter(
                        point => point[0] <= 2034
                    )
                }" />
            </div>

        </template>

    </div>
</template>