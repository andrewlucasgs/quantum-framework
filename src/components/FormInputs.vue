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

const hardwares = ref([
    {
        name: "IBM",
        hardwareSlowdown: 6,
        quantum_improvement_rate: 50,
        physical_logical_ratio: 1000,
        growth_factor: 2,
        newest_year: 2025,
        newest_qubits: 4158

    },
    {
        name: "Intel",
        hardwareSlowdown: 5,
        quantum_improvement_rate: 40,
        physical_logical_ratio: 1200,
        growth_factor: 1.8,
        newest_year: 2023,
        newest_qubits: 49
    },
    {
        name: "IQM",
        hardwareSlowdown: 7,
        quantum_improvement_rate: 60,
        physical_logical_ratio: 800,
        growth_factor: 2.2,
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

const selectedHardware = ref(hardwares.value[0]);

watch(selectedProblem, () => {
    inputStore.classicalRuntime = selectedProblem.value.classicalRuntime;
    inputStore.quantumRuntime = selectedProblem.value.quantumRuntime;
})

watch(selectedHardware, () => {
    hardwareSlowdown.value = selectedHardware.value.hardwareSlowdown;
    quantum_improvement_rate.value = selectedHardware.value.quantum_improvement_rate;
    physical_logical_ratio.value = selectedHardware.value.physical_logical_ratio;
    growth_factor.value = selectedHardware.value.growth_factor;
})

const hardwareSlowdown = ref(selectedHardware.value.hardwareSlowdown);
const quantum_improvement_rate = ref(selectedHardware.value.quantum_improvement_rate);
const physical_logical_ratio = ref(selectedHardware.value.physical_logical_ratio);
const growth_factor = ref(selectedHardware.value.growth_factor)

function updateSlowdown(newSlowdown) {
    hardwareSlowdown.value = newSlowdown;
}

function createHardware() {
    // console.log("in create hardware")
    let hardwareString = `${selectedHardware.value.name}_${hardwareSlowdown.value}_${quantum_improvement_rate.value}_${physical_logical_ratio.value}_${growth_factor.value}`
    if (inputStore.hardwareSet.has(hardwareString)) {
        console.log("duplicate hardware entry flagged")
        return
    }

    inputStore.createdHardwares[inputStore.totalCreated] =
    {
        hardwareString: hardwareString,
        name: selectedHardware.value.name,
        hardwareSlowdown: hardwareSlowdown.value,
        quantum_improvement_rate: quantum_improvement_rate.value,
        physical_logical_ratio: physical_logical_ratio.value,
        growth_factor: growth_factor.value,
        newest_qubits: selectedHardware.value.newest_qubits,
        newest_year: selectedHardware.value.newest_year
    }
    inputStore.hardwareSet.add(hardwareString)
    inputStore.totalCreated += 1 //DOES THIS ACTUALLY CHANGE INPUT STORE

    // console.log(inputStore.createdHardwares)
    // console.log(inputStore.hardwareSet)
    // console.log(inputStore.totalCreated)

}
</script>



<template>
    <div class="flex flex-col gap-8">
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
                <label class="font-medium">Hardware Provider</label>

                <multiselect class="custom-multiselect" track-by="name" label="name" v-model="selectedHardware"
                    :options="hardwares" :searchable="true" :multiple="false" :close-on-select="true" :show-labels="false"
                    placeholder="Pick a value">
                </multiselect>

            </div>
            <div class="mt-4 fex gap-4">


                <div class="flex flex-col">

                    <div class="flex gap-2">

                        <label class="font-medium text-lg" for="hardwareSlowdown">Hardware Slowdown>
                        </label>
                        <HardwareSlowdownAdvanced @updateSlowdown="updateSlowdown" v-slot="{ openModal }">
                            <button
                                class="rounded-md bg-gray-500 text-xs p-1 px-2  text-white hover:bg-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75"
                                @click="openModal">Advanced options</button>

                        </HardwareSlowdownAdvanced>
                    </div>
                    <p class="text-xs text-gray-600">The speed difference between classical & quantum computers.</p>
                    <div class="flex items-center justify-between w-full gap-2">
                        <input class="flex-1 accent-[#002D9D]" type="range" id="hardwareSlowdown" v-model="hardwareSlowdown"
                            min="0" max="12" step="0.5" />

                        <div class="   w-1/5">
                            <HardwareSlowdownAdvanced @updateSlowdown="updateSlowdown" v-slot="{ openModal }">
                            <button
                                class="bg-gray-100 p-2  rounded-lg text-center w-full hover:bg-gray-200"
                                @click="openModal">10<sup>{{ hardwareSlowdown }}</sup></button>

                        </HardwareSlowdownAdvanced>
                            
                        </div>
                    </div>
                <!-- <div class="flex gap-4">
                    <label class="text-center font-medium block" for="harwareSlowdown">Hardware Slowdown: 10<sup>{{ hardwareSlowdown }}</sup></label>
                    <input class="bg-gray-100 p-2 rounded-lg text-center w-1/5" type="number" id="hardwareSlowdown" v-model="hardwareSlowdown"/>
                    <input class="flex-1 border-gray-500 bg-white rounded-md py-1 accent-[#002D9D]" type="range" min="0"
                        max="12" id="harwareSlowdown" name="harwareSlowdown" v-model="hardwareSlowdown" />
                    <HardwareSlowdownAdvanced @updateSlowdown="updateSlowdown"/>
                </div> -->


                <div class="flex flex-col">
                    <label class="font-medium text-lg" for="quantum_improvement_rate">Quantum Improvement Rate (%)</label>
                    <p class="text-xs text-gray-600">The ratio of improvement over time between quantum computing and classical computing.</p>
                    <div class="flex items-center justify-between w-full gap-2">
                        <input class="flex-1 accent-[#002D9D]" type="range" id="quantum_improvement_rate"
                            v-model="quantum_improvement_rate" min="1" max="75" />
                        <input class="bg-gray-100 p-2 rounded-lg text-center w-1/5" type="number"
                            id="quantum_improvement_rate" v-model="quantum_improvement_rate" />
                    </div>
                </div>

                <div class="flex flex-col">
                    <label class="font-medium text-lg" for="physical_logical_ratio">Physical to Logical Qubit
                        Ratio</label>
                    <p class="text-xs text-gray-600">The number of physical qubits per logical qubit, considering error
                        correction.</p>
                    <div class="flex items-center justify-between w-full gap-2">
                        <input class="flex-1 accent-[#002D9D]" type="range" id="physical_logical_ratio"
                            v-model="physical_logical_ratio" min="1" max="2000" />
                        <input class="bg-gray-100 p-2 rounded-lg text-center w-1/5" type="number"
                            id="physical_logical_ratio" v-model="physical_logical_ratio" />
                    </div>
                </div>

                <div class="flex flex-col">
                    <label class="font-medium text-lg" for="growth_factor">Exponential Growth Factor</label>
                    <p class="text-xs text-gray-600">The yearly growth factor of the number of physical qubits (2 means
                        doubling each year).</p>
                    <div class="flex items-center justify-between w-full gap-2">
                        <input class="flex-1 accent-[#002D9D]" type="range" id="growth_factor" v-model="growth_factor"
                            min="1.5" max="2.5" step="0.1" />
                        <input class="bg-gray-100 p-2 rounded-lg text-center w-1/5" type="number" id="growth_factor"
                            v-model="growth_factor" />
                    </div>
                </div>

            </div>
            <button
                class="rounded-md bg-[#002D9D] px-4 py-2 text-sm font-medium text-white hover:bg-[#002D9D77] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75"
                @click="createHardware">Create Hardware</button>
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