<script setup>
// import Models from '../components/Models.vue';
import {useModelsStore} from '../store/models';
import { defineAsyncComponent,onMounted, ref } from 'vue';


// import async models from '../store/models';
const Models = defineAsyncComponent(() => import('../components/Models.vue'));
const Documentation = defineAsyncComponent(() => import('../components/Documentation.vue'));

const models = useModelsStore();
const currentView = ref('index');
const views = {
    index: 'index',
    documentation: 'documentation',
}




// watch hash change
onMounted(() => {
    const hash = window.location.hash;
    if (hash === '#documentation') {
        currentView.value = views.documentation;
    } else {
        currentView.value = views.index;
    }
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash;
        if (hash === '#documentation') {
            currentView.value = views.documentation;
        } else {
            currentView.value = views.index;
        }
    });
});


</script>

<template>
    <div class="flex flex-col h-screen w-full ">
        <div class=" bg-[#002D9D] py-4 px-8">
            <div class="mx-auto flex flex-wrap justify-between gap-4 items-center">
                <div class="flex  gap-2 items-center">
                    <img src="/quantum-logo.png" class="h-8" alt="">
                    <h1 class=" text-white text-2xl font-medium">Quantum Economic Advantage Calculator</h1>
                </div>                
                <div class="space-x-8">
                    <a href="#" class="text-white hover:underline">Calculator</a>
                    <a href="#documentation" class="text-white hover:underline">How does it work?</a>
                </div>
            </div>
        </div>
            <div v-if="currentView === views.index">
                <p class="max-w-7xl mx-auto px-2 text-gray=900 text-lg text-justify my-4"> The Quantum Economic Advantage Calculator is designed to allow users to explore different
            combinations of algorithmic problems and quantum hardware. Users can freely deviate from known projections
            and default parameters to derive their own insights as to the general timeline of when certain scenarios may
            become economically advantageous to run on a quantum machine. </p>
                <div class="flex flex-col flex-1">
                    
                    <div v-for="(model, modelIndex) in models.models" :key="model.id" >
                        <Models :model="model"  />
                    </div>
                    <div class="mx-auto">
                        <button @click="models.addModel" class="bg-[#002D9D] text-white rounded-lg p-2 m-4">Add Model</button>
                    </div>
                </div>
            </div>
            <div v-else-if="currentView === views.documentation">
                <Documentation />
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