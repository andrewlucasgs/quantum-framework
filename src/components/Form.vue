<script setup>
import Multiselect from 'vue-multiselect'
import HardwareSlowdownAdvanced from './HardwareSlowdownAdvanced.vue';
import { useModelsStore } from '../store/models';
import { Switch } from '@headlessui/vue'

import { onMounted, ref, watch } from 'vue';
import EditRoadmap from './EditRoadmap.vue';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import ReferenceDialog from './ReferenceDialog.vue';
import HardwareReferences from './HardwareReferences.vue';
import ProblemReferences from './ProblemReferences.vue';

const models = useModelsStore();

const props = defineProps({
    modelId: Number
});

const qubitSizeOptions = ref([
    "2^{# of qubits}",
    "2^(2^{# of qubits})",
    "{# of qubits}",
    "log({# of qubits})",
])

const penalties = ref([
    "None",
    "log(n,2)",
    // "n",
])

const problems = ref([
    {
        problemName: "Database Search",
        "classicalRuntime": 'n',
        "quantumRuntime": 'n**(1/2)',
        classicalRuntimeLabel: "O(n)",
        quantumRuntimeLabel: "O(\\sqrt{n})",
        qubitToProblemSize: "2^{# of qubits}",
        penalty: "log(n,2)",
    },
    {
        problemName: "Integer Factorization",
        "classicalRuntime": 'exp((64/9 * n)**(1/3) * log(n)**(2/3))',
        "quantumRuntime": '(n**2) * log(n)',
        classicalRuntimeLabel: "O(e^{(64/9 * n)^{1/3} * \\ln(n)^{2/3}})",
        quantumRuntimeLabel: "O(n^{2} * \\ln(n))",
        qubitToProblemSize: "{# of qubits}",
        penalty: "log(n,2)",
    },
    {
        problemName: "Traveling Salesman",
        "classicalRuntime": '(n**3) * (2**n)',
        "quantumRuntime": 'n * (1.78**n)',
        classicalRuntimeLabel: "O(n^{3} * 2^{n})",
        quantumRuntimeLabel: "O(n * 1.78^{n})",
        qubitToProblemSize: "log({# of qubits})",
        penalty: "log(n,2)",
    },
    {
        problemName: "Time Dependent Hartree-Fock Approximation (Quantum Chemistry)",
        "classicalRuntime": 'n**3',
        "quantumRuntime": 'n',
        classicalRuntimeLabel: "O(n^{3})",
        quantumRuntimeLabel: "O(n)",
        qubitToProblemSize: "{# of qubits}",
        penalty: "log(n,2)",
    },
    {
        problemName: "Full Configuration Interaction (Quantum Chemistry)",
        "classicalRuntime": 'factorial(n)',
        "quantumRuntime": 'n**11',
        classicalRuntimeLabel: "O(n!)",
        quantumRuntimeLabel: "O(n^{11})",
        qubitToProblemSize: "{# of qubits}",
        penalty: "log(n,2)",
    },
]);


const hardwares = ref([
    {
        hardwareName: "IBM (Superconducting)",
        hardwareSlowdown: 3.78,
        quantumImprovementRate: 10,
        physicalLogicalQubitsRatio: 1000,
        ratioImprovementRate: 10,
        roadmap: {
            2020: 27,
            2022: 127,
            2024: 133,
            2025: 156,
            2029: 200,
            2033: 2000,
        },
        roadmapUnit: "physical",
        extrapolationType: "exponential",
    },
    {
        hardwareName: "IonQ (Trapped Ion)",
        hardwareSlowdown: 6.7,
        quantumImprovementRate: 10,
        physicalLogicalQubitsRatio: 32,
        ratioImprovementRate: 10,
        roadmap: {
            2021: 22,
            2022: 25,
            2023: 29,
            2024: 35,
            // 2021: 352,
            // 2022: 400,
            // 2023: 464,
            // 2024: 560,
            2025: 1024,
            2026: 4096,
            2027: 12288,
            2028: 32768,
        },
        roadmapUnit: "physical",
        extrapolationType: "exponential",
    },
    {
        hardwareName: "QuEra (Neutral Atom)",
        hardwareSlowdown: 5.1,
        quantumImprovementRate: 10,
        physicalLogicalQubitsRatio: 100,
        ratioImprovementRate: 10,
        roadmap: {
            2023: 256,
            2025: 3000,
            2026: 10000,
        },
        roadmapUnit: "physical",
        extrapolationType: "exponential",
    },
]);



