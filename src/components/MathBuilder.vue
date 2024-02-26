<script setup>
import { ref, onMounted, computed } from 'vue';
import { create, all } from 'mathjs'
import katex from 'katex';
import 'katex/dist/katex.min.css';
const math = create(all, {
    log: true,
})

function convertMathjsObjectToJsFunc(mathjsObj) {
    function convertNode(node) {
        switch (node.type) {
            case 'OperatorNode':
                const args = node.args.map(convertNode);

                if (node.op === '^') {
                    // Exponentiation turns into multiplication on the log scale
                    return `(${args[1]} * Math.log10(${args[0]}))`;
                } else {
                    // All other operators are the same
                    return `(${args.join(node.op)})`;
                }
                break;

            case 'SymbolNode':
                // Variables are represented as is, assuming they are already in log scale
                return `(${node.name})`;

            case 'ConstantNode':
                // Constants are taken the log of directly
                return `(${node.value})`;

            case 'FunctionNode':
                if (node.name === 'sqrt') {
                    // Square root becomes halving on the log scale
                    return `(Math.sqrt(${convertNode(node.args[0])}))`;
                } else if (node.name === 'log') {
                    // Logarithm becomes the natural logarithm on the log scale
                    return `(Math.log10(${convertNode(node.args[0])}))`;
                } else if (node.name === 'pow') {
                    // Power becomes the exponentiation on the log scale
                    return `(Math.pow(${convertNode(node.args[0])}, ${convertNode(node.args[1])}))`;
                } else if (node.name === 'exp') {
                    // Exponential becomes the exponentiation on the log scale
                    return `(Math.exp(${convertNode(node.args[0])}))`;
                } else {
                    throw new Error(`Unsupported function: ${node.name}`);
                }
                break;

            default:
                throw new Error(`Unsupported node type: ${node.type}`);
        }
    }

    const body = convertNode(mathjsObj);
    console.log(body);
    const funcStr = `function(n) { return Math.log10(${body}); }`;

    return eval(`(${funcStr})`);
}

const formula = ref('sqrt(n)');
const parsedFormula =computed(() => math.parse(formula.value));
const func = computed(() => convertMathjsObjectToJsFunc(parsedFormula.value));
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
        <span>10<sup>{{func(10**12).toFixed(2)}}</sup></span>
        <span>{{func}}</span>    

    </div>
</template>