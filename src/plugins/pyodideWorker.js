export default {
    install: (app, options) => {
        const worker = new Worker(new URL('./pyodide.worker.js', import.meta.url))
        app.provide('pyodide', (python) => {
            return new Promise((resolve, reject) => {
                worker.onmessage = (event) => {
                    resolve(event.data)
                }
                worker.onerror = (error) => {
                    reject(error)
                }
                worker.postMessage({ python })
            })
        })
    }
}