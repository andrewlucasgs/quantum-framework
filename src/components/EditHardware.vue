<template>
    <Dialog title="Edit" button-label="Edit Hardware"
    ref="dialog"
    @save="save"
    @cancel="cancel"
    @reset="reset"
    >
    <template v-slot:button="{openModal}">
        <slot :openModal="openModal" />
    </template>

        <template #content>
            <HardwareInput ref="hardwareInputRef"  :hardware-index="props.hardwareIndex" />
            
        </template>
    </Dialog>
</template>

<script setup>
import Dialog from './Dialog.vue';
import { computed, ref, watch } from 'vue';
import { useInputStore } from '../store/input.js';
import HardwareInput from './HardwareInput.vue';

const props = defineProps(["hardwareIndex"])

const inputStore = useInputStore();
const dialog = ref(null);

const hardwareInputRef = ref(null);

function save() {
    let hardware = inputStore.createdHardwares[props.hardwareIndex];

    const name = hardwareInputRef.value.selectedHardware.name;
    const hardwareSlowdown = hardwareInputRef.value.hardwareSlowdown;
    const quantum_improvement_rate = hardwareInputRef.value.quantum_improvement_rate;
    const physical_logical_ratio = hardwareInputRef.value.physical_logical_ratio;
    const growth_factor = hardwareInputRef.value.growth_factor;
    const newest_qubits = hardwareInputRef.value.selectedHardware.newest_qubits;
    const newest_year = hardwareInputRef.value.selectedHardware.newest_year;    

    let newHardwareString = `${name}_${hardwareSlowdown}_${quantum_improvement_rate}_${physical_logical_ratio}_${growth_factor}`;
    if (hardware.hardwareString === newHardwareString) { //implies that parameters are the same after editing
        // dialog.value.closeModal();   
    }
    else if (inputStore.hardwareSet.has(newHardwareString)) { //implies that the edit will create a duplicate
        //TELL THE USER A DUPLICATE HAS OCCURRED
        console.log("duplicate hardware edit flagged")
        // dialog.value.closeModal();   
    }
    else {
        inputStore.hardwareSet.delete(hardware.hardwareString) //remove pre-edit hardware string
        inputStore.hardwareSet.add(newHardwareString)

        inputStore.createdHardwares[props.hardwareIndex] = 
        {
            name: name,
            hardwareSlowdown: hardwareSlowdown,
            quantum_improvement_rate: quantum_improvement_rate,
            physical_logical_ratio: physical_logical_ratio,
            growth_factor: growth_factor,
            newest_qubits: newest_qubits,
            newest_year: newest_year
        }
    }


    dialog.value.closeModal();   
}

function cancel() {
    dialog.value.closeModal();  
    reset(); 
}

function reset() {
    let hardware = inputStore.createdHardwares[props.hardwareIndex];
    let hardwares = hardwareInputRef.value.hardwares;

    for (let i = 0; i < hardwares.length; i++) { //loop matches selectedHardware to input one by name
        if (hardwares[i].name === hardware.name) {
            hardwareInputRef.value.selectedHardware = hardwares[i];
            break;
        }
    }

    hardwareInputRef.value.hardwareSlowdown = hardware.hardwareSlowdown;
    hardwareInputRef.value.quantum_improvement_rate = hardware.quantum_improvement_rate;
    hardwareInputRef.value.physical_logical_ratio = hardware.physical_logical_ratio;
    hardwareInputRef.value.growth_factor = hardware.growth_factor;
}

</script>