const model = ref(models.models.find(m => m.id === props.modelId));

function updateSlowdown(value) {
    model.value.hardwareSlowdown = value;
}

const selectedProblem = ref(problems.value.find(p => p.problemName === model.value.problemName));
const selectedHardware = ref(hardwares.value.find(h => h.hardwareName === model.value.hardwareName));
onMounted(() => {
    model.value = Object.assign({}, models.models.find(m => m.id === props.modelId))
});

watch(() => selectedHardware.value, (hardware) => {
    model.value.hardwareName = hardware.hardwareName;
    model.value.hardwareSlowdown = hardware.hardwareSlowdown;
    model.value.physicalLogicalQubitsRatio = hardware.physicalLogicalQubitsRatio;
    model.value.quantumImprovementRate = hardware.quantumImprovementRate;
    model.value.roadmap = hardware.roadmap;
    model.value.roadmapUnit = hardware.roadmapUnit;
    model.value.extrapolationType = hardware.extrapolationType;
    model.value.ratioImprovementRate = hardware.ratioImprovementRate;

}, { deep: true });

watch(() => selectedProblem.value, (problem) => {
    model.value.problemName = problem.problemName;
    model.value.classicalRuntime = problem.classicalRuntime;
    model.value.quantumRuntime = problem.quantumRuntime;
    model.value.classicalRuntimeLabel = problem.classicalRuntimeLabel;
    model.value.quantumRuntimeLabel = problem.quantumRuntimeLabel;
    model.value.qubitToProblemSize = problem.qubitToProblemSize;
    model.value.penalty = problem.penalty;
}, { deep: true });

watch(() => model.value, (value) => {
    models.updateModel(props.modelId, value);
}, { deep: true });




const editMode = ref(true);

function updateRoadmap(value) {
    model.value.roadmap = value.roadmap;
    model.value.extrapolationType = value.extrapolationType;
    model.value.roadmapUnit = value.roadmapUnit;
}

function removeModel() {
    models.removeModel(props.modelId);
}

function duplicateModel() {
    models.duplicateModel(props.modelId);
}

function getRelevantRoadmapPoints(data) {
    const keys = Object.keys(data);
    const result = {};

    if (keys.length <= 3) {
        return data;
    }

    result[keys[0]] = data[keys[0]];
    result[keys[keys.length - 1]] = data[keys[keys.length - 1]];

    const middleIndex = Math.floor((keys.length - 1) / 2);
    result[keys[middleIndex]] = data[keys[middleIndex]];

    return result;
}



</script>

