<template>
    <div class="max-w-prose mx-auto my-8 px-4">
        <h1 class="text-3xl font-bold text-gray-800 mb-6 text-center" id="Models">Team</h1>
        
        <p class="text-center mb-8">
            The Quantum Economic Advantage Calculator is a collaboration between MIT FutureTech and Accenture. The team is comprised of:
        </p>
        
        <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div v-for="member in teamMembers" :key="member.name" class="flex flex-col items-center bg-gray-50 p-6 rounded-lg shadow-md">
                <img v-if="member.image" :src="member.image" alt="Team member photo" class="w-24 h-24 rounded-full mb-4 object-cover object-top shadow-lg">
                <div v-else class="w-24 h-24 rounded-full mb-4 bg-gray-200 shadow-lg"></div>
                <h2 class="text-lg font-semibold text-gray-800">{{ member.name }}</h2>
                <p class="text-sm text-gray-600">{{ member.affiliation }}</p>
            </div>
        </div>
    </div>
</template>

<script setup>
const teamMembers = [
    {
        name: 'Frederick Mejia',
        image: '/654bb5d93f6840c86a2fea17_headshot - Fred Mejia-p-500.png',
        affiliation: 'MIT FutureTech',
    },
    {
        name: 'Andrew Souza',
        image: '/650353ea2e6029b3cea2ee24_andrew-lucas-p-500.jpg',
        affiliation: 'MIT FutureTech',
    },
    {
        name: 'Neil Thompson',
        image: '/650353e37ba6cf9c37b2db67_neil-thompson.jpg',
        affiliation: 'MIT FutureTech',
    },
    {
        name: 'Jayson Lynch',
        image: '/650353e88fadc59390b6639b_jayson-lynch-p-500.jpg',
        affiliation: 'MIT FutureTech',
    },
    {
        name: 'Hans Gundlach',
        image: '/660c392f18a635bb348acc70_profilemay2023 - Hans Gundlach-p-500.png',
        affiliation: 'MIT FutureTech',
    },
    {
        name: 'Hrvoje Kukina',
        image: '/6616978ed50987169fb845b7_hrvoje_picture - Hrvoje Kukina-p-500.jpg',
        affiliation: 'MIT FutureTech',
    },
];
</script>
