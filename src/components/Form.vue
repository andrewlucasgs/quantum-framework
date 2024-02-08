<script setup>
import Multiselect from 'vue-multiselect'
import HardwareSlowdownAdvanced from './HardwareSlowdownAdvanced.vue';
import { useModelsStore } from '../store/models';

import { onMounted, ref, watch } from 'vue';
import QubitsRoadmap from './QubitsRoadmap.vue';
import EditRoadmap from './EditRoadmap.vue';

const models = useModelsStore();

const props = defineProps({
    modelIndex: Number
});

const problems = ref([
    {
        problemName: "Database Search",
        classicalRuntime: (n) => n,
        quantumRuntime: (n) => Math.sqrt(n),
        classicalRuntimeLabel: "O(n)",
        quantumRuntimeLabel: "O(\\sqrt{n})",
    },
    {
        problemName: "Sorting",
        classicalRuntime: (n) => n * Math.log2(n),
        quantumRuntime: (n) => n,
        classicalRuntimeLabel: "O(n \\log_2 n)",
        quantumRuntimeLabel: "O(n)",
    },
    {
        problemName: "Integer Factorization",
        classicalRuntime: (n) => Math.exp(Math.sqrt(Math.log(n) * Math.log(Math.log(n)))),
        quantumRuntime: (n) => Math.pow(n, 1 / 3),
        classicalRuntimeLabel: "O(e^{\\sqrt{\\log n \\cdot \\log \\log n}})",
        quantumRuntimeLabel: "O(n^{1/3})",
    },
    {
        problemName: "Linear Algebra",
        classicalRuntime: (n) => Math.pow(n, 3),
        quantumRuntime: (n) => Math.pow(n, 2.373),
        classicalRuntimeLabel: "O(n^3)",
        quantumRuntimeLabel: "O(n^{2.373})",

    },
    {
        problemName: "Machine Learning",
        classicalRuntime: (n) => Math.pow(n, 2),
        quantumRuntime: (n) => Math.pow(n, 1.5),
        classicalRuntimeLabel: "O(n^2)",
        quantumRuntimeLabel: "O(n^{1.5})",
    },
]);


const hardwares = ref([
    {
        hardwareName: "IBM",
        hardwareSlowdown: 6,
        quantumImprovementRate: 50,
        physicalLogicalQubitsRatio: 1000,
        roadmap: {
            2021: 127,
            2022: 433,
            2023: 1121,
            2024: 1386,
            2025: 4158,
            2033: 100000
        }

    },
    {
        hardwareName: "Intel",
        hardwareSlowdown: 5,
        quantumImprovementRate: 40,
        physicalLogicalQubitsRatio: 1200,
        roadmap: {
            2021: 127,
            2022: 4333,
            2023: 1121,
            2024: 1386,
            2025: 4158,
            2026: 5158,
            2027: 5158,

        }
    },
    {
        hardwareName: "IQM",
        hardwareSlowdown: 7,
        quantumImprovementRate: 60,
        physicalLogicalQubitsRatio: 800,
        roadmap: {
            2021: 127,
            2022: 433,
            2023: 1121,
            2024: 1386,
            2025: 4158,
        }
    },

]);



const model = ref(
    models.models[props.modelIndex])

function updateSlowdown(value) {
    model.value.hardwareSlowdown = value;
}

const selectedProblem = ref(null);
const selectedHardware = ref(null);
onMounted(() => {
    model.value = models.models[props.modelIndex];
    selectedHardware.value = hardwares.value.find(h => h.hardwareName === model.value.hardwareName);
    selectedProblem.value = problems.value.find(p => p.problemName === model.value.problemName);
});

watch([() => selectedProblem.value, () => selectedHardware.value] , ([problem, hardware]) => {
    model.value.problemName = problem.problemName;
    model.value.classicalRuntime = problem.classicalRuntime;
    model.value.quantumRuntime = problem.quantumRuntime;
    model.value.classicalRuntimeLabel = problem.classicalRuntimeLabel;
    model.value.quantumRuntimeLabel = problem.quantumRuntimeLabel;
    model.value.hardwareName = hardware.hardwareName;
    model.value.hardwareSlowdown = hardware.hardwareSlowdown;
    model.value.physicalLogicalQubitsRatio = hardware.physicalLogicalQubitsRatio;
    model.value.roadmap = hardware.roadmap;
}, { deep: true });

watch(() => model.value, (value) => {
    models.updateModel(props.modelIndex, value);
}, { deep: true });




const editMode = ref(false);

function updateRoadmap(value) {
    model.value.roadmap = value;
}

function removeModel() {
    models.removeModel(props.modelIndex);
}

function duplicateModel() {
    models.duplicateModel(props.modelIndex);
}

</script>

