<script setup>
import { re } from 'mathjs';
import { watch, ref, defineAsyncComponent } from 'vue';
import * as utils from "../store/utils"

import * as math from 'mathjs';

const QuantumAdvantageGraph = defineAsyncComponent(() => import('./QuantumAdvantageGraph.vue'));
const QuantumEconomicAdvantageGraph = defineAsyncComponent(() => import('./QuantumEconomicAdvantageGraph.vue'));
const QuantumCharacteristicsGraph = defineAsyncComponent(() => import('./QuantumCharacteristicsGraph.vue'));
const Form = defineAsyncComponent(() => import('./Form.vue'));

const props = defineProps({
    model: Object,
    modelIndex: Number
});

import {
    Disclosure,
    DisclosureButton,
    DisclosurePanel,
} from '@headlessui/vue'
import { get } from '@vueuse/core';

// returns log_10 of the problem size where qa is reached
function getQuantumAdvantage(logClassicalFunction, logQuantumFunction, logPenaltyFunction, hardwareSlowdown, quantumImprovementRate, year = 2024) {
    let adjustmentFactor = Number(hardwareSlowdown) + (year - 2024) * Math.log10(quantumImprovementRate);

    if (adjustmentFactor == null || isNaN(adjustmentFactor)) {
        console.log("Adjustment factor is null or NaN");
        console.log(`adjustment factor: ${adjustmentFactor}, hardwareSlowdown: ${hardwareSlowdown}, quantumImprovementRate: ${quantumImprovementRate}, year: ${year}`);
        return 0;
    }

    adjustmentFactor = math.max(adjustmentFactor, 0);

    function evaluate(n) {
        let value = logClassicalFunction(n) - logQuantumFunction(n) - logPenaltyFunction(n) - adjustmentFactor;
        return value;
    }

    let upperBound = 10**100;
    let lowerBound = 2;
    let lastValue = evaluate(lowerBound);
    while (lowerBound < 50 && lastValue >= 0) {
        lowerBound += 0.25;
        let nextValue = evaluate(lowerBound);

        lastValue = nextValue;
    }
    let result = utils.bisectionMethod(evaluate, lowerBound, upperBound, "QA bisection");

    if (result === null) {
        console.log(`null returned!!!! year was ${year} and adjustmentFactor was ${adjustmentFactor}`);
        console.log("lowerBound:", lowerBound, "upperBound:", upperBound);
        console.log("f(lowerBound):", evaluate(lowerBound), "f(upperBound):", evaluate(upperBound));
        return null;
    }
    else if (result == 0) {
        return 0;
    }
    else if (result == Infinity) {
        return Infinity;
    }
    

    // if (lowerBound > 2) {
    //     console.log(`Final lowerBound guess was ${lowerBound}`);
    // }

    return Math.log10(result);

}
// converts expression with q (qubits) to expression with n (problem size) by using the inverse of 
// the function specified by qubitToProblemSize parameter
function getQuantumWork(model) {
    function replaceVariable(formula, oldVar, newVar) {
        // Match `q` only when it's not in a larger word (like `sqrt`)
        let regex = new RegExp(`(?<![a-zA-Z])${oldVar}(?![a-zA-Z])`, 'g');
        return formula.replace(regex, newVar);
    }
    
    let quantumWork = model.quantumWork;
    // console.log("quantum work was ", quantumWork);
    if (model.qubitToProblemSize === "2^{q}") {
        quantumWork = replaceVariable(quantumWork, "q", "(log(n, 2))");
    }
    else if (model.qubitToProblemSize === "log({q})") {
        quantumWork = replaceVariable(quantumWork, "q", "(2^n)");
    }
    else if (model.qubitToProblemSize === "{q}") {
        quantumWork = replaceVariable(quantumWork, "q", "n");
    }
    else {
        console.log("this should never print");
    }
    // console.log("quantum work is ", quantumWork);
    return quantumWork;
}


