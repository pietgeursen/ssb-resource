var t = require('tcomb')
var push = require('pull-pushable')

function Resource (type) {
  var id = 0
  var created = push()
  var updated = push()
  var publishedType = type.extend({id: t.Integer })
  return {
    create: function (instance, cb) {
      var obj = publishedType(Object.assign({}, instance, {id: id++}))
      cb(null, obj)
      created.push(obj)
    },
    update: function (instance, cb) {
      var obj = publishedType(instance)
      cb(null, obj)
      updated.push(obj)
    },
    created: function () {
      return created
    },
    updated: function () {
      return updated
    }
  }
}

module.exports = Resource