<template>
    <div class="" v-if="model">
        <div class="flex justify-between items-center border-b w-full px-8 py-2 bg-slate-100">
            <h2 class="text-xl text-center font-medium">{{ model.id }}. {{ model.problemName }} on {{
                model.hardwareName }}</h2>

            <div class="flex items-center gap-4">
                <!-- toogle quantum only -->
                <label class="flex items-center gap-1 cursor-pointer">

                    <Switch v-model="model.quantumOnly" :class="model.quantumOnly ? 'bg-[#002D9D]' : 'bg-gray-400'"
                        class="relative inline-flex h-4 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75">
                        <span class="sr-only">Quantum only</span>
                        <span aria-hidden="true" :class="model.quantumOnly ? 'translate-x-4' : 'translate-x-0'"
                            class="pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out" />
                    </Switch>
                    <span class="text-sm" :class="model.quantumOnly ? 'text-[#002D9D]' : 'text-gray-400'">
                        Quantum only
                    </span>
                </label>
                <label class="flex items-center gap-1 cursor-pointer">
                    <Switch v-model="editMode" :class="!editMode ? 'bg-[#002D9D]' : 'bg-gray-400'"
                        class="relative inline-flex h-4 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75">
                        <span class="sr-only">Advanced Options</span>
                        <span aria-hidden="true" :class="!editMode ? 'translate-x-4' : 'translate-x-0'"
                            class="pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out" />

                    </Switch>
                    <span class="text-sm" :class="!editMode ? 'text-[#002D9D]' : 'text-gray-400'">
                        Advanced Options
                    </span>

                </label>
                <button
                    class="flex items-center justify-center rounded-md bg-blue-100 ring-1 ring-opacity-50 ring-[#002D9D] px-2 py-2 text-sm text-[#002D9D] hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    @click="duplicateModel">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                        stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
                    </svg>
                </button>
                <button
                    class="flex items-center justify-center rounded-md bg-red-50  ring-1 ring-opacity-50 ring-red-900 px-2 py-2 text-sm text-red-900 hover:bg-red-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    @click="removeModel"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                        stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                </button>
            </div>
        </div>

        <template v-if="!model.quantumOnly">

            <!-- transition height -->
            <div class="px-8  py-2  justify-between items-center gap-8 transition-all duration-500 ease-in-out"
                :class="{ 'max-h-96 opacity-100 flex': editMode, 'max-h-0 opacity-0   hidden ': !editMode }">
                <div class="w-full">
                    <div class="flex items-center gap-2">
                        <label class="font-medium">Problem </label>
                        <ReferenceDialog title="References" classes="max-w-lg">
                            <template #content>
                                <ProblemReferences />
                            </template>
                        </ReferenceDialog>
                    </div>
                    <multiselect class="custom-multiselect mt-1" track-by="problemName" label="problemName"
                        v-model="selectedProblem" :options="problems" :searchable="true" :close-on-select="true"
                        :allowEmpty="false" :show-labels="false" placeholder="Pick a value"></multiselect>

                </div>
                <div class="w-full">
                    <div class="flex items-center gap-2">
                        <label class="font-medium">Roadmap </label>
                        <ReferenceDialog title="References" classes="max-w-lg">
                            <template #content>
                                <HardwareReferences />
                            </template>
                        </ReferenceDialog>
                    </div>

                    <multiselect class="custom-multiselect" track-by="hardwareName" label="hardwareName"
                        v-model="selectedHardware" :options="hardwares" :searchable="true" :close-on-select="true"
                        :allowEmpty="false" :show-labels="false" placeholder="Pick a hardware provider"></multiselect>

                </div>

            </div>


            <div class="px-8  py-2 md:flex justify-between gap-8 transition-all duration-500 ease-in-out"
                :class="{ 'max-h-screen pb-8 opacity-100': !editMode, 'max-h-0 opacity-0 ': editMode }">
                <div class="w-1/4">
                    <div class="flex items-center gap-2">
                        <label class="font-medium">Problem </label>
                        <ReferenceDialog title="References" classes="max-w-lg">
                            <template #content>
                                <ProblemReferences />
                            </template>
                        </ReferenceDialog>
                    </div>
                    <multiselect class="custom-multiselect mt-1" track-by="problemName" label="problemName"
                        v-model="selectedProblem" :options="problems" :searchable="true" :close-on-select="true"
                        :show-labels="false" placeholder="Pick a value"></multiselect>
                    <p>
                        Classical Runtime: <span v-html="katex.renderToString(model.classicalRuntimeLabel)"></span>
                    </p>
                    <p>
                        Quantum Runtime: <span v-html="katex.renderToString(model.quantumRuntimeLabel)"></span>
                    </p>

                    <br>
                    <label class="font-medium text-sm">Connectivity Penalty</label>
                    <p class="text-xs text-gray-600">The overhead for embedding the quantum circuit in the hardware
                        layout.
                    </p>
                    <multiselect class="custom-multiselect mt-1" v-model="model.penalty" :options="penalties"
                        :searchable="true" :close-on-select="true" :show-labels="false" placeholder="Pick a value">
                    </multiselect>
                    <br>
                    <div class="flex flex-col">
                        <label class="font-medium text-sm" for="qubits_to_size">Qubits to Problem Size</label>
                        <p class="text-xs text-gray-600">The function which correlates maximum problem size solvable
                            with
                            the
                            given number of qubits.</p>
                        <multiselect class="custom-multiselect mt-1" v-model="model.qubitToProblemSize"
                            :options="qubitSizeOptions" :searchable="true" :close-on-select="true" :show-labels="false"
                            :allowEmpty="false" placeholder="Pick a value"></multiselect>
                    </div>


                </div>
                <div class="w-1/4">
                    <div class="flex justify-between mb-1">

                        <div class="flex items-center gap-2">
                            <label class="font-medium">Roadmap </label>
                            <ReferenceDialog title="References" classes="max-w-lg">
                                <template #content>
                                    <HardwareReferences />
                                </template>
                            </ReferenceDialog>
                        </div>
                        <EditRoadmap :name="model.hardwareName" :roadmap="model.roadmap"
                            :extrapolationType="model.extrapolationType" @updateRoadmap="updateRoadmap"
                            :roadmapUnit="model.roadmapUnit" v-slot="{ openModal }">
                            <button
                                class="rounded-md bg-gray-500 text-xs   p-0.5 px-2  text-white hover:bg-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75"
                                @click="openModal">Edit roadmap</button>
                        </EditRoadmap>
                    </div>
                    <multiselect class="custom-multiselect" track-by="hardwareName" label="hardwareName"
                        v-model="selectedHardware" :options="hardwares" :searchable="true" :close-on-select="true"
                        :allowEmpty="false" :show-labels="false" placeholder="Pick a hardware provider"></multiselect>

                    <table class="w-full table-auto mt-4 text-xs">
                        <thead class="bg-gray-100">
                            <tr class="text-left">
                                <th>Year</th>
                                <th># of {{ model.roadmapUnit }} Qubits</th>
                            </tr>
                        </thead>
                        <tbody class="text-left">
                            <tr v-for="(value, key) in getRelevantRoadmapPoints(model.roadmap)" :key="key"
                                class="border-b">
                                <td class="p-1">
                                    {{ key }}</td>
                                <td>{{ value }}</td>
                            </tr>
                            <tr>
                                <td colspan="2" class="p-1 text-center">
                                    <EditRoadmap :name="model.hardwareName" :roadmap="model.roadmap"
                                        :extrapolationType="model.extrapolationType" @updateRoadmap="updateRoadmap"
                                        :roadmapUnit="model.roadmapUnit" v-slot="{ openModal }">
                                        <button
                                            class="hover:underline text-xs text-blue-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                            @click="openModal">See more</button>
                                    </EditRoadmap>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="flex-1">
                    <div>
                        <div class="flex gap-2 items-center justify-between">
                            <div class="flex items-center gap-2">
                                <label class="font-medium text-s" for="hardwareSlowdown">Hardware Slowdown</label>
                                <ReferenceDialog title="References" classes="max-w-lg">
                                    <template #content>
                                        <h3 class="text-medium text-sm mt-4">Hardware Slowdown</h3>
                                        <ul class="text-sm">
                                            <li class="ml-4 list-disc">
                                                <a class="text-[#012D9D] hover:underline"
                                                    href="https://arxiv.org/pdf/2310.15505.pdf" target="_blank"
                                                    rel="noopener noreferrer">The Quantum Tortoise and the Classical
                                                    Hare:
                                                    A simple framework for understanding which
                                                    problems quantum computing will accelerate (and
                                                    which it won’t)</a>
                                            </li>
                                        </ul>
                                    </template>
                                </ReferenceDialog>
                            </div>
                            <HardwareSlowdownAdvanced @updateSlowdown="updateSlowdown" v-slot="{ openModal }">
                                <button
                                    class="rounded-md bg-gray-500 text-xs   p-0.5 px-2  text-white hover:bg-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75"
                                    @click="openModal">Advanced options</button>

                            </HardwareSlowdownAdvanced>
                        </div>
                        <p class="text-xs text-gray-600">The number of operations a classical computer could perform in
                            the
                            time it
                            takes
                            a quantum computer to perform one.</p>
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
                        <!-- <label class="font-medium text-sm" for="quantum_improvement_rate">Quantum Improvement Rate
                        (%)</label> -->
                        <p class="text-xs text-gray-600">The percentage by which the hardware slowdown is reduced by
                            each
                            year.</p>
                        <div class="flex items-center justify-between w-full gap-2">
                            <input class="flex-1 accent-[#002D9D]" type="range" id="quantum_improvement_rate"
                                v-model="model.quantumImprovementRate" min="-90" max="90" />
                            <input class="bg-gray-100 p-2 rounded-lg text-center w-1/5" type="number"
                                id="quantum_improvement_rate" v-model="model.quantumImprovementRate" />
                        </div>
                    </div>

                    <div class="flex flex-col">
                        <label class="font-medium text-s" for="physical_logical_ratio">Physical to Logical Qubit
                            Ratio</label>
                        <p class="text-xs text-gray-600">The number of physical qubits per logical qubit, considering
                            error
                            correction.</p>
                        <div class="flex items-center justify-between w-full gap-2">
                            <input class="flex-1 accent-[#002D9D]" type="range" id="physical_logical_ratio"
                                v-model="model.physicalLogicalQubitsRatio" min="1" max="2000" />
                            <input class="bg-gray-100 p-2 rounded-lg text-center w-1/5" type="number"
                                id="physical_logical_ratio" v-model="model.physicalLogicalQubitsRatio" />
                        </div>
                    </div>
                    <div class="flex flex-col">
                        <!-- <label class="font-medium text-sm" for="ratio_improvement_rate">Physical to Logical Ratio
                        Improvement Rate
                        (%)</label> -->
                        <p class="text-xs text-gray-600">The percentage which the physical to logical qubit ratio is
                            reduced
                            by each
                            year.</p>
                        <div class="flex items-center justify-between w-full gap-2">
                            <input class="flex-1 accent-[#002D9D]" type="range" id="ratio_improvement_rate"
                                v-model="model.ratioImprovementRate" min="-90" max="90" />
                            <input class="bg-gray-100 p-2 rounded-lg text-center w-1/5" type="number"
                                id="ratio_improvement_rate" v-model="model.ratioImprovementRate" />
                        </div>
                    </div>
                </div>
            </div>
        </template>
        <template v-else>

            <!-- transition height -->
            <div class="px-8  py-2  justify-between items-center gap-8 transition-all duration-500 ease-in-out"
                :class="{ 'max-h-96 opacity-100 flex': editMode, 'max-h-0 opacity-0   hidden ': !editMode }">
                <div class="w-full">
                    <div class="flex items-center gap-2">
                        <label class="font-medium">Roadmap </label>
                        <ReferenceDialog title="References" classes="max-w-lg">
                            <template #content>
                                <HardwareReferences />
                            </template>
                        </ReferenceDialog>
                    </div>

                    <multiselect class="custom-multiselect" track-by="hardwareName" label="hardwareName"
                        v-model="selectedHardware" :options="hardwares" :searchable="true" :close-on-select="true"
                        :allowEmpty="false" :show-labels="false" placeholder="Pick a hardware provider"></multiselect>

                </div>

            </div>


            <div class="px-8  py-2 md:flex justify-between gap-8 transition-all duration-500 ease-in-out"
                :class="{ 'max-h-screen pb-8 opacity-100': !editMode, 'max-h-0 opacity-0 ': editMode }">
                <div class="w-1/4">
                    <div class="flex justify-between mb-1">
                        <div class="flex items-center gap-2">
                            <label class="font-medium">Roadmap </label>
                            <ReferenceDialog title="References" classes="max-w-lg">
                                <template #content>
                                    <HardwareReferences />
                                </template>
                            </ReferenceDialog>
                        </div>
                        <EditRoadmap :name="model.hardwareName" :roadmap="model.roadmap"
                            :extrapolationType="model.extrapolationType" @updateRoadmap="updateRoadmap"
                            :roadmapUnit="model.roadmapUnit" v-slot="{ openModal }">
                            <button
                                class="rounded-md bg-gray-500 text-xs   p-0.5 px-2  text-white hover:bg-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75"
                                @click="openModal">Edit roadmap</button>
                        </EditRoadmap>
                    </div>
                    <multiselect class="custom-multiselect" track-by="hardwareName" label="hardwareName"
                        v-model="selectedHardware" :options="hardwares" :searchable="true" :close-on-select="true"
                        :allowEmpty="false" :show-labels="false" placeholder="Pick a hardware provider"></multiselect>

                    <table class="w-full table-auto mt-4 text-xs">
                        <thead class="bg-gray-100">
                            <tr class="text-left">
                                <th>Year</th>
                                <th># of {{ model.roadmapUnit }} Qubits</th>
                            </tr>
                        </thead>
                        <tbody class="text-left">
                            <tr v-for="(value, key) in getRelevantRoadmapPoints(model.roadmap)" :key="key"
                                class="border-b">
                                <td class="p-1">
                                    {{ key }}</td>
                                <td>{{ value }}</td>
                            </tr>
                            <tr>
                                <td colspan="2" class="p-1 text-center">
                                    <EditRoadmap :name="model.hardwareName" :roadmap="model.roadmap"
                                        :extrapolationType="model.extrapolationType" @updateRoadmap="updateRoadmap"
                                        :roadmapUnit="model.roadmapUnit" v-slot="{ openModal }">
                                        <button
                                            class="hover:underline text-xs text-blue-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                            @click="openModal">See more</button>
                                    </EditRoadmap>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="w-1/4">
                    <div class="flex flex-col">
                        <label class="font-medium text-sm" for="qubits_to_size">Qubits to Problem Size</label>
                        <p class="text-xs text-gray-600">The function which correlates maximum problem size solvable
                            with
                            the
                            given number of qubits.</p>
                        <multiselect class="custom-multiselect mt-1" v-model="model.qubitToProblemSize"
                            :options="qubitSizeOptions" :searchable="true" :close-on-select="true" :show-labels="false"
                            :allowEmpty="false" placeholder="Pick a value"></multiselect>
                    </div>
                </div>

                <div class="flex-1">

                    <div class="flex flex-col">
                        <label class="font-medium text-sm" for="physical_logical_ratio">Physical to Logical Qubit
                            Ratio</label>
                        <p class="text-xs text-gray-600">The number of physical qubits per logical qubit, considering
                            error
                            correction.</p>
                        <div class="flex items-center justify-between w-full gap-2">
                            <input class="flex-1 accent-[#002D9D]" type="range" id="physical_logical_ratio"
                                v-model="model.physicalLogicalQubitsRatio" min="1" max="2000" />
                            <input class="bg-gray-100 p-2 rounded-lg text-center w-1/5" type="number"
                                id="physical_logical_ratio" v-model="model.physicalLogicalQubitsRatio" />
                        </div>
                    </div>
                    <div class="flex flex-col">
                        <!-- <label class="font-medium text-sm" for="ratio_improvement_rate">Physical to Logical Ratio
                Improvement Rate
                (%)</label> -->
                        <p class="text-xs text-gray-600">The percentage which the physical to logical qubit ratio is
                            reduced
                            by each
                            year.</p>
                        <div class="flex items-center justify-between w-full gap-2">
                            <input class="flex-1 accent-[#002D9D]" type="range" id="ratio_improvement_rate"
                                v-model="model.ratioImprovementRate" min="-90" max="90" />
                            <input class="bg-gray-100 p-2 rounded-lg text-center w-1/5" type="number"
                                id="ratio_improvement_rate" v-model="model.ratioImprovementRate" />
                        </div>
                    </div>
                </div>
            </div>
        </template>

    </div>
</template>


<style src="vue-multiselect/dist/vue-multiselect.css"></style>

<style lang="css" scoped>
.custom-multiselect :deep(.multiselect__tags) .multiselect__tag {
    background-color: #002D9D;
    z-index: 999 !important;

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
    z-index: 999 !important;

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
    z-index: 999 !important;

}
</style>