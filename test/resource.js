var test = require('tape')
var t = require('tcomb')
var pull = require('pull-stream')

var Resource = require('../')
var PersonType = t.struct({
  name: t.String
})
var Person = Resource(PersonType)

test('constructor', function (t) {
  t.end()
})

// async
test('create with valid resource keys', function (t) {
  Person.create({name: 'Piet'}, function (err, res) {
    t.error(err)
    t.equal(res.name, 'Piet')
    t.end()
  })
})

test('create without valid resource keys', function (t) {
  t.throws(function () {
    Person.create({}, function () {})
  })
  t.end()
})
// async
test.skip('find', function (t) {
  t.end()
})

// async
test.skip('get', function (t) {
  t.end()
})

// async
test('update', function (t) {
  Person.create({name: 'Piet'}, function (err, res) {
    t.error(err)
    Person.update({id: res.id, name: 'newName'}, function (err, updated) {
      t.error(err)
      t.equal(updated.id, res.id)
      t.equal(updated.name, 'newName')
      t.end()
    })
  })
})

test('multiple updates gets the most recent update', function (t) {
  Person.create({name: 'Piet'}, function (err, res) {
    t.error(err)
    Person.update({id: res.id, name: 'newName'}, function (err, updated) {
      t.error(err)
      Person.update({id: updated.id, name: 'newest'}, function (err, newest) {
        t.error(err)
        t.equal(newest.id, res.id)
        t.equal(newest.name, 'newest')
        t.end()
      })
    })
  })
})
// async
test.skip('delete', function (t) {
  t.end()
})

test('created emits when created succeds', function (t) {
  var name = 'Piet'
  pull(
    Person.created(),
    pull.take(1),
    pull.drain(function (person) {
      t.equal(person.name, name)
      t.end()
    })
  )
  Person.create({name: 'Piet'}, function (err, res) {
    t.error(err)
  })
})

test('updated', function (t) {
  pull(
    Person.updated(),
    pull.take(1),
    pull.drain(function (person) {
      t.equal(person.name, 'newName')
      t.end()
    })
  )
  Person.create({name: 'Piet'}, function (err, res) {
    t.error(err)
    Person.update({id: res.id, name: 'newName'}, function (err, res) {
      t.error(err)
    })
  })
})

test.skip('removed', function (t) {
  t.end()
})
