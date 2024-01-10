<script setup>
import { inject } from 'vue';


import FormInputs from '../components/FormInputs.vue';
import QuantumAdvantageChart from '../components/QuantumAdvantageChart.vue';
import QuantumEconomicAdvantage from '../components/QuantumEconomicAdvantage.vue';
import QubitsRoadmap from '../components/QubitsRoadmap.vue';


import { useGraphStore } from '../store/graph.js';

const graphStore = useGraphStore();

</script>

<template>
    <div>
        <div class="max-w-7xl mx-auto bg-gray-300 p-4">
            <h1 class="text-center text-5xl font-bold">Quantum Economic Advantage</h1>
        </div>
        <div class="max-w-7xl mx-auto px-2">
            <FormInputs />
        </div>
        <div class="relative min-h-[300px] max-w-7xl mx-auto px-2 flex" >
            <div v-if="graphStore.loading" class="absolute bg-slate-800 h-full w-full z-50 flex justify-center items-center opacity-30">
                <div class="text-5xl text-white">
                    Processing...
                </div>

            </div>
            <QuantumAdvantageChart />
            <QuantumEconomicAdvantage />
        </div>
        <div class="max-w-7xl mx-auto px-2">
        </div>
        <div class="max-w-7xl mx-auto px-2">
            <QubitsRoadmap />
        </div>
    </div>
</template>