function calculateCurrentAdvantage(model) {

    // let problemName = model.problemName;
    let hardwareSlowdown = Number(model.hardwareSlowdown);
    let quantumImprovementRate = ((100 + Number(model.quantumImprovementRate)) / 100)
    let year = new Date().getFullYear();
    let costFactor = Number(model.costFactor)
    let costImprovementRate = ((100 + Number(model.costImprovementRate)) / 100);

    let classicalRuntimeInput = model.classicalRuntimeInput;
    let quantumRuntimeInput = model.quantumRuntimeInput;
    let penaltyInput = model.penaltyInput;
    
    //lcf = logged classical function
    let lcf = utils.createLoggedFunction(classicalRuntimeInput);
    let lqf = utils.createLoggedFunction(quantumRuntimeInput);
    let lpf = utils.createLoggedFunction(penaltyInput);
    
    //ccf = converted classical function
    let ccf = utils.createConvertedFunction(classicalRuntimeInput);
    let cqf = utils.createConvertedFunction(quantumRuntimeInput);
    let cpf = utils.createConvertedFunction(penaltyInput);

    //lcfc = logged classical function cost
    let lcfc = utils.createLoggedFunction(model.classicalWork);
    let quantumWork = getQuantumWork(model);
    let lqfc = utils.createLoggedFunction(quantumWork);
    
    //ccfc = converted classical function cost
    let ccfc = utils.createConvertedFunction(model.classicalWork);
    let cqfc = utils.createConvertedFunction(quantumWork);

    let advantage = getQuantumAdvantage(lcf, lqf, lpf, hardwareSlowdown, quantumImprovementRate, year);
    let costAdvantage = getQuantumAdvantage(lcfc, lqfc, lpf, costFactor, costImprovementRate, year);

    // let realAdvantage = Math.pow(10, advantage);
    // let value = lcf(realAdvantage) - lqf(realAdvantage) - lpf(realAdvantage) - hardwareSlowdown;
    // console.log("evaluating")
    // console.log(realAdvantage, lcf(realAdvantage), lqf(realAdvantage), lpf(realAdvantage), hardwareSlowdown, value)
    // range from 0 to double of the advantage with 200 ticks
    let range = []
    let currentAdvantageDataAux = {}
    let xMax = 0;
    let defaultMax = 100;

    if (advantage === null || costAdvantage === null) {
        // show error message to user
        console.log("Error: advantage or costAdvantage is null");
        return;
    }

    if (advantage === Infinity && costAdvantage === Infinity) {
        console.log("both advantages are infinity");
        xMax = defaultMax;
        currentAdvantageDataAux = {
            nStar: -1,
            stepStar: -1,
            nCostStar: -1,
            stepCostStar: -1,
        }
    }
    else if (advantage === Infinity) {
        console.log("speed advantage is infinity");
        if (costAdvantage == 0) {
            console.log("and cost advantage is zero");
            xMax = defaultMax;
        }
        else {
            xMax = costAdvantage * 2;
        }
        currentAdvantageDataAux = {
            nStar: -1,
            stepStar: -1,
            nCostStar: costAdvantage,
            stepCostStar: ccfc(costAdvantage),
        }
    }
    else if (costAdvantage == Infinity) {
        console.log("cost advantage is infinity");
        if (advantage == 0) {
            console.log("and speed advantage is zero");
            xMax = defaultMax;
        }
        else {
            xMax = advantage * 2;
        }
        currentAdvantageDataAux = {
            nStar: advantage,
            stepStar: ccf(advantage),
            nCostStar: -1,
            stepCostStar: -1,
        }
    }
    else {
        if (advantage == 0 && costAdvantage == 0) {
            console.log("both advantages are zero");
            xMax = defaultMax;
        }
        else if (advantage == 0) {
            console.log("only speed advantage is zero");
            xMax = costAdvantage * 2;
        }
        else if (costAdvantage == 0) {
            console.log("only cost advantage is zero");
            xMax = advantage * 2;
        }
        else {
            xMax = advantage + costAdvantage;
        }

        currentAdvantageDataAux = {
            nStar: advantage,
            stepStar: ccf(advantage),
            nCostStar: costAdvantage,
            stepCostStar: ccfc(costAdvantage),
        }
    }

    for (let i = 0; i < xMax; i += xMax / 200) {
        range.push(i);
    }

    currentAdvantageDataAux = {
        ...currentAdvantageDataAux,
        quantumSteps: range.map((i) => [i, cqf(i) + cpf(i) + hardwareSlowdown]).map(([x, y]) => [x, y === NaN ? 99999 : y]),
        classicalSteps: range.map((i) => [i, ccf(i)]).map(([x, y]) => [x, isNaN(y) ? -1 : y]),
        quantumCostSteps: range.map((i) => [i, cqfc(i) + cpf(i) + costFactor]).map(([x, y]) => [x, y === NaN ? 99999 : y]),
        classicalCostSteps: range.map((i) => [i, ccfc(i)]).map(([x, y]) => [x, isNaN(y) ? -1 : y])
    }


    console.log("printing advantages");
    console.log(advantage, costAdvantage);

    currentAdvantageData.value =  {...currentAdvantageDataAux,
        problemName: model.problemName,
    }
}


