import '../src/db/mongoose.js'
import User from '../src/models/user.js'

// 6255a96ed3f4cffab334f4a6

// User.findByIdAndUpdate('6255a96ed3f4cffab334f4a6', {age: 15}).then((user) => {
//     console.log(user)

//     return User.countDocuments({age: 15})
// }).then((result) => {
//     console.log(result)
// }).catch((e) => {
//     console.log(e)
// })

const updateAgeAndCount = async (id, age) => {
    const user = await User.findByIdAndDelete(id, { age })
    const count = await User.countDocuments({ age })
    return count
}

updateAgeAndCount('625a535bf448dcd98b248af9', 15).then((count) => {
    console.log(`Amount of user with age of 15:`, count)
}).catch((err) => {
    console.log('Error:', err)
})