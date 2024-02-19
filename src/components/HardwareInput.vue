<script setup>
import { ref, watch } from 'vue';
import Multiselect from 'vue-multiselect'
import HardwareSlowdownAdvanced from './HardwareSlowdownAdvanced.vue';
import { useInputStore } from '../store/input';

const inputStore = useInputStore();

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

const props = defineProps(["hardwareIndex"])

let selectedHardware = ref(hardwares.value[0]);
let hardwareSlowdown = ref(null);
let quantum_improvement_rate = ref(null);
let physical_logical_ratio = ref(null);
let growth_factor = ref(null)

if (props.hardwareIndex === undefined) {
    selectedHardware = ref(hardwares.value[0]);
    hardwareSlowdown = ref(selectedHardware.value.hardwareSlowdown);
    quantum_improvement_rate = ref(selectedHardware.value.quantum_improvement_rate);
    physical_logical_ratio = ref(selectedHardware.value.physical_logical_ratio);
    growth_factor = ref(selectedHardware.value.growth_factor)
}
else {
    let hardware = inputStore.createdHardwares[props.hardwareIndex];
    for (let i = 0; i < hardwares.value.length; i++) { //loop matches selectedHardware to input one by name
        if (hardwares.value[i].name === hardware.name) {
            selectedHardware.value = hardwares.value[i];
            break;
        }
    }
    hardwareSlowdown = ref(hardware.hardwareSlowdown);
    quantum_improvement_rate = ref(hardware.quantum_improvement_rate);
    physical_logical_ratio = ref(hardware.physical_logical_ratio);
    growth_factor = ref(hardware.growth_factor)
}


watch(selectedHardware, () => {
    hardwareSlowdown.value = selectedHardware.value.hardwareSlowdown;
    quantum_improvement_rate.value = selectedHardware.value.quantum_improvement_rate;
    physical_logical_ratio.value = selectedHardware.value.physical_logical_ratio;
    growth_factor.value = selectedHardware.value.growth_factor;
})

function updateSlowdown(newSlowdown) {
    hardwareSlowdown.value = newSlowdown;
}



defineExpose({
    selectedHardware,
    hardwareSlowdown,
    quantum_improvement_rate,
    physical_logical_ratio,
    growth_factor,
    hardwares
})

</script>

<template>
    <div>
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
                    <label class="font-medium text-lg" for="hardwareSlowdown">Hardware Slowdown
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
                        min="0" max="8" step="0.5" />

                    <div class="   w-1/5">
                        <HardwareSlowdownAdvanced @updateSlowdown="updateSlowdown" v-slot="{ openModal }">
                            <button
                            class="bg-gray-100 p-2  rounded-lg text-center w-full hover:bg-gray-200"
                            @click="openModal">10<sup>{{ hardwareSlowdown }}</sup></button>

                        </HardwareSlowdownAdvanced>
                        
                    </div>
                </div>

                <div class="flex flex-col">
                    <label class="font-medium text-lg" for="quantum_improvement_rate">Quantum Improvement Rate (%)</label>
                    <p class="text-xs text-gray-600">The ratio of improvement over time between quantum computing and classical computing.</p>
                    <div class="flex items-center justify-between w-full gap-2">
                        <input class="flex-1 accent-[#002D9D]" type="range" id="quantum_improvement_rate"
                            v-model="quantum_improvement_rate" min="-90" max="90" />
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
                            v-model="physical_logical_ratio" min="1" max="10000" />
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
                            min="1.1" max="3" step="0.1" />
                        <input class="bg-gray-100 p-2 rounded-lg text-center w-1/5" type="number" id="growth_factor"
                            v-model="growth_factor" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>