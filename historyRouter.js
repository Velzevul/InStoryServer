var express = require('express')
var History = require('./historyModel')
var moment = require('moment')
var getColors = require('get-image-colors')

var historyRouter = express.Router()

const notFound = (res, msg) => {
  res.status(404).json({
    success: false,
    data: {
      msg
    }
  })
}

// HISTORIES
// get or create history for a user
historyRouter.get('/:userId', (req, res) => {
  History.findOne({userId: req.params.userId})
    .then(history => {
      if (history) {
        history.lastCheck = Date.now()
        history.save()
        .then(history => {
          res.json({
            success: true,
            data: {
              history
            }
          })
        })
      } else {
        var newHistory = new History({
          userId: req.params.userId,
          lastCheck: Date.now()
        })
        newHistory.save()
          .then(history => {
            res.json({
              success: true,
              data: {
                history
              }
            })
          })
      }
    })
})

/* COLLECTIONS */

/* Add collection
@params
  req: {
    params: {
      userId
    },
    body: {
      collection
    }
  }
*/
historyRouter.post('/:userId/collections/', (req, res) => {
  History.findOne({userId: req.params.userId})
    .then(history => {
      if (history) {
        const newCollection = history.collections.create(Object.assign({}, req.body.collection, {
          timestamp: Date.now()
        }))

        history.collections = [newCollection, ...history.collections]
        history.save()
          .then(history => {
            res.json({
              success: true,
              data: {
                history
              }
            })
          })
      } else {
        notFound(res, `cannot find history for user ${req.params.userId}`)
      }
    })
})

/* Edit collection
@params
  req: {
    params: {
      userId,
      collectionId
    },
    body: {
      collection
    }
  }
*/
historyRouter.put('/:userId/collections/:collectionId', (req, res) => {
  History.findOne({userId: req.params.userId})
    .then(history => {
      if (history) {
        const collection = history.collections.find(c => c._id.equals(req.params.collectionId))

        if (collection) {
          Object.assign(collection, req.body.collection, {
            timestamp: Date.now()
          })

          history.save()
            .then(history => {
              res.json({
                success: true,
                data: {
                  history
                }
              })
            })
        } else {
          notFound(res, `cannot find collection ${req.params.collectionId}`)
        }
      } else {
        notFound(res, `cannot find history for user ${req.params.userId}`)
      }
    })
})

/* Add images to a collection
@params
  req: {
    params: {
      userId,
      collectionId
    },
    body: {
      imageIds
    }
  }
*/
historyRouter.post('/:userId/collections/:collectionId/images/', (req, res) => {
  History.findOne({userId: req.params.userId})
    .then(history => {
      if (history) {
        const images = history.images.filter(img => req.body.imageIds.indexOf(img._id.toString()) !== -1)

        for (let img of images) {
          if (img.collectionIds.indexOf(req.params.collectionId) === -1) {
            img.collectionIds.push(req.params.collectionId)
          }
        }

        history.save()
          .then(history => {
            res.json({
              success: true,
              data: {
                history
              }
            })
          })
      } else {
        notFound(res, `cannot find history for user ${req.params.userId}`)
      }
    })
})

/* Remove images from a collection
@params
  req: {
    params: {
      userId,
      collectionId
    },
    body: {
      imageIds
    }
  }
*/
historyRouter.delete('/:userId/collections/:collectionId/images/', (req, res) => {
  History.findOne({userId: req.params.userId})
    .then(history => {
      if (history) {
        const images = history.images.filter(img => req.body.imageIds.indexOf(img._id.toString()) !== -1)

        for (let img of images) {
          const collectionIndex = img.collectionIds.indexOf(req.params.collectionId)

          if (collectionIndex !== -1) {
            img.collectionIds = [...img.collectionIds.slice(0, collectionIndex),
              ...img.collectionIds.slice(collectionIndex + 1)]
          }
        }

        history.save()
          .then(history => {
            res.json({
              success: true,
              data: {
                history
              }
            })
          })
      } else {
        notFound(res, `cannot find history for user ${req.params.userId}`)
      }
    })
})

/* Delete collections
@params
  req: {
    params: {
      userId
    },
    body: {
    collectionIds: []
  }
  }
*/
historyRouter.delete('/:userId/collections/', (req, res) => {
  History.findOne({userId: req.params.userId})
    .then(history => {
      if (history) {
        for (let image of history.images) {
          image.collectionIds = image.collectionIds.filter(id => req.body.collectionIds.indexOf(id) === -1)
        }

        history.collections = history.collections.filter(c => req.body.collectionIds.indexOf(c._id.toString()) === -1)

        history.save()
          .then(history => {
            res.json({
              success: true,
              data: {
                history
              }
            })
          })
      } else {
        notFound(res, `cannot find history for user ${req.params.userId}`)
      }
    })
})

