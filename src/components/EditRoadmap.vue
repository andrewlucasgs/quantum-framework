<template>
    <Dialog title="Roadmap" button-label="Advanced options" ref="dialog" @save="save" @cancel="cancel" @reset="reset"
        classes="max-w-7xl" @openModal="updateValues">
        <template v-slot:button="{ openModal }">
            <slot :openModal="openModal" />
        </template>


        <template #content>
            <div class="flex">
                <div class="overflow-y-scroll flex-1">

                    <table class="w-full table-auto mt-4">
                        <thead class="bg-gray-100">
                            <tr class="text-left">
                                <th>Year</th>
                                <th># of Physic Qubits</th>
                            </tr>
                        </thead>
                        <tbody class="text-left">
                            <tr v-for="(roadmap, index) in roadmapData" :key="index">
                                <td class="">
                                    <input class="border" type="number" v-model="roadmap.year" />
                                </td>
                                <td>
                                    <input class="border" type="number" v-model="roadmap.qubits" />
                                </td>
                            </tr>
                            <button @click="roadmapData.push({ year: '', qubits: '' })">Add</button>
                        </tbody>
                    </table>
                </div>
                <div class="flex-1">
                    <QubitsRoadmap
                        :data="Object.fromEntries(roadmapData.filter(roadmap => roadmap.year && roadmap.qubits).map(roadmap => ([Number(roadmap.year), roadmap.qubits])))" />
                </div>

            </div>

        </template>
    </Dialog>
</template>

<script setup>
import Dialog from './Dialog.vue';
import { computed, onMounted, ref, watch } from 'vue';
import QubitsRoadmap from './QubitsRoadmap.vue';

const dialog = ref(null);
const roadmapData = ref(null);
const props = defineProps({
    roadmap: Object,
});

function updateValues() {

    roadmapData.value = Object.entries(props.roadmap).map(([key, value]) => {
        return {
            year: key,
            qubits: value
        }
    });
}

function save() {
    const newRoadmap = roadmapData.value.sort((a, b) => a.year - b.year)
        .reduce((acc, curr) => {
            if (curr.year && curr.qubits)
                acc[curr.year] = curr.qubits;
            return acc;
        }, {});

    emit("updateRoadmap", newRoadmap);
    dialog.value.closeModal();
}

function cancel() {
    dialog.value.closeModal();
}

function reset() {
    roadmapData.value = Object.entries(props.roadmap).map(([key, value]) => {
        return {
            year: key,
            qubits: value
        }
    });
}

const emit = defineEmits(['updateRoadmap'])

</script>
