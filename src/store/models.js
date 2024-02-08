import { defineStore } from 'pinia'
import { ref } from 'vue'

const modelTemplate = {

    problemName: 'Database Search',
    classicalRuntime: (n) => n,
    quantumRuntime: (n) => Math.sqrt(n),
    classicalRuntimeLabel: 'O(n)',
    quantumRuntimeLabel: 'O(sqrt(n))',

    hardwareName: 'IBM',
    roadmap: {
        2021: 127,
        2022: 433,
        2023: 1121,
        2024: 1386,
        2025: 4158,
        2033: 100000

    },
    hardwareSlowdown: 6,
    quantumImprovementRate: 50,
    physicalLogicalQubitsRatio: 1000


}

function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj
    }

    const temp = obj.constructor()

    for (let key in obj) {
        temp[key] = deepClone(obj[key])
    }

    return temp
}

export const useModelsStore = defineStore('models', () => {
    const models = ref(
        [

            modelTemplate
        ]
    )

    function addModel() {
        models.value.push(modelTemplate)
    }

    function removeModel(modelIndex) {
        models.value.splice(modelIndex, 1)
    }


    function duplicateModel(modelIndex) {
        const clone = deepClone(models.value[modelIndex])
        models.value.splice(modelIndex, 0, clone)
    }

    function updateModel(modelIndex, model) {
        models.value[modelIndex] = model
    }

    return {
        models,
        updateModel,
        addModel,
        removeModel,
        duplicateModel
    }
})
