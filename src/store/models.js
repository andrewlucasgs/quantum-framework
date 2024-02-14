import { defineStore } from 'pinia'
import { ref, toRaw } from 'vue'

const modelTemplate = {
    id: 1,
    problemName: "Database Search",
    classicalRuntime: (n) => n,
    quantumRuntime: (n) => n / 2,
    classicalRuntimeLabel: "O(n)",
    quantumRuntimeLabel: "O(\\sqrt{n})",
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

            deepClone(modelTemplate)
        ]
    )

    function addModel() {
        const model = deepClone(modelTemplate)
        model.id = Math.max(...models.value.map(m => m.id)) + 1
        models.value.push(model)
        // i = current scroll position
        var i = window.scrollY;
        var int = setInterval(function () {
            window.scrollTo(0, i);
            i += 20;
            if (i >= document.body.scrollHeight) clearInterval(int);
        }, 10);

    }

    function removeModel(id) {
        models.value = models.value.filter(m => m.id !== id)
    }


    function duplicateModel(id) {
        const model = models.value.find(m => m.id === id)
        const clone = deepClone(model)
        clone.id = Math.max(...models.value.map(m => m.id)) + 1
        clone.roadmap = JSON.parse(JSON.stringify(model.roadmap))

        models.value.push(clone)
        // scroll to bottom
        var i = window.scrollY;
        var int = setInterval(function () {
            window.scrollTo(0, i);
            i += 20;
            if (i >= document.body.scrollHeight) clearInterval(int);
        }, 10);
    }

    function updateModel(id, model) {
        models.value = models.value.map(m => m.id === id ? model : m)
    }

    return {
        models,
        updateModel,
        addModel,
        removeModel,
        duplicateModel
    }
})
