<script setup>
import { onMounted, ref, watch } from 'vue';
import { useInputStore } from '../store/input.js'
import Multiselect from 'vue-multiselect'
import HardwareInput from './HardwareInput.vue';


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

const hardwareInputRef = ref(null);

function createHardware() {
    
    // console.log("trying again")
    // console.log(hardwareInputRef.value)


    const name = hardwareInputRef.value.selectedHardware.name;
    const hardwareSlowdown = hardwareInputRef.value.hardwareSlowdown;
    const quantum_improvement_rate = hardwareInputRef.value.quantum_improvement_rate;
    const physical_logical_ratio = hardwareInputRef.value.physical_logical_ratio;
    const growth_factor = hardwareInputRef.value.growth_factor;
    const newest_qubits = hardwareInputRef.value.selectedHardware.newest_qubits;
    const newest_year = hardwareInputRef.value.selectedHardware.newest_year;


    let hardwareString = `${name}_${hardwareSlowdown}_${quantum_improvement_rate}_${physical_logical_ratio}_${growth_factor}`;
    if (inputStore.hardwareSet.has(hardwareString)) {
        console.log("duplicate hardware entry flagged");
        return;
    }

    inputStore.createdHardwares[inputStore.totalCreated] =
    {
        hardwareString: hardwareString,
        name: name,
        hardwareSlowdown: hardwareSlowdown,
        quantum_improvement_rate: quantum_improvement_rate,
        physical_logical_ratio: physical_logical_ratio,
        growth_factor: growth_factor,
        newest_qubits: newest_qubits,
        newest_year: newest_year
    };
    inputStore.hardwareSet.add(hardwareString);
    inputStore.totalCreated += 1;

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
            
            <HardwareInput ref="hardwareInputRef"/>

            <button
                class="rounded-md bg-[#002D9D] px-4 py-2 text-sm font-medium text-white hover:bg-[#002D9D77] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75"
                @click="createHardware">Create Hardware
            </button>
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