<template>
    <div class="">
        <div class="flex justify-between items-center border-b w-full px-8 py-2 bg-slate-100">
            <h2 class="text-2xl text-center font-medium">{{ model.problemName }} on {{ model.hardwareName }}</h2>
            <div class="flex gap-4">
                <button
                    class="flex items-center justify-center rounded-md bg-[#002D9D] px-2 py-2 text-sm text-white hover:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    @click="editMode = !editMode"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                        stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>

                </button>
                <button
                    class="flex items-center justify-center rounded-md bg-blue-100 px-2 py-2 text-sm text-[#002D9D] hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    @click="duplicateModel">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                        stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
                    </svg>
                </button>
                <button
                    class="flex items-center justify-center rounded-md bg-red-50 px-2 py-2 text-sm text-red-900 hover:bg-red-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    @click="removeModel"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                        stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                </button>
            </div>
        </div>
        <!-- transition height -->
        <div class="px-8  py-2 md:flex justify-between gap-8 transition-all duration-500 ease-in-out overflow-hidden"
            :class="{ 'max-h-screen pb-8 opacity-100': !editMode, 'max-h-0 opacity-0 ': editMode }">
            <div class="w-1/4">
                <label class="font-medium">Problem family</label>
                <multiselect class="custom-multiselect" track-by="problemName" label="problemName" v-model="selectedProblem"
                    :options="problems" :searchable="true" :close-on-select="true" :show-labels="false"
                    placeholder="Pick a value"></multiselect>
                <p>
                    Classical Runtime: {{ model.classicalRuntimeLabel }}
                </p>
                <p>
                    Quantum Runtime: {{ model.quantumRuntimeLabel }}
                </p>
            </div>
            <div class="w-1/4">
                <label class="font-medium">Roadmap</label>
                <multiselect class="custom-multiselect" track-by="hardwareName" label="hardwareName" v-model="selectedHardware"
                    :options="hardwares" :searchable="true" :close-on-select="true" :show-labels="false"
                    placeholder="Pick a harware provider"></multiselect>
                <EditRoadmap :roadmap="model.roadmap" @updateRoadmap="updateRoadmap" v-slot="{ openModal }">
                    <button
                        class="rounded-md bg-gray-500 text-xs   p-0.5 px-2  text-white hover:bg-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75"
                        @click="openModal">Edit roadmap</button>
                </EditRoadmap>

                <table class="w-full table-auto mt-4 text-xs">
                    <thead class="bg-gray-100">
                        <tr class="text-left">
                            <th>Year</th>
                            <th># of Physic Qubits</th>
                        </tr>
                    </thead>
                    <tbody class="text-left">
                        <tr v-for="(value, key) in model.roadmap" :key="key" class="border-b">
                            <td class="p-1">
                                {{ key }}</td>
                            <td>{{ value }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="flex-1">
                <div>
                    <div class="flex gap-2 items-center">
                        <label class="font-medium text-sm" for="hardwareSlowdown">Hardware Slowdown
                        </label>
                        <HardwareSlowdownAdvanced @updateSlowdown="updateSlowdown" v-slot="{ openModal }">
                            <button
                                class="rounded-md bg-gray-500 text-xs   p-0.5 px-2  text-white hover:bg-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75"
                                @click="openModal">Advanced options</button>

                        </HardwareSlowdownAdvanced>
                    </div>
                    <p class="text-xs text-gray-600">The speed difference between classical & quantum computers.</p>
                    <div class="flex items-center justify-between w-full gap-2">
                        <input class="flex-1 accent-[#002D9D]" type="range" id="hardwareSlowdown"
                            v-model="model.hardwareSlowdown" min="0" max="12" step="0.5" />

                        <div class="   w-1/5">
                            <HardwareSlowdownAdvanced @updateSlowdown="updateSlowdown" v-slot="{ openModal }">
                                <button class="bg-gray-100 p-2  rounded-lg text-center w-full hover:bg-gray-200"
                                    @click="openModal">10<sup>{{ model.hardwareSlowdown }}</sup></button>

                            </HardwareSlowdownAdvanced>

                        </div>
                    </div>
                </div>
                <div class="flex flex-col">
                    <label class="font-medium text-sm" for="quantum_improvement_rate">Quantum Improvement Rate
                        (%)</label>
                    <p class="text-xs text-gray-600">The ratio of improvement over time between quantum computing and
                        classical computing.</p>
                    <div class="flex items-center justify-between w-full gap-2">
                        <input class="flex-1 accent-[#002D9D]" type="range" id="quantum_improvement_rate"
                            v-model="model.quantumImprovementRate" min="-90" max="90" />
                        <input class="bg-gray-100 p-2 rounded-lg text-center w-1/5" type="number"
                            id="quantum_improvement_rate" v-model="model.quantumImprovementRate" />
                    </div>
                </div>

                <div class="flex flex-col">
                    <label class="font-medium text-sm" for="physical_logical_ratio">Physical to Logical Qubit
                        Ratio</label>
                    <p class="text-xs text-gray-600">The number of physical qubits per logical qubit, considering error
                        correction.</p>
                    <div class="flex items-center justify-between w-full gap-2">
                        <input class="flex-1 accent-[#002D9D]" type="range" id="physical_logical_ratio"
                            v-model="model.physicalLogicalQubitsRatio" min="1" max="2000" />
                        <input class="bg-gray-100 p-2 rounded-lg text-center w-1/5" type="number"
                            id="physical_logical_ratio" v-model="model.physicalLogicalQubitsRatio" />
                    </div>
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