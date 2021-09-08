

class APIScheduleFlow {

  constructor(page) {
    page.on('request', request => {

    });

    page.on('response', response => {

    })

    this.taskQueue = [];
  }


  config(config) {
    for (const url in config) {
      if (Object.hasOwnProperty.call(config, url)) {
        const options = config[url];
        this.taskQueue.push(this.createTask(url, options))
      }
    }
  }

  createTask(url, options) {
    return () => {
      return Promise.resolve()
    }
  }

  execTasks(tasks) {
    return tasks.reduce(function (promise, task) {
      return promise.then(task)
    }, Promise.resolve())
  }

}