function calculateQuantumEconomicAdvantage(model) {
    // let problemName = model.problemName;
    let hardwareSlowdown = model.hardwareSlowdown;
    let physicalLogicalQubitsRatio = model.physicalLogicalQubitsRatio;
    let ratioImprovementRate = ((100 + Number(model.ratioImprovementRate)) / 100);
    let quantumImprovementRate = ((100 + Number(model.quantumImprovementRate)) / 100);
    let qubitToProblemSize = model.qubitToProblemSize;
    let roadmapUnit = model.roadmapUnit;
    let currentYear = new Date().getFullYear();

    let classicalRuntimeInput = model.classicalRuntimeInput;
    let quantumRuntimeInput = model.quantumRuntimeInput;
    let penaltyInput = model.penaltyInput;

    //lcf = logged classical function
    let lcf = utils.createLoggedFunction(classicalRuntimeInput);
    let lqf = utils.createLoggedFunction(quantumRuntimeInput);
    let lpf = utils.createLoggedFunction(penaltyInput);
    
    //lcfc = logged classical function cost
    let lcfc = utils.createLoggedFunction(model.classicalWork);
    let lqfc = utils.createLoggedFunction(getQuantumWork(model));
    

    let costFactor = (Number(model.costFactor))
    let costImprovementRate = ((100 + Number(model.costImprovementRate)) / 100);

    function qf(roadmap) {
        return year => getQuantumFeasible(year, roadmap, physicalLogicalQubitsRatio, ratioImprovementRate, qubitToProblemSize, roadmapUnit)
    }

    function qa(logClassicalFunction, logQuantumFunction, logPenaltyFunction, hardwareSlowdown, quantumImprovementRate) {
        return year => getQuantumAdvantage(logClassicalFunction, logQuantumFunction, logPenaltyFunction, hardwareSlowdown, quantumImprovementRate, year)
    }


    let quantumFeasible = qf(model.roadmap);
    
    let quantumAdvantage = qa(lcf, lqf, lpf, hardwareSlowdown, quantumImprovementRate);
    let quantumCostAdvantage = qa(lcfc, lqfc, lpf, costFactor, costImprovementRate);

    let quantumEconomicAdvantageDataAux = {}

    const tStar = utils.bisectionMethod(year => quantumFeasible(year) - quantumAdvantage(year), 2024, 3000, "tStar in QEA");
    const tCostStar = utils.bisectionMethod(year => quantumFeasible(year) - quantumCostAdvantage(year), 2024, 3000, "tCostStar in QEA");

    let yearRadius = 0; //({last year on the QEA graph} - currentYear) / 2; used to populate ranges
    let defaultRadius = 5;
    if (tStar === null || tCostStar === null) {
        // show error message to user
        console.log("Error: tStar or tCostStar is null");
        return;
    }

    if (tStar === Infinity && tCostStar === Infinity) {
        console.log("QEA never happens (neither speed nor cost)");
        yearRadius = defaultRadius;
        quantumEconomicAdvantageDataAux = {
            tStar: Infinity,
            nStar: Infinity,
            tCostStar: Infinity,
            nCostStar: Infinity,
        }
    }
    else if (tStar === Infinity) {
        console.log("speed QEA never happens");
        if (tCostStar == 0) {
            console.log("and already QEA for cost");
            yearRadius = defaultRadius;
        }
        else {
            yearRadius = tCostStar - currentYear;
        }
        quantumEconomicAdvantageDataAux = {
            tStar: Infinity,
            nStar: Infinity,
            tCostStar: tCostStar,
            nCostStar: quantumFeasible(tCostStar),
        }
    }
    else if (tCostStar == Infinity) {
        console.log("cost QEA never happens");
        if (tStar == 0) {
            console.log("and already QEA for speed");
            yearRadius = defaultRadius;
        }
        else {
            yearRadius = tStar - currentYear;
        }
        quantumEconomicAdvantageDataAux = {
            tStar: tStar,
            nStar: quantumFeasible(tStar),
            tCostStar: Infinity,
            nCostStar: Infinity,
        }
    }
    else {
        if (tStar == 0 && tCostStar == 0) {
            console.log("already QEA for both speed and cost");
            yearRadius = defaultRadius;
        }
        else if (tStar == 0) {
            console.log("already QEA for speed");
            yearRadius = tCostStar - currentYear;
        }
        else if (tCostStar == 0) {
            console.log("already QEA for cost");
            yearRadius = tStar - currentYear;
        }
        else {
            yearRadius = (tStar + tCostStar) / 2 - currentYear;
        }

        quantumEconomicAdvantageDataAux = {
            tStar: tStar,
            nStar: quantumFeasible(tStar),
            tCostStar: tCostStar,
            nCostStar: quantumFeasible(tCostStar),
        }
    }

    let range = [];
    for (let i = 0; i < yearRadius * 2; i += yearRadius / 100) {
        range.push(i);
    }

    let quantumFeasibleList = range.map(i => [currentYear + i, quantumFeasible(currentYear + i)])
    let quantumAdvantageList = range.map(i => [currentYear + i, quantumAdvantage(currentYear + i)])
    let quantumCostAdvantageList = range.map(i => [currentYear + i, quantumCostAdvantage(currentYear + i)])

    quantumEconomicAdvantageDataAux = {
        ...quantumEconomicAdvantageDataAux,
        quantumFeasible: quantumFeasibleList,
        quantumAdvantage: quantumAdvantageList,
        quantumCostAdvantage: quantumCostAdvantageList,
        // quantumCostFeasible: quantumFeasibleList,
    }

    console.log("tStar is ", tStar, "tCostStar is ", tCostStar);

    // // when there is no quantum advantage
    // if (quantumAdvantage(currentYear) >= 99999) {
    //     console.log("probably never prints: problem size for QA is too large (> 10 ** 99999)")

    //     let range = []

    //     for (let i = 0; i < (2030 - currentYear) * 2; i += (2030 - currentYear) / 100) {
    //         range.push(i);
    //     }
    //     let quantumFeasibleList = range.map(i => [currentYear + i, quantumFeasible(currentYear + i)])
    //     quantumEconomicAdvantageDataAux = {
    //         tStar: -1,
    //         nStar: -1,
    //         quantumFeasible: quantumFeasibleList,
    //         quantumAdvantage: range.map(i => [currentYear + i, Infinity])
    //     }
    // } 
    // else {
    //     let range = []

    //     if (tStar != null) {
    //         for (let i = 0; i < ((tStar + tCostStar) / 2 - currentYear) * 2; i += ((tStar + tCostStar) / 2 - currentYear) / 100) {
    //             range.push(i);
    //         }
    //         let nStar = quantumFeasible(tStar)

    //         let quantumFeasibleList = range.map(i => [currentYear + i, quantumFeasible(currentYear + i)])
    //         let quantumAdvantageList = range.map(i => [currentYear + i, quantumAdvantage(currentYear + i)])

    //         quantumEconomicAdvantageDataAux = {
    //             tStar: tStar,
    //             nStar: nStar,
    //             quantumFeasible: quantumFeasibleList,
    //             quantumAdvantage: quantumAdvantageList
    //         }
            
    //     } else {
    //         console.log("tstar is null")
    //         for (let i = 0; i < (2030 - currentYear) * 2; i += (2030 - currentYear) / 100) {
    //             range.push(i);
    //         }
    //         let quantumFeasibleList = range.map(i => [currentYear + i, quantumFeasible(currentYear + i)])
    //         let quantumAdvantageList = range.map(i => [currentYear + i, quantumAdvantage(currentYear + i)])
    //         quantumEconomicAdvantageDataAux = {
    //             tStar: 0,
    //             nStar: 0,
    //             quantumFeasible: quantumFeasibleList,
    //             quantumAdvantage: quantumAdvantageList
    //         }
           
    //     }
    // }

    // if (quantumCostAdvantage(2024) >= 99999) {
    //     let range = []

    //     for (let i = 0; i < (2030 - currentYear) * 2; i += (2030 - currentYear) / 100) {
    //         range.push(i);
    //     }
    //     let quantumFeasibleList = range.map(i => [currentYear + i, quantumFeasible(currentYear + i)])
    //     quantumEconomicAdvantageDataAux = {
    //         ...quantumEconomicAdvantageDataAux,
    //         tCostStar: -1,
    //         nCostStar: -1,
    //         quantumCostFeasible: quantumFeasibleList,

    //         quantumCostAdvantage: range.map(i => [currentYear + i, Infinity])
    //     }
    // } 
    // else {
    //     let range = []

    //     if (tCostStar != null) {
    //         for (let i = 0; i < ((tStar + tCostStar) / 2 - currentYear) * 2; i += ((tStar + tCostStar) / 2 - currentYear) / 100) {
    //             range.push(i);
    //         }
    //         let nCostStar = quantumFeasible(tCostStar)

    //         let quantumFeasibleList = range.map(i => [currentYear + i, quantumFeasible(currentYear + i)])
    //         let quantumCostAdvantageList = range.map(i => [currentYear + i, quantumCostAdvantage(currentYear + i)])

    //         quantumEconomicAdvantageDataAux = {
    //             ...quantumEconomicAdvantageDataAux,
    //             tCostStar: tCostStar,
    //             nCostStar: nCostStar,
    //             quantumCostFeasible: quantumFeasibleList,

    //             quantumCostAdvantage: quantumCostAdvantageList
    //         }
    //     } else {
    //         console.log("tCoststar is null")
    //         for (let i = 0; i < (2030 - currentYear) * 2; i += (2030 - currentYear) / 100) {
    //             range.push(i);
    //         }
    //         let quantumFeasibleList = range.map(i => [currentYear + i, quantumFeasible(currentYear + i)])
    //         let quantumCostAdvantageList = range.map(i => [currentYear + i, quantumCostAdvantage(currentYear + i)])
    //         quantumEconomicAdvantageDataAux = {
    //             ...quantumEconomicAdvantageDataAux,
    //             tCostStar: 0,
    //             nCostStar: 0,
    //             quantumCostFeasible: quantumFeasibleList,

    //             quantumCostAdvantage: quantumCostAdvantageList
    //         }
    //     }
    // }


    quantumEconomicAdvantageData.value = {...quantumEconomicAdvantageDataAux,
        problemName: model.problemName,
    }

    roadmapCharacteristicsData.value = {
        roadmapUnit: roadmapUnit,
        tCostStar: quantumEconomicAdvantageDataAux.tCostStar,
        tStar: quantumEconomicAdvantageDataAux.tStar,
        roadmap: model.roadmap,
        extrapolationType: model.extrapolationType,
        physicalLogicalQubitsRatio: physicalLogicalQubitsRatio,
        ratioImprovementRate: ratioImprovementRate,
        qubitToProblemSize: qubitToProblemSize,
        quantumFeasible: quantumEconomicAdvantageDataAux.quantumFeasible,
    }
}


