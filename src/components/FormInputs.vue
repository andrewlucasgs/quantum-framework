<script setup>
import { ref, watch } from 'vue';
import { useInputStore } from '../store/input.js'
import Multiselect from 'vue-multiselect'


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
        // slowdown: 6,
        // quantum_improvement_rate: 2,
        physical_logical_ratio: 1000,
        newest_year: 2023,
        newest_qubits: 4158

    },
    {
        name: "Intel",
        // slowdown: 6,
        // quantum_improvement_rate: 2,
        physical_logical_ratio: 1000,
        newest_year: 2023,
        newest_qubits: 4158
    },
    {
        name: "IQM",
        // slowdown: 6,
        // quantum_improvement_rate: 2,
        physical_logical_ratio: 1000,
        newest_year: 2023,
        newest_qubits: 4158
    },
    {
        name: "Google",
        // slowdown: 6,
        // quantum_improvement_rate: 2,
        physical_logical_ratio: 1000,
        newest_year: 2023,
        newest_qubits: 4158
    },
]);

// const selectedHardware = ref(hardwares.value[0]);

</script>

<style src="vue-multiselect/dist/vue-multiselect.css"></style>
<style lang="css" scoped>
.custom-multiselect>>>.multiselect__tags .multiselect__tag {
    background-color: #002D9D;
}

.custom-multiselect>>>.multiselect__option {
    background-color: white;
    color: #002D9D;
    border-radius: 4px;
    padding: 0.25rem;
    margin: 0.25rem;
    font-size: 1rem;
    line-height: 1.5rem;
    height: 1.5rem;
    box-sizing: border-box;
    outline: none;
    transition: all 0.2s ease-in-out;
}


.custom-multiselect>>>.multiselect__content-wrapper {

    z-index: 999 !important;
}

.custom-multiselect>>>.multiselect__option--highlight {
    background-color: #002D9D;
    color: white;
    border-radius: 4px;
    padding: 0.25rem;
    margin: 0.25rem;
    font-size: 1rem;
    line-height: 1.5rem;
    height: 1.5rem;
    box-sizing: border-box;
    outline: none;
    transition: all 0.2s ease-in-out;
}
</style>

<template>
    <div class="flex gap-8">
        <div class="flex-1">
            <h2 class="text-xl font-bold text-[#002D9D]">1. Select a problem</h2>
            <div>
                <multiselect class="custom-multiselect" track-by="name" label="name" v-model="selectedProblem"
                    :options="problems" :searchable="true" :close-on-select="true" :show-labels="false"
                    placeholder="Pick a value"></multiselect>
            </div>
            <div class="mt-4 flex gap-4">
                <div class="flex flex-col">
                    <label class="font-medium" for="classical">Classical runtime</label>
                    <input class="border-2 border-gray-500 bg-white rounded-md px-2 py-1 " type="text" id="classical"
                        name="classical" v-model="inputStore.classicalRuntime" />
                </div>
                <div class="flex flex-col">
                    <label class="font-medium" for="quantum">Quantum runtime</label>
                    <input class="border-2 border-gray-500 bg-white rounded-md px-2 py-1 " type="text" id="quantum"
                        name="quantum" v-model="inputStore.quantumRuntime" />

                </div>
            </div>
        </div>
        <div class="flex-1">
            <h2 class="text-xl font-bold text-[#002D9D]">2. Select a hardware</h2>
            <div>
                <multiselect class="custom-multiselect" track-by="name" label="name" v-model="selectedHardware"
                    :options="hardwares" :searchable="true" :multiple="true" :close-on-select="true" :show-labels="false"
                    placeholder="Pick a value">
                </multiselect>

            </div>
            <div class="mt-4 flex gap-4">
                <div class="flex-1">
                    <label class="font-medium block" for="harwareSlowdown">Hardware Slowdown <br>10<sup>{{ inputStore.hardwareSlowdown
                    }}</sup></label>
                    <input class="border-2 border-gray-500 bg-white rounded-md px-2 py-1 " type="range" min="0" max="50"
                        id="harwareSlowdown" name="harwareSlowdown" v-model="inputStore.hardwareSlowdown" />
                </div>
                <div class="flex-1">
                    <label class="font-medium block" for="physicalToLogicalRatio">Physical to logical qubits <br>{{ inputStore.physicalToLogicalRatio
                    }} : 1</label>
                    <input class="border-2 border-gray-500 bg-white rounded-md px-2 py-1 " type="range" min="1" max="10000" step="100"
                        id="physicalToLogicalRatio" name="physicalToLogicalRatio" v-model="inputStore.physicalToLogicalRatio" />
                </div>
                <div class="flex-1">
                    <label class="font-medium block" for="harwareSlowdown"># qubits growth ratio <br> x{{ inputStore.numberOfQubitsGrowthRatio }} each year</label>
                    <input class="border-2 border-gray-500 bg-white rounded-md px-2 py-1 " type="range" min="0" max="4" step="0.1"
                        id="harwareSlowdown" name="harwareSlowdown" v-model="inputStore.numberOfQubitsGrowthRatio" />
                </div>
            </div>
        </div>
    </div>
    <!-- <form @submit.prevent class="flex justify-around my-8 gap-8">
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
                <select class="border-2 border-gray-500 bg-white rounded-md px-2 py-1 " name="hardwares" id="hardwares" v-model="inputStore.selectedHardware">
                    <option v-for="hardware in hardwares" :key="hardware.name" :value="hardware">{{ hardware.name }}
                    </option>
                </select>
            </div>
            <div class="flex flex-col">
                <label class="font-medium" for="harwareSlowdown">Hardware Slowdown: 10<sup>{{ inputStore.hardwareSlowdown
                }}</sup></label>
                <input class="border-2 border-gray-500 bg-white rounded-md px-2 py-1 " type="range" min="0" max="50" id="harwareSlowdown" name="harwareSlowdown"
                    v-model="inputStore.hardwareSlowdown" />
            </div>
            <div class="flex flex-col">
                <label class="font-medium" for="improvementRate">Quantum Improvement Rate: {{ inputStore.improvementRate }}%
                </label>
                <input class="border-2 border-gray-500 bg-white rounded-md px-2 py-1 " type="range" min="0" max="99" id="improvementRate" name="improvementRate"
                    v-model="inputStore.improvementRate" />
            </div>


    </div>
</form> -->
</template>