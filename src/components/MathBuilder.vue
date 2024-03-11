<script setup>
import { ref, onMounted, computed } from 'vue';
import { create, all } from 'mathjs'
import katex from 'katex';
import 'katex/dist/katex.min.css';
const math = create(all, {
    log: true,
})

const formula = ref('sqrt(n)');
const parsedFormula =computed(() => math.parse(formula.value));
const tex = computed(() =>{
    // replace log() with log10()
    return parsedFormula.value.toTex().replace(/\\log\(/g, '\\log_{10}(');
});


</script>

<template>
    <div class="flex flex-col">
        <h1>Math Builder</h1>
        <input type="text" v-model="formula" />
        <span v-html="katex.renderToString(`O(${tex})`)"></span>
        
    </div>
</template>