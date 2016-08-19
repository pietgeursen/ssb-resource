var t = require('tcomb')
var push = require('pull-pushable')
var pull = require('pull-stream')

function Resource (type, sbot) {
  var updated = push()
  var publishedType = type.extend({id: t.String, author: t.String})
  return {
    create: function (instance, cb) {
      pull(
        pull.once(instance),
        pull.map(function (obj) {
          obj.type = type.meta.name
          return obj
        }),
        pull.map(type.extend({type: t.String})),
        pull.asyncMap(function (obj, cb) {
          sbot.publish(obj, cb)
        }),
        pull.map(mapPublishedObject),
        pull.map(publishedType),
        pull.drain(function (obj) {
          cb(null, obj)
        })
      )
    },
    update: function (instance, cb) {
      var obj = publishedType(instance)
      cb(null, obj)
      updated.push(obj)
    },
    created: function (opts) {
      var _opts = Object.assign({type: type.meta.name, live: true}, opts)
      return pull(
        sbot.messagesByType(_opts),
        pull.map(mapPublishedObject)
      )
    },
    updated: function () {
      return updated
    },
    publishedType: publishedType
  }
}
function mapPublishedObject (published) {
  return Object.assign(
    {},
    {
      id: published.key,
      author: published.value.author
    },
    published.value.content
  )
}

module.exports = Resource
