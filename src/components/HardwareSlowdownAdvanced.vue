<template>
    <Dialog title="Hardware Slowdown" button-label="Advanced options"
    ref="dialog"
    @save="save"
    @cancel="cancel"
    @reset="reset"
    @openModal="updateValues"
    >
    <template v-slot:button="{openModal}">
        <slot :openModal="openModal" />
    </template>


        <template #content>
            <div class="flex flex-col">
                <label class="font-medium text-lg" for="speed">Speed</label>
                <p class="text-xs text-gray-600">The ratio of the speed of a classical computer
                    divided by the speed of the quantum computer.</p>
                <div class="flex items-center justify-between w-full gap-2">
                    <input class="flex-1 accent-[#002D9D]" type="range" id="speed" v-model="speed" min="1" max="100000" />
                    <input class="bg-gray-100 p-2 rounded-lg text-center w-1/5" type="number" id="speed" v-model="speed" />
                </div>

            </div>
            <div class="mt-4">
                <label class="font-medium text-lg" for="gateOverhead">Gate Overhead</label>
                <p class="text-xs text-gray-600">The gate overhead (i.e. additional calculations) that a quantum computer
                    needs to take to maintain
                    its error correction.</p>
                <div class="flex items-center justify-between w-full gap-2">
                    <input class="flex-1 accent-[#002D9D]" type="range" id="gateOverhead" v-model="gateOverhead" min="1" max="1000" />
                    <input class="bg-gray-100 p-2 rounded-lg text-center w-1/5" type="number" id="gateOverhead"
                        v-model="gateOverhead" />
                </div>

            </div>
            <div class="mt-4">
                <label class="font-medium text-lg" for="algorithmConstant">Algorithm Constant</label>
                <p class="text-xs text-gray-600">
                    The ratio of the multiplicative constant from
                    the classical algorithm's time complexity divided by that
                    from the quantum algorithm's.
                </p>
                <div class="flex items-center justify-between w-full gap-2">
                    <input class="flex-1 accent-[#002D9D]" type="range" id="algorithmConstant" v-model="algorithmConstant" min="1"
                        max="10" />
                    <input class="bg-gray-100 p-2 rounded-lg text-center w-1/5" type="number" id="algorithmConstant"
                        v-model="algorithmConstant" />
                </div>

            </div>
            <div class="mt-4">
                <p class="text-xs text-gray-600">
                    Source: <a href="https://arxiv.org/abs/2310.15505">https://arxiv.org/abs/2310.15505</a>
                </p>

            </div>

            <div class="mt-4 text-center">
                <h2 class="italic font-medium">Speed x Gate Overhead x Alg. Constant =</h2>
                <h2 class="font-medium text-2xl">10<sup>{{ hwSlowdown }}</sup></h2>

            </div>
        </template>
    </Dialog>
</template>

<script setup>
import Dialog from './Dialog.vue';
import { computed, onMounted, ref, watch } from 'vue';
import { useDialogInputStore } from '../store/dialogInputs.js';

const dialogInputStore = useDialogInputStore();
const dialog = ref(null);

const speed = ref(10000);
const gateOverhead = ref(100);
const algorithmConstant = ref(1);

const hwSlowdown = computed(() => {
    return Math.round(Math.log10(speed.value*gateOverhead.value*algorithmConstant.value)*100)/100;
})

function updateValues (){
    speed.value = dialogInputStore.hardwareSlowdownAdvancedOptions.speed;
    gateOverhead.value = dialogInputStore.hardwareSlowdownAdvancedOptions.gateOverhead;
    algorithmConstant.value = dialogInputStore.hardwareSlowdownAdvancedOptions.algorithmConstant;
}

function save (){
    dialogInputStore.hardwareSlowdownAdvancedOptions = {
        speed: speed.value,
        gateOverhead: gateOverhead.value,
        algorithmConstant: algorithmConstant.value
    }

    emit("updateSlowdown", hwSlowdown.value);
    dialog.value.closeModal();   
}

function cancel (){
    dialog.value.closeModal();   
}

function reset (){
    speed.value = 10000;
    gateOverhead.value = 100;
    algorithmConstant.value = 1;
}

const emit = defineEmits(['updateSlowdown'])

</script>
