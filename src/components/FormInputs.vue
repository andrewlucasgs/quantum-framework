<script setup>
import { ref, watch } from 'vue';
import { useInputStore } from '../store/input.js'

const inputStore = useInputStore();



const problems = ref([
    {
        name: "Search",
        classicalRuntime: "n",
        quantumRuntime: "sqrt(n)",
    },
    {
        name: "Sorting",
        classicalRuntime: "n*log(n)",
        quantumRuntime: "n",
    },
    {
        name: "Integer Factorization",
        classicalRuntime: "exp(n^(1/3) * (log(n))^(2/3))",
        quantumRuntime: "exp(n^(1/3) * (log(n))^(1/3))",
    },
    {
        name: "Linear Algebra",
        classicalRuntime: "n^3",
        quantumRuntime: "n^2.373",
    },
    {
        name: "Machine Learning",
        classicalRuntime: "n^2",
        quantumRuntime: "n",
    },
]);

const selectedProblem = ref(problems.value[0]);

watch(selectedProblem, () => {
    inputStore.classicalRuntime = selectedProblem.value.classicalRuntime;
    inputStore.quantumRuntime = selectedProblem.value.quantumRuntime;
})

const hardwares = ref([
    {
        name: "IBM",
        slowdown: 0,
    },
    {
        name: "Intel",
        slowdown: 10,
    },
    {
        name: "IQM",
        slowdown: 100,
    },
    {
        name: "Google",
        slowdown: 1000,
    },
]);

const selectedHardware = ref(hardwares.value[0]);

</script>

<template>
    <form @submit.prevent class="flex justify-around my-8 gap-8 px-16">
        <div class="flex flex-col gap-2 flex-1">
            <div class="flex flex-col">
                <label class="font-medium" for="problems">Problem</label>
                <select class="border-2 border-gray-500 bg-white rounded-md px-2 py-1 " name="problems" id="problems"
                    v-model="selectedProblem">
                    <option v-for="problem in problems" :key="problem.name" :value="problem">{{ problem.name }}</option>
                </select>
            </div>
            <div class="flex flex-col">
                <label class="font-medium" for="classical">Classical</label>
                <input class="border-2 border-gray-500 bg-white rounded-md px-2 py-1 " type="text" id="classical"
                    name="classical" v-model="inputStore.classicalRuntime" />
            </div>
            <div class="flex flex-col">
                <label class="font-medium" for="quantum">Quantum</label>
                <input class="border-2 border-gray-500 bg-white rounded-md px-2 py-1 " type="text" id="quantum"
                    name="quantum" v-model="inputStore.quantumRuntime" />
            </div>

        </div>
        <div class="flex flex-col gap-2 flex-1">
            <div class="flex flex-col">
                <label class="font-medium" for="hardwares">Hardware</label>
                <select class="border-2 border-gray-500 bg-white rounded-md px-2 py-1 " name="hardwares" id="hardwares" v-model="selectedHardware">
                    <option v-for="hardware in hardwares" :key="hardware.name" :value="hardware">{{ hardware.name }}
                    </option>
                </select>
            </div>
            <div class="flex flex-col">
                <label class="font-medium" for="harwareSlowdown">Hardware Slowdown 10<sup>{{ inputStore.hardwareSlowdown
                }}</sup></label>
                <input class="border-2 border-gray-500 bg-white rounded-md px-2 py-1 " type="range" min="0" max="50" id="harwareSlowdown" name="harwareSlowdown"
                    v-model="inputStore.hardwareSlowdown" />
            </div>


    </div>
</form></template>