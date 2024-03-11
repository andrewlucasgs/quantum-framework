<script setup>
// import Models from '../components/Models.vue';
import {useModelsStore} from '../store/models';
import { defineAsyncComponent } from 'vue';

// import async models from '../store/models';
const Models = defineAsyncComponent(() => import('../components/Models.vue'));

const models = useModelsStore();

</script>

<template>
    <div class="flex flex-col h-screen w-full ">
        <div class=" bg-[#002D9D] py-4 px-8">
            <div class="mx-auto">
                <div class="flex gap-2 items-center">
                    <img src="/quantum-logo.png" class="h-8" alt="">
                    <h1 class=" text-white text-2xl font-medium">Quantum Economic Advantage Calculator</h1>
                </div>
            </div>
        </div>

        <div class="flex flex-col h-full">
            
            <div v-for="(model, modelIndex) in models.models" :key="model.id" >
                <Models :model="model"  />
            </div>
            <div class="mx-auto">
                <button @click="models.addModel" class="bg-[#002D9D] text-white rounded-lg p-2 m-4">Add Model</button>
            </div>
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