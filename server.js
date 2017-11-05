'use strict';

var fs = require('fs');
var express = require('express');
var axios = require('axios');
var app = express();



app.use('/public', express.static(process.cwd() + '/public'));

// 

app.route('/new/*').get((req, res) => {
    var data, shortUrl;
    var site = req.params[0];
    
    var htmlRegEx = /((http(s)?:\/\/)([a-zA-Z0-9\-]+\.)+([a-zA-Z0-9\-]+\.)+[a-z]{2,13}[\.\?\=\&\%\/\w\-]*\b([^@]|$))/g;
    // console.log('request received');
    if (htmlRegEx.test(site)) {
      axios.get('http://jsonbin.io/b/' + process.env.SECRET + '/latest')
      .then(response => {
        data = response.data.data;
        shortUrl = data.length;
        console.log('data retrieved');
        data.push({
          shortUrl: shortUrl,
          site: site
        });
        pushData(JSON.stringify({data: data}));
      }).catch(error => {
      res.json({error});
      })
    } else {
      res.json({
        error: site + " is not a complete URL. Please format the url like 'http://www.example.com'"
      });
    }
  
  function pushData(data) {
    console.log('entered push');
    axios.post('http://jsonbin.io/b/update/' + process.env.SECRET, { snippet: data })
    .then(reponse => {
      // console.log('data posted');
      res.json({
        site: site,
        shortUrl: 'https://small-sidecar.glitch.me/' + shortUrl
      });
    }).catch(error => {
      res.json({error});
    });
  }
});

app.route('/:shortUrl').get((req, res) => {
  var short = req.params.shortUrl;
  axios.get('http://jsonbin.io/b/' + process.env.SECRET + '/latest')
  .then(response => {
    var data = response.data.data;
    var match = data.find((item) => { return item.shortUrl == short });
    if (match == undefined) {
      // console.log('site undefined');
      res.json({
        error: "No short URL found for " + "'/" + short + "'"
      });
    } else {
      res.redirect(match.site);
    }
   
    
  })
  .catch(error => {
    console.log(error);
  });
});

app.route('/')
    .get(function(req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
   })

app.listen(process.env.PORT, function () {
  console.log('Node.js listening ...');
});

