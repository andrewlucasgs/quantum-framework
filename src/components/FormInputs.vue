<script setup>
import { ref, watch } from 'vue';
import { useInputStore } from '../store/input.js'
import Multiselect from 'vue-multiselect'
import HardwareSlowdownAdvanced from './HardwareSlowdownAdvanced.vue';


const inputStore = useInputStore();


const mostCommonRuntimes = [
    "1",
    "n",
    "log(n)",
    "sqrt(n)",
    "n*log(n)",
    "n^2",
    "n^(2.373)",
    "n^3",
    "2^n",
    "exp(n^(1/3) * (log(n))^(1/3))",
    "exp(n^(1/3) * (log(n))^(2/3))",
]


const problems = ref([
    {
        name: "Database Search",
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
        quantumRuntime: "n^(2.373)",
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
        newest_year: 2025,
        newest_qubits: 4158

    },
    {
        name: "Intel",
        // slowdown: 6,
        // quantum_improvement_rate: 2,
        physical_logical_ratio: 1000,
        newest_year: 2023,
        newest_qubits: 49
    },
    {
        name: "IQM",
        // slowdown: 6,
        // quantum_improvement_rate: 2,
        physical_logical_ratio: 1000,
        newest_year: 2025,
        newest_qubits: 150
    },
    // {
    //     name: "Google",
    //     // slowdown: 6,
    //     // quantum_improvement_rate: 2,
    //     physical_logical_ratio: 1000,
    //     newest_year: 2023,
    //     newest_qubits: 4158
    // },
]);

// const selectedHardware = ref(hardwares.value[0]);

</script>



<template>
    <div class="flex gap-8">
        <div class="flex-1">
            <h2 class="text-xl font-bold text-[#002D9D]">1. Select a problem</h2>
            <div>
                <label class="font-medium">Problem family</label>

                <multiselect class="custom-multiselect" track-by="name" label="name" v-model="selectedProblem"
                    :options="problems" :searchable="true" :close-on-select="true" :show-labels="false"
                    placeholder="Pick a value"></multiselect>
            </div>
            <div class="mt-4 gap-4">
                <div class="flex items-center gap-4 flex-1">
                    <label class="font-medium" for="classical">Classical runtime: </label>
                    <div class="flex items-center text-2xl font-medium text-[#002D9D]">

                        O(
                        <multiselect class="custom-multiselect" v-model="inputStore.classicalRuntime"
                            :options="mostCommonRuntimes" :searchable="true" :close-on-select="true" :show-labels="false"
                            placeholder="Pick a value"></multiselect>
                        )
                    </div>
                </div>
                <div class="flex items-center gap-4 flex-1">
                    <label class="font-medium" for="quantum">Quantum runtime: </label>
                    <div class="flex items-center text-2xl font-medium text-[#002D9D]">

                        O(
                        <multiselect class="custom-multiselect" v-model="inputStore.quantumRuntime"
                            :options="mostCommonRuntimes" :searchable="true" :close-on-select="true" :show-labels="false"
                            placeholder="Pick a value"></multiselect>)
                    </div>

                </div>
            </div>
        </div>
        <div class="flex-1">
            <h2 class="text-xl font-bold text-[#002D9D]">2. Select a hardware</h2>
            <div>
                <label class="font-medium">Hadware Provider</label>

                <multiselect class="custom-multiselect" track-by="name" label="name" v-model="inputStore.selectedHardware"
                    :options="hardwares" :searchable="true" :multiple="false" :close-on-select="true" :show-labels="false"
                    placeholder="Pick a value">
                </multiselect>

            </div>
            <div class="mt-4 fex gap-4">
                <div class="flex gap-4">
                    <label class="text-center font-medium block" for="harwareSlowdown">Hardware Slowdown: 10<sup>{{
                        inputStore.hardwareSlowdown
                    }}</sup></label>
                    <input class="flex-1 border-2 border-gray-500 bg-white rounded-md px-2 py-1 accent-[#002D9D]" type="range" min="0"
                        max="50" id="harwareSlowdown" name="harwareSlowdown" v-model="inputStore.hardwareSlowdown" />
                        <HardwareSlowdownAdvanced />
                </div>
                <div class="flex gap-4">
                    <label class="text-center font-medium block" for="improvementRate">Quantum Improvement Rate: {{
                        inputStore.improvementRate
                    }}%</label>
                    <input class="flex-1 border-2 border-gray-500 bg-white rounded-md px-2 py-1 accent-[#002D9D]" type="range" min="0"
                        max="99" step="1" id="improvementRate" name="improvementRate"
                        v-model="inputStore.improvementRate" />
                </div>
            </div>
        </div>
    </div>
</template>

<style src="vue-multiselect/dist/vue-multiselect.css"></style>
<style lang="css" scoped>
.custom-multiselect :deep(.multiselect__tags) .multiselect__tag {
    background-color: #002D9D;
}

.custom-multiselect :deep(.multiselect__option) {
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


.custom-multiselect :deep(.multiselect__content)-wrapper {

    z-index: 999 !important;
}

.custom-multiselect :deep(.multiselect__option)--highlight {
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