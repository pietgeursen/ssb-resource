var t = require('tcomb')
var pull = require('pull-stream')

function Resource (type, sbot) {
  var typeString = type.meta.name
  var editTypeString = typeString + 'Edit'
  var deletedTypeString = typeString + 'Delete'

  var publishedType = type.extend({id: t.String, author: t.String})
  return {
    create: function (instance, cb) {
      publish(instance, type, typeString, cb)
    },
    update: function (instance, cb) {
      publish(instance, publishedType, editTypeString, cb)
    },
    created: function (opts) {
      var _opts = Object.assign({type: typeString, live: true}, opts)
      return pull(
        sbot.messagesByType(_opts),
        pull.map(mapPublishedObject)
      )
    },
    updated: function () {},
    publishedType: publishedType
  }
  function publish (instance, type, typeString, cb) {
    return pull(
      pull.once(instance),
      pull.map(function (obj) {
        return type.extend({type: t.String}).update(obj, {type: {$set: typeString}})
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
}

module.exports = Resource
