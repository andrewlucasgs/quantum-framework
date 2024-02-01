<script setup>
import { inject } from 'vue';


import FormInputs from '../components/FormInputs.vue';
import QuantumAdvantageChart from '../components/QuantumAdvantageChart.vue';
import QuantumEconomicAdvantage from '../components/QuantumEconomicAdvantage.vue';
import EditHardware from '../components/EditHardware.vue';
import QubitsRoadmap from '../components/QubitsRoadmap.vue';


import { useInputStore } from '../store/input.js'
import { useGraphStore } from '../store/graph.js';

const inputStore = useInputStore();
const graphStore = useGraphStore();

function del(hardwareIndex, hardwareString) {
    inputStore.hardwareSet.delete(hardwareString);
    delete inputStore.createdHardwares[hardwareIndex];
}

</script>

<template>
    <div class="flex flex-col h-screen w-full overflow-hidden">
        <div class=" bg-[#002D9D] py-4 px-8">
            <div class="mx-auto">
                <div class="flex gap-2 items-center">
                    <img src="/quantum-logo.png" class="h-8" alt="">
                    <h1 class=" text-white text-2xl font-medium">Quantum Economic Advantage Calculator</h1>
                </div>
            </div>
        </div>
        <div class="flex flex-1 h-full">
            <div class=" overflow-auto p-4 w-1/4 border-r-2">
                <FormInputs />
            </div>

            <div class="flex flex-1 relative min-h-[300px] h-full overflow-scroll">
                <div v-if="graphStore.loading"
                    class="absolute bg-slate-800 h-full w-full z-10 flex justify-center items-center opacity-30">
                    <div class="text-5xl text-white">
                        Processing...
                    </div>

                </div>
                <div class="flex flex-1 flex-col gap-8 h-full overflow-scroll">
                    <div class="flex flex-col gap-4 items-center justify-center border-b-2 border-black"
                        v-for="(hardware, hardwareIndex) in inputStore.createdHardwares" :key="hardwareIndex">
                        <div class=" shadow-md p-2 flex  items-center gap-8 w-full">
                            <h2 class="font-bold text-lg">{{ hardware.name }}</h2>
                            <div class="flex gap-4 text-xs">
                                <span>
                                    HW: 10 <sup>

                                        {{ hardware.hardwareSlowdown }}
                                    </sup>

                                </span>
                                <span>

                                    QIR: {{
                                        hardware.quantum_improvement_rate }}%
                                </span>
                                <span>

                                    PLQR: {{ hardware.physical_logical_ratio }}
                                </span>
                                <span>

                                    EGF: {{
                                        hardware.growth_factor }}
                                </span>
                            </div>
                            <div>
                                <EditHardware :hardwareIndex="hardwareIndex" v-slot="{ openModal }"> 
                     <button
                        class="rounded-md bg-gray-500 text-xs p-1 px-2  text-white hover:bg-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75"
                        @click="openModal">Edit Hardware</button>
                    </EditHardware> 
                    <!-- <br> -->
                    <button @click="del(hardwareIndex, hardware.hardwareString)">Delete</button>
                            </div>
                        </div>
                        <div class="flex gap-4 items-center justify-center">

                            <QuantumAdvantageChart :hardwareIndex="hardwareIndex" class="flex-1" />
                            <QuantumEconomicAdvantage :hardwareIndex="hardwareIndex" class="flex-1" />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="max-w-7xl mx-auto px-2">
            <!-- <QubitsRoadmap /> -->
        </div>
    </div>
</template>

<style scoped>
.vertical-container {
    display: flex;
    flex-direction: column;
}

.horizontal-container {
    display: flex;
    flex-direction: row;
    justify-content: center;
}
</style>