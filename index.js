var t = require('tcomb')
var pull = require('pull-stream')

function Resource (type, sbot) {
  var typeString = type.meta.name
  var editTypeString = typeString + 'Edit'
  var deletedTypeString = typeString + 'Delete'

  var publishedType = type.extend({type: t.String, id: t.String, author: t.String})
  return {
    create: function (instance, cb) {
      pull(
        pull.once(instance),
        pull.map(function (obj) {
          obj.type = typeString
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
      pull(
        pull.once(instance),
        pull.map(publishedType),
        pull.map(function (obj) {
          return publishedType.update(obj, {type: {$set: editTypeString}})
        }),
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
    created: function (opts) {
      var _opts = Object.assign({type: typeString, live: true}, opts)
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
