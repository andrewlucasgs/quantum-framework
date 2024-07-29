<script setup>
import { watch, ref, defineAsyncComponent } from 'vue';
import * as utils from "../store/utils"

const QuantumAdvantageGraph = defineAsyncComponent(() => import('./QuantumAdvantageGraph.vue'));
const QuantumEconomicAdvantageGraph = defineAsyncComponent(() => import('./QuantumEconomicAdvantageGraph.vue'));
const LogicalQubitsGraph = defineAsyncComponent(() => import('./LogicalQubitsGraph.vue'));
const LogicalQubitsOnlyGraph = defineAsyncComponent(() => import('./LogicalQubitsOnlyGraph.vue'));
const QuantumFeasibilityGraph = defineAsyncComponent(() => import('./QuantumFeasibilityGraph.vue'));
const MoneyAlgorithmGraph = defineAsyncComponent(() => import('./MoneyAlgorithmGraph.vue'));
const MoneyEconomicGraph = defineAsyncComponent(() => import('./MoneyEconomicGraph.vue'));
const Form = defineAsyncComponent(() => import('./Form.vue'));

const props = defineProps({
    model: Object,
    modelIndex: Number
});

const currentAdvantageData = ref({});
const quantumEconomicAdvantageData = ref({});
const logicalQubitsData = ref({});

async function getData(model) {
    console.log("getting data")
    console.log(model)

    const settings = {
        hardware_slowdown: 10 ** model.hardwareSlowdown,
        penalty: model.penalty,
        classical_runtime: model.classicalRuntime,
        quantum_runtime: model.quantumRuntime,
        roadmap: model.roadmap,
        extrapolation_type: model.extrapolationType,
        physical_to_logical_ratio: model.physicalLogicalQubitsRatio,
        physical_to_logical_improvement: model.ratioImprovementRate / 100,
        // logical_to_problem_size: model.qubitToProblemSize,
        logical_to_problem_size: '2**q',
        quantum_improvement_rate: model.quantumImprovementRate / 100,
        cost_factor: 10 ** model.costFactor,
        cost_improvement_rate: model.costImprovementRate / 100,
        roadmap_type: model.roadmapUnit,
    }
    const url = 'http://localhost:8000/calculate/'
    await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
    })
        .then(response => response.json())
        .then(data => {
            console.log(data)
            quantumEconomicAdvantageData.value = {
                tStar: Number(data.economic_advantage.year_star), 
                nStar: Math.log10(data.economic_advantage.n_star_star),

                tCostStar: Number(data.economic_advantage.cost_year_star),
                nCostStar: Math.log10(data.economic_advantage.n_cost_star_star),

                quantumFeasible: data.economic_advantage.feasibility.map((step, i) => [Number(data.economic_advantage.years[i]), Math.log10(step)]),
                quantumAdvantage: data.economic_advantage.advantage.map((step, i) => [Number(data.economic_advantage.years[i]), Math.log10(step)]),
                quantumCostAdvantage: data.economic_advantage.cost_advantage.map((step, i) => [Number(data.economic_advantage.years[i]), Math.log10(step)]),
            }

            console.log(quantumEconomicAdvantageData.value)
            currentAdvantageData.value = {
                nStar: Math.log10(data.minimum_problem_size.n_star),
                stepStar: Math.log10(data.minimum_problem_size.step_star),

                nCostStar: Math.log10(data.minimum_problem_size.n_cost_star),
                stepCostStar: Math.log10(data.minimum_problem_size.cost_star),

                quantumSteps: data.minimum_problem_size.quantum_steps.map((step, i) => [Math.log10(data.minimum_problem_size.problem_size[i]), Math.log10(step)]),
                classicalSteps: data.minimum_problem_size.classical_steps.map((step, i) => [Math.log10(data.minimum_problem_size.problem_size[i]), Math.log10(step)]),
                quantumCostSteps: data.minimum_problem_size.quantum_costs.map((step, i) => [Math.log10(data.minimum_problem_size.problem_size[i]), Math.log10(step)]),
            }

            

        })
        .catch(error => {
            console.log('asdasdasdas');

            console.error('Error:', error);
        });


}

watch(() => props.model, (model) => {
    console.log("model changed")
    getData(model)
}, { immediate: true, deep: true });

</script>

<template>
    <div class="max-w-7xl mx-auto my-4 border border-gray-100 rounded-lg shadow-lg ">

        <div>
            <Form :modelId="model.id" />
        </div>
        <template v-if="!model.quantumOnly">
            <div class="md:flex gap-4 px-8 py-2">

                <QuantumAdvantageGraph :data="currentAdvantageData" />
                <QuantumEconomicAdvantageGraph v-if="quantumEconomicAdvantageData.tStar > 0" :data="quantumEconomicAdvantageData" />
            </div>
        
        </template>
   

    </div>
</template>