var express = require('express');
var Log = require('./logModel');

var logRouter = express.Router();

const notFound = (res, msg) => {
  res.status(404).json({
    success: false,
    data: {
      msg
    }
  })
};

logRouter.get('/:userId/', (req, res) => {
  Log.findOne({userId: req.params.userId})
    .then(log => {
      if (log) {
        res.json({
          success: true,
          data: {
            log
          }
        })
      } else {
        notFound(res, `cannot find log for ${req.params.userId}`)
      }
    });
});

logRouter.post('/:userId/', (req, res) => {
  Log.findOne(({userId: req.params.userId}))
    .then(log => {
      if (log) {
        var newLogItem = log.items.create(Object.assign(
          {}, 
          req.body.log, 
          {
            timestamp: Date.now()
          }
        ));

        log.items = [newLogItem, ...log.items];
        log.save()
          .then(log => {
            res.json({
              success: true,
              data: {
                log
              }
            });
          });
      } else {
        var newLog = new Log({
          userId: req.params.userId,
          items: [
            Object.assign({}, req.body.log, {
              timestamp: Date.now()
            })
          ]
        })

        newLog.save()
          .then(log => {
            res.json({
              success: true,
              data: {
                log
              }
            });
          });
      }
    });
});

module.exports = logRouter;