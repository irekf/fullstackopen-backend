const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const mongoose = require("mongoose");

const password = process.argv[2]

morgan.token('post_body', (req) => {
    return JSON.stringify(req.body)
})

app.use(morgan('tiny', {skip: (req, resp) => req.method === 'POST'}))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post_body',
    {skip: (req, res) => req.method !== 'POST'}))
app.use(express.json())
app.use(cors())
app.use(express.static('frontend'))

const url =
    `mongodb+srv://fullstackopen:${password}@cluster0.iybkzer.mongodb.net/phonebookApp?retryWrites=true&w=majority`
mongoose.set('strictQuery', false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
    name: {type: String, unique: true},
    number: String,
})

const Person = mongoose.model('Person', personSchema)

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    }).catch((error) => {
        response.status(500).send(`Internal error: ${error}`)
    })
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    Person.findById(id).then(person => {
        if (person) {
            response.json(person)
        } else {
            response.status(404).send(`Entry not found for id ${id}`)
        }
    }).catch(error => {
        response.status(500).send(`Internal error: ${error}`)
    })
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    Person.findByIdAndDelete(id).then(person => {
        if (person) {
            response.status(204).end()
        } else {
            response.status(404).send(`Entry not found for id ${id}`)
        }
    }).catch(error => {
        response.status(500).send(`Internal error: ${error}`)
    })
})

app.post('/api/persons', (request, response) => {
    if (!request.body.name) {
        return response.status(400).json({error: 'name is missing'})
    }
    if (!request.body.number) {
        return response.status(400).json({error: 'number is missing'})
    }
    const person = new Person(request.body)
    person.save().then(result => {
        response.json(result)
    }).catch(error => {
        response.status(500).send(`Internal error: ${error}`)
    })
})

app.get('/info', (request, response) => {
    Person.countDocuments({}).then(count => {
        response.send(`<p>Phonebook has info for ${count} people</p><p>${new Date()}</p>`)
    }).catch(error => {
        response.status(500).send(`Internal error: ${error}`)
    })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Phonebook server running on ${PORT}`)
})