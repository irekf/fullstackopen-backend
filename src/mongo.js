const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('give password as argument')
    process.exit(1)
}

const password = process.argv[2]

if (process.argv.length === 4) {
    console.log('provide a name and phone number')
    process.exit(1)
}
if (process.argv.length > 5) {
    console.log('too many arguments (max 3)')
    process.exit(1)
}

const url =
    `mongodb+srv://fullstackopen:${password}@cluster0.iybkzer.mongodb.net/phonebookApp?retryWrites=true&w=majority`
mongoose.set('strictQuery', false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Person = mongoose.model('Person', personSchema)

const name = process.argv[3]
const number = process.argv[4]
if (name) {
    const person = new Person({ name, number })
    person.save().then((result) => {
        console.log('Entry added:')
        console.log(result)
        mongoose.connection.close()
    })
} else {

    Person.find({}).then(result => {
        console.log('Phonebook:')
        result.forEach(person => {
            console.log(person.name, person.number)
        })
        mongoose.connection.close()
    })

}
