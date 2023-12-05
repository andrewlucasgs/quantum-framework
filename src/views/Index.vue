<script setup>
import FormInputs from '../components/FormInputs.vue';
import QuantumAdvantageChart from '../components/QuantumAdvantageChart.vue';
import QuantumEconomicAdvantage from '../components/QuantumEconomicAdvantage.vue';
import QubitsRoadmap from '../components/QubitsRoadmap.vue';

</script>

<template>
    <div>
        <div class="max-w-7xl mx-auto bg-gray-300 p-4">
            <h1 class="text-center text-5xl font-bold">Quantum Economic Advantage</h1>
        </div>
        <div class="max-w-7xl mx-auto px-2">
            <FormInputs />
        </div>
        <div class="max-w-7xl mx-auto px-2 flex">
            
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