<template>
    <Dialog title="Hardware Slowdown" button-label="Advanced options"
    ref="dialog"
    @save="save"
    @cancel="cancel"
    @reset="reset"
    @openModal="updateValues"
    classes="max-w-xl"
    >
    <template v-slot:button="{openModal}">
        <slot :openModal="openModal" />
    </template>


        <template #content>
            <div class="flex flex-col">
                <label class="font-medium text-sm" for="speed">Speed</label>
                <p class="text-xs text-gray-600">The ratio of the speed of a classical computer
                    divided by the speed of the quantum computer.</p>
                
                <div>
                    <input type="radio" id="simple" value="simple" v-model="speedInput" />
                    <label for="simple"> Simple </label>
                    <input type="radio" id="manual" value="manual" v-model="speedInput" />
                    <label for="manual"> Manual </label>
                </div>
                
                <div v-if="speedInput === 'manual'">
                    <div>
                        2 Qubit Gate Time: <input class="bg-gray-100 p-2 rounded-lg text-center w-1/5" type="number" id="gateTime" v-model="gateTime" /> ns <br>
                        Classical CPU GHz: <input class="bg-gray-100 p-2 rounded-lg text-center w-1/5" type="number" id="cpuGHz" v-model="cpuGHz" /> GHz <br>
                        Speed Ratio: {{ manualSpeed }}
                    </div>

                </div>
                <div v-else>
                    <div class="flex items-center justify-between w-full gap-2">
                        <input class="flex-1 accent-[#002D9D]" type="range" id="speed" v-model="speed" min="1" max="100000" />
                        <input class="bg-gray-100 p-2 rounded-lg text-center w-1/5" type="number" id="speed" v-model="speed" />
                    </div>
                </div>
                

            </div>
            <div class="mt-4">
                <label class="font-medium text-sm" for="gateOverhead">Gate Overhead</label>
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
                <label class="font-medium text-sm" for="algorithmConstant">Algorithm Constant</label>
                <p class="text-xs text-gray-600">
                    The ratio of the multiplicative constant from
                    the classical algorithm's time complexity divided by that
                    from the quantum algorithm's.
                </p>
                <div class="flex items-center justify-between w-full gap-2">
                    <input class="flex-1 accent-[#002D9D]" type="range" id="algorithmConstant" v-model="algorithmConstant" min="0.1"
                        max="2" step="0.1" />
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

const speedInput = ref("simple");
const gateTime = ref(100)
const cpuGHz = ref(5)

const manualSpeed = computed(() => {
    return gateTime.value * cpuGHz.value
})

const speed = ref(10000);

const gateOverhead = ref(100);
const algorithmConstant = ref(1);

const hwSlowdown = ref(6);

watch([() => [speedInput.value, manualSpeed.value, speed.value, gateOverhead.value, algorithmConstant.value], () => {
    if (speedInput.value === "manual") {
        hwSlowdown.value = Math.round(Math.log10(manualSpeed.value*gateOverhead.value*algorithmConstant.value)*100)/100;
    }
    else {
        hwSlowdown.value = Math.round(Math.log10(speed.value*gateOverhead.value*algorithmConstant.value)*100)/100;
    }
}])

// const hwSlowdown = computed(() => {
//     console.log("in")
//     if (speedInput === "manual") {
//         console.log("top")
//         return Math.round(Math.log10(manualSpeed.value*gateOverhead.value*algorithmConstant.value)*100)/100;
//     }
//     else {
//         console.log("bot")
//         return Math.round(Math.log10(speed.value*gateOverhead.value*algorithmConstant.value)*100)/100;
//     }
// })

function updateValues (){
    speed.value = dialogInputStore.hardwareSlowdownAdvancedOptions.speed;
    gateOverhead.value = dialogInputStore.hardwareSlowdownAdvancedOptions.gateOverhead;
    algorithmConstant.value = dialogInputStore.hardwareSlowdownAdvancedOptions.algorithmConstant;
    gateTime.value = dialogInputStore.hardwareSlowdownAdvancedOptions.gateTime;
    cpuGHz.value = dialogInputStore.hardwareSlowdownAdvancedOptions.cpuGHz;
}

function save (){
    dialogInputStore.hardwareSlowdownAdvancedOptions = {
        speed: speed.value,
        gateOverhead: gateOverhead.value,
        algorithmConstant: algorithmConstant.value,
        gateTime: gateTime.value,
        cpuGHz: cpuGHz.value,
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
    gateTime.value = 100;
    cpuGHz.value = 5;
}

const emit = defineEmits(['updateSlowdown'])

</script>
