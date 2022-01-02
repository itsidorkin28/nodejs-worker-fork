const {Worker} = require('worker_threads')
const {fork} = require('child_process')
const {performance, PerformanceObserver} = require('perf_hooks')

const performanceObserver = new PerformanceObserver(items => {
    items.getEntries().forEach(entry => {
        console.log(`${entry.name}: ${entry.duration}`)
    })
})
performanceObserver.observe({entryTypes: ['measure']})

const workerFoo = array => {
    return new Promise((res, rej) => {
        performance.mark('worker start')
        const worker = new Worker('./worker.js', {
            workerData: {array}
        })
        worker.on('message', msg => {
            performance.mark('worker end');
            performance.measure('worker', 'worker start', 'worker end')
            res(msg)
        })
    })
}

const forkFoo = array => {
    return new Promise((res, rej) => {
        performance.mark('fork start')
        const forkProcess = fork('./fork.js')
        forkProcess.send({array})
        forkProcess.on('message', msg => {
            performance.mark('fork end')
            performance.measure('fork', 'fork start', 'fork end')
            res(msg)
        })
    })
}

const main = async () => {
    try {
        await workerFoo([25, 19, 48, 30])
        await forkFoo([25, 19, 48, 30])
    } catch (e) {
        console.error(e.message);
    }

}

main()