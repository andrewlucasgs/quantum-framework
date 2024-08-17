<script setup>
import { re } from 'mathjs';
import { watch, ref, defineAsyncComponent } from 'vue';
import * as utils from "../store/utils"

const QuantumAdvantageGraph = defineAsyncComponent(() => import('./QuantumAdvantageGraph.vue'));
const QuantumEconomicAdvantageGraph = defineAsyncComponent(() => import('./QuantumEconomicAdvantageGraph.vue'));
const LogicalQubitsGraph = defineAsyncComponent(() => import('./LogicalQubitsGraph.vue'));
const LogicalQubitsOnlyGraph = defineAsyncComponent(() => import('./LogicalQubitsOnlyGraph.vue'));
const QuantumFeasibilityGraph = defineAsyncComponent(() => import('./QuantumFeasibilityGraph.vue'));
const MoneyAlgorithmGraph = defineAsyncComponent(() => import('./MoneyAlgorithmGraph.vue'));
const MoneyEconomicGraph = defineAsyncComponent(() => import('./MoneyEconomicGraph.vue'));
const Form = defineAsyncComponent(() => import('./Form.vue'));

const props = defineProps({
    model: Object,
    modelIndex: Number
});

//returns log_10 of the problem size where qa is reached
function getQuantumAdvantage(problemName, penalty, classicalRuntime, quantumRuntime, hardwareSlowdown, quantumImprovementRate = 0.5, year = 2024) {
    let adjustmentFactor = Number(hardwareSlowdown) + Math.log10(Math.pow(quantumImprovementRate, year - 2024));
    if (adjustmentFactor <= -5) { //if adjustmentFactor is ever 0, then there is no hardware slowdown, so any problem should be QEA
        return 0;
    }

    //assumes the penalty is log(n) or nothing
    if (problemName === "Database Search")  { 
        if (penalty === "log(n)") { 
            let f = n => Math.log10(n) / 2 - adjustmentFactor - Math.log10(Math.log2(n))
            let result = utils.bisectionMethod(f, 4, 10**100); //starts at 4 because of function behavior
            // if (year > 2100) {
                // console.log(year, adjustmentFactor, result, Math.log10(result))
            // }
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
    else if (problemName === "Machine Learning") {
        if (penalty === "log(n)") {
            let f = n => Math.log10(n) / 2 - adjustmentFactor - Math.log10(Math.log2(n))
            let result = utils.bisectionMethod(f, 2, 10**100);
            if (result === null) {
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
            let result = utils.bisectionMethod(f, 2, 10**100);
            if (result === null) {
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
            let result = utils.bisectionMethod(f, 2, 10**100);
            if (result === null) {
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
        let result = utils.bisectionMethod(f, 2, 2000); //hardware slowdown of 10 ** (100) would yield an nstar of around 1700, plenty of buffer
        if (result === null) {
            console.log("null returned!!!!")
            return 0
        }
        return Math.log10(result)
    }
    else if (problemName === "Integer Factorization") {
        let f;
        if (penalty === "log(n)") {
            f = n => (64 * n / 9) ** (1 / 3) * (Math.log(n) ** (2 / 3)) * Math.log10(Math.E) - adjustmentFactor - 2 * Math.log10(n) - Math.log10(Math.log(n)) - Math.log10(Math.log2(n))
        }
        else {
            f = n => (64 * n / 9) ** (1 / 3) * (Math.log(n) ** (2 / 3)) * Math.log10(Math.E) - adjustmentFactor - 2 * Math.log10(n) - Math.log10(Math.log(n))
        }
        // let result = utils.bisectionMethod(f, 0, 100000); //100000 is overkill, no realistic slowdown would yield this
        let result = utils.bisectionMethod(f, 2, 1000);
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
        let result = utils.bisectionMethod(f, 2, 60);
        if (result === null) {
            console.log("null returned!!!!")
            return 0
        }
        // if (result >= 99999) return Infinity
        return Math.log10(result)
    }

    console.log("this should never print")

    return 0
}



function calculateCurrentAdvantage(model) {
    
    let problemName = model.problemName;
    let penalty = model.penalty;
    // let quantumRuntime = model.quantumRuntime;
    let quantumRuntime = addPenalty(model.quantumRuntime, model.penalty);
    let classicalRuntime = model.classicalRuntime;
    let hardwareSlowdown = Number(model.hardwareSlowdown);
    let quantumImprovementRate = ((100 - model.quantumImprovementRate) / 100)
    let year = new Date().getFullYear();
    let costFactor = Number(model.costFactor)
    let costImprovementRate = ((100 - model.costImprovementRate) / 100);


    let advantage = getQuantumAdvantage(problemName, penalty, classicalRuntime, quantumRuntime, hardwareSlowdown, quantumImprovementRate, year);
    let costAdvantage = getQuantumAdvantage(problemName, penalty, classicalRuntime, model.quantumRuntime, costFactor, costImprovementRate, year);
    
    // console.log(advantage)
    // range from 0 to double of the advantage with 200 ticks
    let range = []
    let currentAdvantageDataAux = {}

    if (advantage === Infinity) {
        for (let i = 0; i < 100; i += 100 / 100) {
            range.push(i);
        }
        currentAdvantageDataAux = {
            nStar: -1,
            stepStar: -1,
            // replace NaN with Infinity
            quantumSteps: range.map((i) => [i, quantumRuntime(i) + hardwareSlowdown]).map(([x, y]) => [x, y === NaN ? 99999 : y]),
            classicalSteps: range.map((i) => [i, classicalRuntime(i)]).map(([x, y]) => [x, isNaN(y) ? -1 : y])
        }
    }
    else if (advantage === 0) {
        for (let i = 0; i < 100; i += 100 / 100) {
            range.push(i);
        }
        currentAdvantageDataAux = {
            nStar: 0,
            stepStar: classicalRuntime(0),
            // replace NaN with Infinity
            quantumSteps: range.map((i) => [i, quantumRuntime(i) + hardwareSlowdown]).map(([x, y]) => [x, y === NaN ? 99999 : y]),
            classicalSteps: range.map((i) => [i, classicalRuntime(i)]).map(([x, y]) => [x, isNaN(y) ? 0 : y])
        }


    } else {

        for (let i = 0; i < ((advantage + costAdvantage)/2) * 2; i += ((advantage + costAdvantage)/2) / 100) {
            range.push(i);
        }
        currentAdvantageDataAux = {
            nStar: advantage,
            stepStar: classicalRuntime(advantage),
            quantumSteps: range.map((i) => [i, quantumRuntime(i) + hardwareSlowdown]),
            classicalSteps: range.map((i) => [i, classicalRuntime(i)])
        }
    }


    if (costAdvantage === Infinity) {
        for (let i = 0; i < 100; i += 100 / 100) {
            range.push(i);
        }
        currentAdvantageDataAux = {
            ...currentAdvantageDataAux,
            nCostStar: -1,
            stepCostStar: -1,
            quantumCostSteps: range.map((i) => [i, quantumRuntime(i) + costFactor]).map(([x, y]) => [x, y === NaN ? 99999 : y]),
            classicalCostSteps: range.map((i) => [i, classicalRuntime(i)]).map(([x, y]) => [x, isNaN(y) ? -1 : y])
        }
    }
    else if (costAdvantage === 0) {
        for (let i = 0; i < 100; i += 100 / 100) {
            range.push(i);
        }
        currentAdvantageDataAux = {
            ...currentAdvantageDataAux,
            nCostStar: 0,
            stepCostStar: classicalRuntime(0),
            quantumCostSteps: range.map((i) => [i, quantumRuntime(i) + costFactor]).map(([x, y]) => [x, y === NaN ? 99999 : y]),
            classicalCostSteps: range.map((i) => [i, classicalRuntime(i)]).map(([x, y]) => [x, isNaN(y) ? 0 : y])
        }


    } else {

        for (let i = 0; i < ((advantage + costAdvantage)/2) * 2; i += ((advantage + costAdvantage)/2) / 100) {
            range.push(i);
        }
        currentAdvantageDataAux = {
            ...currentAdvantageDataAux,
            nCostStar: costAdvantage,
            stepCostStar: classicalRuntime(costAdvantage),
            quantumCostSteps: range.map((i) => [i, quantumRuntime(i) + costFactor]),
            classicalCostSteps: range.map((i) => [i, classicalRuntime(i)])
        }
    }
    


    currentAdvantageData.value = currentAdvantageDataAux
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

    let costFactor = (Number(model.costFactor))
    let costImprovementRate = ((100 - model.costImprovementRate) / 100);


    function qf(roadmap) {
        return year => getQuantumFeasible(year, roadmap, physicalLogicalQubitsRatio, ratioImprovementRate, qubitToProblemSize)
    }

    function qa(problemName, penalty, classicalRuntime, quantumRuntime, hardwareSlowdown, quantumImprovementRate) {
        return year => getQuantumAdvantage(problemName, penalty, classicalRuntime, quantumRuntime, hardwareSlowdown, quantumImprovementRate, year)
    }
    let quantumFeasible = qf(model.roadmap);
    let quantumAdvantage = qa(problemName, penalty, classicalRuntime, quantumRuntime, hardwareSlowdown, quantumImprovementRate);
    let quantumCostAdvantage = qa(problemName, penalty, classicalRuntime, model.quantumRuntime, costFactor, costImprovementRate);

    let quantumEconomicAdvantageDataAux = {}

    const tStar = utils.bisectionMethod(year => quantumFeasible(year) - quantumAdvantage(year), 2024, 3000);
    const tCostStar = utils.bisectionMethod(year => quantumFeasible(year) - quantumCostAdvantage(year), 2024, 3000);


    // when there is no quantum advantage
    if (quantumAdvantage(2024) >= 99999) {
        let range = []
        
        for (let i = 0; i < (2030 - year) * 2; i += (2030 - year) / 100) {
            range.push(i);
        }
        let quantumFeasibleList = range.map(i => [year + i, quantumFeasible(year + i)])
        quantumEconomicAdvantageDataAux = {
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


        let range = []

        if (tStar != null) {
            for (let i = 0; i < ((tStar + tCostStar)/2 - year) * 2; i += ((tStar + tCostStar)/2 - year) / 100) {
                range.push(i);
            }
            let nStar = quantumFeasible(tStar)

            let quantumFeasibleList = range.map(i => [year + i, quantumFeasible(year + i)])
            let quantumAdvantageList = range.map(i => [year + i, quantumAdvantage(year + i)])

            quantumEconomicAdvantageDataAux = {
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
            console.log("tstar is null")
            for (let i = 0; i < (2030 - year) * 2; i += (2030 - year) / 100) {
                range.push(i);
            }
            let quantumFeasibleList = range.map(i => [year + i, quantumFeasible(year + i)])
            let quantumAdvantageList = range.map(i => [year + i, quantumAdvantage(year + i)])
            quantumEconomicAdvantageDataAux = {
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

    if (quantumCostAdvantage(2024) >= 99999) {
        let range = []
        
        for (let i = 0; i < (2030 - year) * 2; i += (2030 - year) / 100) {
            range.push(i);
        }
        let quantumFeasibleList = range.map(i => [year + i, quantumFeasible(year + i)])
        quantumEconomicAdvantageDataAux = {
            ...quantumEconomicAdvantageDataAux,
            tCostStar: -1,
            nCostStar: -1,
            quantumCostFeasible: quantumFeasibleList,

            quantumCostAdvantage: range.map(i => [year + i, Infinity])
        }
       
        
    } else {


        let range = []

        if (tCostStar != null) {
            for (let i = 0; i < ((tStar + tCostStar)/2 - year) * 2; i += ((tStar + tCostStar)/2 - year) / 100) {
                range.push(i);
            }
            let nCostStar = quantumFeasible(tCostStar)

            let quantumFeasibleList = range.map(i => [year + i, quantumFeasible(year + i)])
            let quantumCostAdvantageList = range.map(i => [year + i, quantumCostAdvantage(year + i)])

            quantumEconomicAdvantageDataAux = {
                ...quantumEconomicAdvantageDataAux,
                tCostStar: tCostStar,
                nCostStar: nCostStar,
                quantumCostFeasible: quantumFeasibleList,

                quantumCostAdvantage: quantumCostAdvantageList
            }
        } else {
            console.log("tCoststar is null")
            for (let i = 0; i < (2030 - year) * 2; i += (2030 - year) / 100) {
                range.push(i);
            }
            let quantumFeasibleList = range.map(i => [year + i, quantumFeasible(year + i)])
            let quantumCostAdvantageList = range.map(i => [year + i, quantumCostAdvantage(year + i)])
            quantumEconomicAdvantageDataAux = {
                ...quantumEconomicAdvantageDataAux,
                tCostStar: 0,
                nCostStar: 0,
                quantumCostFeasible: quantumFeasibleList,

                quantumCostAdvantage: quantumCostAdvantageList
            }
        }
    }


    quantumEconomicAdvantageData.value = quantumEconomicAdvantageDataAux
}


//returns the log_10 of the amount of logical qubits available with the given parameters
function getLogicalQubits(year, roadmap, physicalLogicalQubitsRatio, ratioImprovementRate) {
    const logOfPhysicalQubits = utils.getPhysicalQubits(year, roadmap, props.model.extrapolationType)
    
    //log_10 of the PLQR including the ratio improvement rate
    let adjustedPLQR = Math.log10(physicalLogicalQubitsRatio) + (year - 2024) * Math.log10(ratioImprovementRate);
    if (adjustedPLQR < Math.log10(3)) { //minimum PLQR is 3
        adjustedPLQR = Math.log10(3)
    }

    //logLogicalQubits has the log_10 of the true number of logical qubits
    let logLogicalQubits = logOfPhysicalQubits - adjustedPLQR

    return logLogicalQubits
}


//function returns the log of the problem size solvable, even though there is a "10 ** problemSize"
function getQuantumFeasible(year, roadmap, physicalLogicalQubitsRatio, ratioImprovementRate, qubitToProblemSize) {
    //logLogicalQubits has the log_10 of the true number of logical qubits
    let logLogicalQubits = getLogicalQubits(year, roadmap, physicalLogicalQubitsRatio, ratioImprovementRate)

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
            <!-- <div class="md:flex gap-4 px-8 py-2">

                <MoneyAlgorithmGraph :data="moneyAlgorithmData" />
                <MoneyEconomicGraph :data="moneyEconomicData" />
            </div>
            <div class="md:flex gap-4 px-8 py-2 justify-center">

                <LogicalQubitsGraph :data="logicalQubitsData" />
            </div> -->
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