/* QUERIES */

/* Add query
@params
  req: {
    params: {
      userId
    },
    body: {
      query
    }
  }
*/
historyRouter.post('/:userId/queries/', (req, res) => {
  History.findOne({userId: req.params.userId})
    .then(history => {
      if (history) {
        console.log(req.body.query)

        const existingQuery = history.queries.find(q => {
          const queryTimestamp = moment(q.timestamp)

          return q.q === req.body.query.q &&
            queryTimestamp.date() === moment().date() &&
            queryTimestamp.month() === moment().month() &&
            queryTimestamp.year() === moment().year()
        })

        if (!existingQuery) {
          const newQuery = history.queries.create(Object.assign({}, req.body.query, {
            timestamp: Date.now()
          }))

          history.queries = [newQuery, ...history.queries]
        }

        history.save()
          .then(history => {
            res.json({
              success: true,
              data: {
                history
              }
            })
          })
      } else {
        notFound(res, `cannot find history for user ${req.params.userId}`)
      }
    })
})

/* Delete query
@params
  req: {
    params: {
      userId,
      queryId
    }
  }
*/
historyRouter.delete('/:userId/queries/:queryId', (req, res) => {
  History.findOne({userId: req.params.userId})
    .then(history => {
      if (history) {
        const query = history.queries.find(q => q._id.equals(req.params.queryId))

        if (query) {
          const queryIndex = history.queries.indexOf(query)

          history.images = history.images.filter(img => img.queryId !== req.params.queryId)
          history.queries = [...history.queries.slice(0, queryIndex),
                             ...history.queries.slice(queryIndex + 1)]

          history.save()
          .then(history => {
            res.json({
              success: true,
              data: {
                history
              }
            })
          })
        } else {
          notFound(res, `cannot find query ${req.params.queryId}`)
        }
      } else {
        notFound(res, `cannot find history for user ${req.params.userId}`)
      }
    })
})

/* Delete queries
@params
  req: {
    params: {
      userId
    },
    body: {
      queryIds: []
    }
  }
*/
historyRouter.delete('/:userId/queries/', (req, res) => {
  History.findOne({userId: req.params.userId})
    .then(history => {
      if (history) {
        history.images = history.images
          .filter(img => req.body.queryIds.indexOf(img.queryId) === -1)
        history.queries = history.queries
          .filter(query => req.body.queryIds.indexOf(query._id.toString()) === -1)

        history.save()
          .then(history => {
            console.log('saved')
            res.json({
              success: true,
              data: {
                history
              }
            })
          })
      } else {
        notFound(res, `cannot find history for user ${req.params.userId}`)
      }
    })
})

/* IMAGES */

/* Delete images
@params
  req: {
    params: {
      userId
    },
    body: {
      imageIds
    }
  }
*/
historyRouter.delete('/:userId/images/', (req, res) => {
  History.findOne({userId: req.params.userId})
    .then(history => {
      if (history) {
        history.images = history.images.filter(img => req.body.imageIds.indexOf(img._id.toString()) === -1)

        history.save()
          .then(history => {
            res.json({
              success: true,
              data: {
                history
              }
            })
          })
      } else {
        notFound(res, `cannot find history for user ${req.params.userId}`)
      }
    })
})

/* Add image
@params
  req: {
    params: {
      userId
    },
    body: {
      query
      image
    }
  }
*/
historyRouter.post('/:userId/images/', (req, res) => {
  History.findOne({userId: req.params.userId})
    .then(history => {
      if (!history) {
        history = new History({
          userId: req.params.userId,
          lastCheck: Date.now()
        })
      }

      let query = history.queries.find(q => {
        const queryTimestamp = moment(q.timestamp)

        return q.q === req.body.query.q &&
          queryTimestamp.date() === moment().date() &&
          queryTimestamp.month() === moment().month() &&
          queryTimestamp.year() === moment().year()
      })

      if (!query) {
        query = history.queries.create(Object.assign({}, req.body.query, {
          timestamp: Date.now()
        }))

        history.queries = [query, ...history.queries]
      }

      let image = history.images.find(img => {
        return query._id.equals(img.queryId) &&
          img.src === req.body.image.src
      })

      if (image) {
        Object.assign(image, req.body.image, {
          timestamp: Date.now()
        })

        history.save()
          .then(history => {
            res.json({
              success: true,
              data: {
                history
              }
            })
          })
      } else {
        getColors(req.body.image.src)
          .then(colors => {
            image = history.images.create(Object.assign(req.body.image, {
              queryId: query._id,
              timestamp: Date.now(),
              colors: colors.map(c => c.hsl())
            }))

            history.images = [image, ...history.images]

            history.save()
              .then(history => {
                res.json({
                  success: true,
                  data: {
                    history
                  }
                })
              })
          })
      }
    })
})

module.exports = historyRouter
