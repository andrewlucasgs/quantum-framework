<template>
    <div class="flex flex-col gap-8 text-center">
        <div v-for="reference in references" :key="reference.problemName">
            <h2 class="text-xs text-left font-bold mb-2">{{ reference.problemName }}</h2>

            <table class="min-w-full divide-y divide-gray-300">
                <thead class="bg-gray-50">

                    <tr class="divide-x divide-gray-200 font-medium text-gray-500 text-xs">
                        <th></th>
                        <th>Classical</th>
                        <th>Quantum</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 bg-white">

                    <tr class="divide-x divide-gray-200">
                        <td class="font-medium text-gray-500 text-xs ">Reference</td>
                        <td><a target="_blank" rel="noopener noreferrer" class="flex gap-1 text-xs hover:underline items-center justify-center"
                                :href="reference.classicalReferenceLink">{{ reference.classicalReferenceTitle }} <svg
                                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                    stroke-width="1.5" stroke="currentColor" class="w-3 h-3">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                </svg>
                            </a></td>
                        <td><a target="_blank" rel="noopener noreferrer" class="flex gap-1 text-xs hover:underline items-center justify-center"
                                :href="reference.quantumReferenceLink">{{ reference.quantumReferenceTitle }} <svg
                                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                    stroke-width="1.5" stroke="currentColor" class="w-3 h-3">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                </svg>
                            </a></td>
                    </tr>
                    <tr class="divide-x text-xs divide-gray-200">
                        <td class="font-medium text-gray-500 text-xs">Runtime</td>
                        <td v-html="katex.renderToString(reference.classicalRuntimeLabel)"></td>
                        <td v-html="katex.renderToString(reference.quantumRuntimeLabel)"></td>
                    </tr>
                </tbody>

            </table>
        </div>

    </div>
</template>

<script setup>
import katex from 'katex';
import 'katex/dist/katex.min.css';

const references = [
    {
        problemName: "Database Search",
        classicalRuntimeLabel: "O(n)",
        classicalReferenceTitle: "Grover's Algorithm",
        classicalReferenceLink: "https://en.wikipedia.org/wiki/Grover%27s_algorithm",

        quantumRuntimeLabel: "O(\\sqrt{n})",
        quantumReferenceTitle: "Grover's Algorithm",
        quantumReferenceLink: "https://en.wikipedia.org/wiki/Grover%27s_algorithm",
    },
    {
        problemName: "Integer Factorization",
        classicalRuntimeLabel: "O(e^{(64/9 * n)^{1/3} * \\ln(n)^{2/3}})",
        classicalReferenceTitle: "General Number Field Sieve",
        classicalReferenceLink: "https://en.wikipedia.org/wiki/General_number_field_sieve",


        quantumRuntimeLabel: "O(n^{2} * \\ln(n))",
        quantumReferenceTitle: "Shor's Algorithm",
        quantumReferenceLink: "https://en.wikipedia.org/wiki/Shor%27s_algorithm",
    },
    {
        problemName: "Traveling Salesman",
        classicalRuntimeLabel: "O(n^{3} * 2^{n})",
        classicalReferenceTitle: "Dynamic Programming",
        classicalReferenceLink: "https://en.wikipedia.org/wiki/Dynamic_programming",

        quantumRuntimeLabel: "O(n * 1.78^{n})",
        quantumReferenceTitle: "Quantum Approximate Optimization Algorithm",
        quantumReferenceLink: "https://en.wikipedia.org/wiki/Quantum_approximate_optimization_algorithm",
    },
    {
        problemName: "Time Dependent Hartree-Fock Approximation (Quantum Chemistry)",
        classicalRuntimeLabel: "O(n^{3})",
        classicalReferenceTitle: "Hartree-Fock Approximation",
        classicalReferenceLink: "https://en.wikipedia.org/wiki/Hartree%E2%80%93Fock_method",

        quantumRuntimeLabel: "O(n)",
        quantumReferenceTitle: "Variational Quantum Eigensolver",
        quantumReferenceLink: "https://en.wikipedia.org/wiki/Variational_quantum_eigensolver",
    },
    {
        problemName: "Full Configuration Interaction (Quantum Chemistry)",
        classicalRuntimeLabel: "O(n!)",
        classicalReferenceTitle: "Full Configuration Interaction",
        classicalReferenceLink: "https://en.wikipedia.org/wiki/Full_configuration_interaction",

        quantumRuntimeLabel: "O(n^{11})",
        quantumReferenceTitle: "Quantum Phase Estimation",
        quantumReferenceLink: "https://en.wikipedia.org/wiki/Quantum_phase_estimation_algorithm",
    },
]
</script>