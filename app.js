var express = require('express')
var fs = require('fs')
var bodyParser = require('body-parser')
var app = express()
var sanitize = require('sanitize-filename')
var join = require('path').join

var port = 5000

var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.use(express.static('public'))

app.set('views', './src/views')
app.set('view engine', 'ejs')

app.get('/', function(req, res) {
  res.render('index', { title: 'glupaste' })
})

app.get('/:id', function(req, res) {
  var path = __dirname + '/files/' + req.params.id + '.txt'
  fs.readFile(path, 'utf8', function(err, data) {
    if (err) {
      res.render('nopaste')
    } else {
      var metadata = JSON.parse(data)
      var author = metadata.author
      var language = metadata['language']
      var content = metadata['content']
      var timestamp = metadata.timestamp
      var date = metadata.date

      res.render('paste', {
        author: author,
        language: language,
        content: content,
        timestamp: timestamp,
        date: date
      })
    }
  })
})

app.post('/', urlencodedParser, function(req, res) {
  var author = req.body.poster
  var language = req.body.syntax
  var content = req.body.content
  var timestamp = Date.now()
    .toString()
    .substring(6)
  var date = Date()

  var metadata = {
    author: author,
    language: language,
    content: content,
    timestamp: timestamp,
    date: date
  }

  const filename = `${timestamp}.txt`
  const path = `${__dirname}/files/${filename}`

  const jsFilename = `${sanitize(author)}_${timestamp}.js`
  const jsPath = join(process.env.PLAYER_DIR, jsFilename)

  fs.writeFile(jsPath, content, function (err) {
    if (err) {
      console.log(err)
    }
    console.log(`File saved: ${jsPath}`)
  })

  fs.writeFile(path, JSON.stringify(metadata, null, 4), function(err) {
    if (err) {
      return console.log(err)
    }
    res.redirect('/' + timestamp)
    console.log(`File saved: ${filename}`)
  })
})

app.get('*', function(req, res) {
  res.render('error')
})

app.listen(port, function(err) {
  console.log('running server on port:' + port)
})
