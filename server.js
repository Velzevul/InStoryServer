var Sequelize = require('sequelize')
var sequelize = new Sequelize('InStory', 'InStory', 'InStory', {
  host: 'localhost',
  dialect: 'mysql'
})

sequelize.define('User', {
  userName: {
    type: Sequelize.STRING,
    field: 'user_name'
  },
  password:
}, {
  
})
