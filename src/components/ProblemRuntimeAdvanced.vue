<template>
    <Dialog title="Runtime Functions" ref="dialog" @save="save" @cancel="cancel" @reset="reset"
        @openModal="updateValues" classes="max-w-xl">
        <template v-slot:button="{ openModal }">
            <slot :openModal="openModal" />
        </template>

        <template #content>
            <div class="flex flex-col gap-4">
                <div>
                    <label class="font-medium text-sm" for="classicalRuntimeInput">Classical Runtime</label>
                    <input type="text" v-model="classicalRuntimeInput" class="w-full border rounded p-2"
                        @input="validateInput('classicalRuntimeInput')" />
                    <!-- <div  class="mt-1" v-html="renderKaTeX(classicalRuntimeInput)"></div> -->
                    <div class="flex items-center justify-center gap-2 bg-gray-100 p-2 rounded-lg">
                        <p v-if="errors.classicalRuntimeInput" class="text-red-500 text-xs">Invalid expression</p>
                        <span v-if="!errors.classicalRuntimeInput" v-html="renderKaTeX(classicalRuntimeInput)"></span>
                    </div>
                </div>

                <div>
                    <label class="font-medium text-sm" for="classicalWork">Classical Work</label>
                    <input type="text" v-model="classicalWork" class="w-full border rounded p-2"
                        @input="validateInput('classicalWork')" />
                    <div class="flex items-center justify-center gap-2 bg-gray-100 p-2 rounded-lg">
                        <p v-if="errors.classicalWork" class="text-red-500 text-xs">Invalid expression</p>
                        <span v-if="!errors.classicalWork" v-html="renderKaTeX(classicalWork)"></span>
                    </div>
                </div>

                <div>
                    <label class="font-medium text-sm" for="quantumRuntimeInput">Quantum Runtime</label>
                    <input type="text" v-model="quantumRuntimeInput" class="w-full border rounded p-2"
                        @input="validateInput('quantumRuntimeInput')" />
                    <div class="flex items-center justify-center gap-2 bg-gray-100 p-2 rounded-lg">
                        <p v-if="errors.quantumRuntimeInput" class="text-red-500 text-xs">Invalid expression</p>
                        <span v-if="!errors.quantumRuntimeInput" v-html="renderKaTeX(quantumRuntimeInput)"></span>
                    </div>
                </div>

                <div>
                    <label class="font-medium text-sm" for="quantumWork">Quantum Work</label>
                    <input type="text" v-model="quantumWork" class="w-full border rounded p-2"
                        @input="validateInput('quantumWork')" />
                    <div class="flex items-center justify-center gap-2 bg-gray-100 p-2 rounded-lg">
                        <p v-if="errors.quantumWork" class="text-red-500 text-xs">Invalid expression</p>
                        <span v-if="!errors.quantumWork" v-html="renderKaTeX(quantumWork)"></span>
                    </div>
                </div>
            </div>

            <div>
                <label class="font-medium text-sm" for="penaltyInput">Connectivity Penalty</label>
                <input type="text" v-model="penaltyInput" class="w-full border rounded p-2"
                    @input="validateInput('penaltyInput')" />
                <div class="flex items-center justify-center gap-2 bg-gray-100 p-2 rounded-lg">
                    <p v-if="errors.penaltyInput" class="text-red-500 text-xs">Invalid expression</p>
                    <span v-if="!errors.penaltyInput" v-html="renderKaTeX(penaltyInput)"></span>
                </div>
            </div>
        </template>
    </Dialog>
</template>

<script setup>
import Dialog from './Dialog.vue';
import { ref, computed, watch } from 'vue';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import * as math from 'mathjs';

const emit = defineEmits(['updateFunctions']);

const dialog = ref(null);

const props = defineProps({
    classicalRuntimeInput: String,
    quantumRuntimeInput: String,
    penaltyInput: String,
    classicalWork: String,
    quantumWork: String,

});

const classicalRuntimeInput = ref(props.classicalRuntimeInput);
const quantumRuntimeInput = ref(props.quantumRuntimeInput);
const penaltyInput = ref(props.penaltyInput);
const classicalWork = ref(props.classicalWork);
const quantumWork = ref(props.quantumWork);

const errors = ref({
    classicalRuntimeInput: false,
    quantumRuntimeInput: false,
    penaltyInput: false,
    classicalWork: false,
    quantumWork: false,
});

const hasErrors = computed(() => Object.values(errors.value).some(error => error));

function updateValues() {
    classicalRuntimeInput.value = props.classicalRuntimeInput;
    quantumRuntimeInput.value = props.quantumRuntimeInput;
    penaltyInput.value = props.penaltyInput;
    classicalWork.value = props.classicalWork;
    quantumWork.value = props.quantumWork;
    validateAllInputs();
}

function reset() {
    updateValues(); // Reset inputs to initial values when modal was opened
}

function save() {
    if (!hasErrors.value) {
        emit('updateFunctions', {
            classicalRuntimeInput: classicalRuntimeInput.value,
            quantumRuntimeInput: quantumRuntimeInput.value,
            penaltyInput: penaltyInput.value,
            classicalWork: classicalWork.value,
            quantumWork: quantumWork.value,
        });
        dialog.value.closeModal();
    }
}

function cancel() {
    dialog.value.closeModal();
}

function validateInput(inputName) {
    const scope = { n: 1, q: 1 };

    try {
        const compiled = math.compile(eval(inputName).value);
        compiled.evaluate(scope); // Evaluate expression with scope
        errors.value[inputName] = false;
    } catch {
        errors.value[inputName] = true;
    }
}

function validateAllInputs() {
    validateInput('classicalRuntimeInput');
    validateInput('quantumRuntimeInput');
    validateInput('penaltyInput');
    validateInput('classicalWork');
    validateInput('quantumWork');
}

function renderKaTeX(input) {
    try {
        const expression = math.parse(input).toTex();
        return katex.renderToString(expression, { throwOnError: false });
    } catch {
        return '';
    }
}

</script>

<style scoped>
input {
    font-family: monospace;
}
</style>
