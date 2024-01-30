<script setup>
import { inject } from 'vue';


import FormInputs from '../components/FormInputs.vue';
import QuantumAdvantageChart from '../components/QuantumAdvantageChart.vue';
import QuantumEconomicAdvantage from '../components/QuantumEconomicAdvantage.vue';
import QubitsRoadmap from '../components/QubitsRoadmap.vue';


import { useInputStore } from '../store/input.js'
import { useGraphStore } from '../store/graph.js';

const inputStore = useInputStore();
const graphStore = useGraphStore();

</script>

<template>
    <div>
        <div class=" bg-[#002D9D] py-4 px-8">
            <div class="mx-auto max-w-screen-2xl">
                <div class="flex gap-2 items-center">
                    <img src="/quantum-logo.png" class="h-16" alt="">
                    <h1 class=" text-white text-3xl font-medium">Quantum Economic Advantage Calculator</h1>
                </div>
            </div>
        </div>
        <div class="mx-auto max-w-screen-2xl mt-8">
            <FormInputs />
        </div>
        <div class="relative min-h-[300px] max-w-screen-2xl mx-auto flex mt-16">
            <div v-if="graphStore.loading"
                class="absolute bg-slate-800 h-full w-full z-10 flex justify-center items-center opacity-30">
                <div class="text-5xl text-white">
                    Processing...
                </div>

            </div>
            <div class="vertical-container">
                <div class="horizontal-container"  v-for="(hardware, hardwareIndex) in inputStore.createdHardwares" :key="hardwareIndex">
                    {{ hardware.hardwareString }}
                    <QuantumAdvantageChart :hardwareIndex="hardwareIndex" class="flex-1" />
                    <QuantumEconomicAdvantage :hardwareIndex="hardwareIndex" class="flex-1" />
                </div>
            </div>
        </div>
        <div class="max-w-7xl mx-auto px-2">
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