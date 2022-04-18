import '../src/db/mongoose.js'
import Task from '../src/models/task.js'

// 6258e59c804ec7de1567206a

// Task.findByIdAndDelete('6258e5bef007314f473cd811').then((task) => {
//     console.log(task)

//     return Task.countDocuments({completed: false})
// }).then((result) => {
//     console.log(result)
// }).catch((e) => {
//     console.log(e)
// })

const deleteTaskAndCount = async (id) => {
    await Task.findByIdAndDelete(id)
    const remainingTasksCount = await Task.countDocuments({ completed: false })
    return remainingTasksCount
}

deleteTaskAndCount('6258f9ef81673749d38ea14f').then((res) => {
    console.log('Total remaining tasks:', res)
}).catch((err) => {
    console.log(err)
})