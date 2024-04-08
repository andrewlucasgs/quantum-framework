<template>
    <div>
        <div class="table-responsive">
            <table class="min-w-full divide-y divide-gray-300 text-xs">
                <thead class="bg-gray-50">
                    <tr class="divide-x divide-gray-200 font-medium text-gray-500 text-xs">
                        <th>Roadmap</th>
                        <th>Year</th>
                        <th>Link</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 bg-white">
                    <tr class="divide-x divide-gray-200" v-for="reference in references" :key="reference.hardwareName">
                        <td>{{ reference.hardwareName }}</td>
                        <td>{{ reference.year }}</td>
                        <td><a target="_blank" rel="noopener noreferrer"
                             class="hover:underline" :href="reference.link">{{ reference.link }}</a></td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>

const references = [
    {
        hardwareName: "IBM (Superconducting)",
        year: 2024,
        link: "https://www.ibm.com/roadmaps/quantum.pdf",

    },
    {
        hardwareName: "IonQ (Trapped Ion)",
        year: 2024,
        link: "https://ionq.com/posts/how-we-achieved-our-2024-performance-target-of-aq-35",
    },
    {
        hardwareName: "QuEra (Neutral Atom)",
        year: 2024,
        link: "https://www.quera.com/qec",
    },
]
</script>