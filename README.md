# [WIP] SSB-Resource

## Why?
I've been working on [this]() and it's been making me want an easier way of managing resources and relationships on top of scuttlebot

## Dream api
Given some tcomb type that describes your resource:
```javascript
import pull from 'pull-stream'
import Resource from 'ssb-resource'

const Gathering = t.struct({
  id: t.String
  author: t.String, 
  dateTime: t.String,
  description: t.String,
  imageUrl: t.maybe(t.String),
  location: t.String,
  title: t.String,
  type: t.String,
}, 'Gathering')

const GatheringResource = Resource(Gathering)

GatheringResource.create({
 description: "Party at mine" 
 ...
})

pull(
  GatheringResource.created(),
  pull.log() //emits new gathering
)
```