//returns the log_10 of the amount of logical qubits available with the given parameters
function getLogicalQubits(year, roadmap, physicalLogicalQubitsRatio, ratioImprovementRate , roadmapUnit) {
    const logOfPhysicalQubits = utils.getPhysicalQubits(year, roadmap, props.model.extrapolationType)
    if (roadmapUnit === "logical") {
        return logOfPhysicalQubits
    }
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
function getQuantumFeasible(year, roadmap, physicalLogicalQubitsRatio, ratioImprovementRate, qubitToProblemSize, roadmapUnit) {
    //logLogicalQubits has the log_10 of the true number of logical qubits
    let logLogicalQubits = getLogicalQubits(year, roadmap, physicalLogicalQubitsRatio, ratioImprovementRate , roadmapUnit)

    if (qubitToProblemSize == "2^{q}") {
        // let problemSize = (logOfPhysicalQubits + Math.log10(Math.log10(2)) - Math.log10(physicalLogicalQubitsRatio))
        let problemSize = (logLogicalQubits + Math.log10(Math.log10(2)))
        return 10 ** problemSize;
    }
    else if (qubitToProblemSize == "2^(2^{q})") {
        // let problemSize = Math.pow(2, Math.pow(10, logOfPhysicalQubits) / physicalLogicalQubitsRatio) * Math.log10(2)
        let problemSize = Math.pow(2, Math.pow(10, logLogicalQubits)) * Math.log10(2)
        return problemSize;
    }
    else if (qubitToProblemSize == "{q}") {
        // let problemSize = logOfPhysicalQubits -  Math.log10(physicalLogicalQubitsRatio)
        let problemSize = logLogicalQubits
        return problemSize;
    }
    else if (qubitToProblemSize == "log({q})") {
        // let problemSize = Math.log10(logOfPhysicalQubits - Math.log10(physicalLogicalQubitsRatio)) - Math.log10(Math.log10(2))
        let problemSize = Math.log10(logLogicalQubits) - Math.log10(Math.log10(2))

        //true if logLogicalQubits is negative
        //(Amount of physical qubits is less than the ratio to achieve a single logical qubit)
        if (isNaN(problemSize)) {
            return 0;
        }

        return problemSize;
    }
    else {
        console.log("this should never print");
        return 0;
    }

}

const currentAdvantageData = ref({});
const quantumEconomicAdvantageData = ref({});
const roadmapCharacteristicsData = ref({});



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
        <Disclosure as="div" class="px-8 py-2" v-slot="{ open }" defaultOpen>
            <DisclosureButton class="py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 text-left px-4 rounded-md flex justify-between w-full border border-gray-200">
                Quantum Economic Advantage
                <span>{{  open ? '-' : '+' }}</span>
            </DisclosureButton>
            <DisclosurePanel class="text-gray-500">
                <div class="lg:flex gap-4 py-2 min-h-[400px]">

                    <QuantumAdvantageGraph :data="currentAdvantageData" />
                    <QuantumEconomicAdvantageGraph :data="quantumEconomicAdvantageData" />
                </div>
            </DisclosurePanel>
        </Disclosure>
        <Disclosure as="div" class="px-8 py-2" v-slot="{ open }" defaultOpen>
            <DisclosureButton class="py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 text-left px-4 rounded-md flex justify-between w-full border border-gray-200">
                Quantum Timelines
                <span>{{  open ? '-' : '+' }}</span>
            </DisclosureButton>
            <DisclosurePanel class="text-gray-500">
                <QuantumCharacteristicsGraph :data="roadmapCharacteristicsData" />

                        </DisclosurePanel>
        </Disclosure>
       

    </div>
</template>