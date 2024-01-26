const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const mongoose = require("mongoose");
const {response} = require("express");

const password = process.argv[2]

morgan.token('post_body', (req) => {
    return JSON.stringify(req.body)
})

app.use(express.static('frontend'))
app.use(express.json())
app.use(morgan('tiny', {skip: (req, resp) => req.method === 'POST'}))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post_body',
    {skip: (req, res) => req.method !== 'POST'}))
app.use(cors())

const url =
    `mongodb+srv://fullstackopen:${password}@cluster0.iybkzer.mongodb.net/phonebookApp?retryWrites=true&w=majority`
mongoose.set('strictQuery', false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
    name: {type: String, unique: true},
    number: String,
})

const Person = mongoose.model('Person', personSchema)

app.get('/api/persons', (request, response, next) => {
    Person.find({}).then(persons => {
        response.json(persons)
    }).catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
    const id = request.params.id
    Person.findById(id).then(person => {
        if (person) {
            response.json(person)
        } else {
            response.status(404).send(`Entry not found for id ${id}`)
        }
    }).catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    const id = request.params.id
    Person.findByIdAndDelete(id).then(person => {
        if (person) {
            response.status(204).end()
        } else {
            response.status(404).send(`Entry not found for id ${id}`)
        }
    }).catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
    if (!request.body.name) {
        return response.status(400).json({error: 'name is missing'})
    }
    if (!request.body.number) {
        return response.status(400).json({error: 'number is missing'})
    }
    const person = new Person(request.body)
    person.save().then(result => {
        response.json(result)
    }).catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const id = request.params.id
    const name = request.body.name
    const number = request.body.number
    Person.findByIdAndUpdate(id, {name, number}, {new: true}).then(person => {
        if (person) {
            response.json(person)
        } else {
            response.status(404).send(`Entry not found for id ${id}`)
        }
    }).catch(error => next(error))
})

app.get('/info', (request, response, next) => {
    Person.countDocuments({}).then(count => {
        response.send(`<p>Phonebook has info for ${count} people</p><p>${new Date()}</p>`)
    }).catch(error => next(error))
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Phonebook server running on ${PORT}`)
})

app.use((error, request, response, next) => {
    console.error(error.message)
    if (error.name === 'CastError') {
        return response.status(400).send('malformatted id')
    } else {
        return response.status(500).send(`Internal error: ${error.name}`)
    }
})