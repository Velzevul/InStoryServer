var mongoose = require('mongoose')
var getColors = require('get-image-colors')
var Q = require('q')
var History = require('./historyModel')

mongoose.connect(`mongodb://${process.env.INSTORY_SERVER_DB_USER}:${process.env.INSTORY_SERVER_DB_PASS}@${process.env.INSTORY_SERVER_DB_HOST}/${process.env.INSTORY_SERVER_DB_NAME}`)

History.findOne({userId: 'test'})
  .then(history => {
    const images = []
    const promises = []
    let counter = 0
    const limit = 5

    for (let image of history.images) {
      if ((!image.colors || image.colors.length === 0) && counter < limit) {
        images.push(image)
        promises.push(getColors(image.src))
        console.log(`${counter}: processing ${image._id}`)
        counter += 1
      }
    }

    console.log('------ start extraction --------')
    Q.all(promises)
      .then(responses => {
        console.log('------ extraction finished --------')
        for (let i = 0; i < responses.length; i++) {
          images[i].colors = responses[i].map(c => c.hsl())
        }

        history.save()
          .then(history => {
            console.log('Done!')
          })
      })
  })
