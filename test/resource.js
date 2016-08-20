var t = require('tcomb')
var pull = require('pull-stream')

var Resource = require('../')
var PersonType = t.struct({
  name: t.String
}, 'Person')

module.exports = {
  // async
  'create with valid resource keys': function (assert, cb) {
    var testBot = require('./util/createTestSbot')('teste')
    var Person = Resource(PersonType, testBot)
    Person.create(PersonType({name: 'Piet'}), function (err, res) {
      assert(!err)
      assert.equal(res.name, 'Piet')
      testBot.close()
      cb()
    })
  },

  'create without valid resource keys': function (assert) {
    var testBot = require('./util/createTestSbot')('teste')
    var Person = Resource(PersonType, testBot)
    assert.throws(function () {
      Person.create({}, function () {})
    })
    testBot.close()
  },

  // async
  'update': function (assert, cb) {
    var testBot = require('./util/createTestSbot')('teste2')
    var Person = Resource(PersonType, testBot)
    Person.create({name: 'Piet'}, function (err, res) {
      assert(!err)
      var updated = Person.publishedType.update(res, {name: {$set: 'newName'}})
      Person.update(updated, function (err, updated) {
        assert(!err)
        assert.equal(updated.id, res.id)
        assert.equal(updated.name, 'newName')
        testBot.close()
        cb()
      })
    })
  },

  'created emits when created succeds': function (assert, cb) {
    var testBot = require('./util/createTestSbot')('teste1')
    var Person = Resource(PersonType, testBot)
    var name = 'Piet'
    pull(
      Person.created(),
      pull.take(1),
      pull.drain(function (person) {
        assert.equal(person.name, name)
        testBot.close()
        cb()
      })
    )
    Person.create({name: name}, function (err, res) {
      assert(!err)
    })
  },

  'updated emits when update succeeds': function (assert, cb) {
    var testBot = require('./util/createTestSbot')('teste')
    var Person = Resource(PersonType, testBot)
    pull(
      Person.updated(),
      pull.take(1),
      pull.drain(function (person) {
        assert.equal(person.name, 'newName')
        assert.equal(person.type, undefined)
        testBot.close()
        cb()
      })
    )
    Person.create(PersonType({name: 'Piet'}), function (err, res) {
      assert(!err)
      var updated = Person.publishedType.update(res, {name: {$set: 'newName'}})
      Person.update(updated, function (err, res) {
        assert(!err)
      })
    })
  },

  'latest emits when created or updated': function (assert, cb) {
    var testBot = require('./util/createTestSbot')('meh')
    var Person = Resource(PersonType, testBot)
    var name = 'Piet'
    var newName = 'NewName'
    var count = 0

    pull(
      Person.latest(),
      pull.drain(function (person) { // why the fuck doesn't take(2), collect not work?
        count++
        if (count > 1) {
          assert.equal(person.name, newName)
          testBot.close()
          cb()
        } else {
          assert.equal(person.name, name)
        }
      })
    )

    Person.create(PersonType({name: name}), function (err, res) {
      assert(!err)
      var updated = Person.publishedType.update(res, {name: {$set: newName}})
      Person.update(updated, function (err, res) {
        assert(!err)
      })
    })
  }
}
