import { defineStore } from 'pinia'
import { ref,toRaw } from 'vue'

const modelTemplate = {

    problemName: 'Database Search',
    classicalRuntime: function(n) {return n},
    quantumRuntime: function(n) {return Math.sqrt(n)},
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
    const clone = Array.isArray(obj) ? [] : {};
  
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      clone[key] = (typeof value === "object" && value !== null) ? deepClone(value) : value;
    });
  
    return clone;
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

        models.value.push(clone)
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
