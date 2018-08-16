import Twit from 'twit';
import Sentiment from 'sentiment';
var twitterT = require('twitter-text')
let config = require('./config.json');
let app = require('express')();
let http = require('http').Server(app);
let io = require('socket.io')(http);

// Access Token and access token secret Twitter
let T = new Twit({
  consumer_key: config.twitter.consumer_key
  , consumer_secret: config.twitter.consumer_secret
  , access_token: config.twitter.access_token
  , access_token_secret: config.twitter.access_token_secret
})

const sentiment = new Sentiment();

//Main route
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

//Declare socket connection
io.on('connection', function (socket) {
  console.log('WS connected');
});

//Listen express
http.listen(3000, function () {
  console.log('listening on *:3000');
});


//Config filter
let stream = T.stream('statuses/filter', { track: '#ArianaCarpool', language: 'en' });

//Listener Stream
stream.on('tweet', (tweet) => {
  //console.log(tweet)
  console.log("ID: " + tweet.id + " TEXT: " + tweet.text + " USER: " + tweet.user.screen_name)

  console.log("NEW TEXT : " + cleanTXT(tweet.text));
  const result = sentiment.analyze(tweet.text);

  var tweet = {
    id_tweet: tweet.id,
    id_tweet_str: tweet.id_str,
    text: tweet.text,
    id_user_str: tweet.user.id_str,
    followers_count: tweet.user.followers_count,
    favourites_count: tweet.user.favourites_count,
    profile_image_url: tweet.user.profile_image_url,
    screen_name: tweet.user.screen_name,
    description: tweet.user.description,
    created_at: tweet.created_at,
    timestamp_ms: tweet.timestamp_ms,
    score: result.score
  };
  io.emit('twitter', tweet);

})

// Event disconnect
stream.on('disconnect', (disconnectMessage) => {
  console.log("Desconectado");
})

// Event connected
stream.on('connected', (response) => {
  console.log("Conectado Twitter API Stream: " + response.statusCode);
})

const cleanTXT = function (txt) {
  txt = txt.replace("RT", "");
  txt = txt.replace(":", "");

  const urlIndexes = twitterT.extractUrlsWithIndices(txt);
  const hashtagIndexes = twitterT.extractHashtagsWithIndices(txt);
  const entitiesIndexes = twitterT.extractEntitiesWithIndices(txt);
  let textUrl = '';
  if (urlIndexes.length > 0) {
    textUrl = txt.substring(urlIndexes[0].indices[0], urlIndexes[0].indices[1]);
    txt = txt.replace(textUrl, "");
  }
  if (hashtagIndexes.length > 0) {
    textUrl = txt.substring(hashtagIndexes[0].indices[0], hashtagIndexes[0].indices[1]);
    txt = txt.replace(textUrl, "");

  }
  if (entitiesIndexes.length > 0) {
    textUrl = txt.substring(entitiesIndexes[0].indices[0], entitiesIndexes[0].indices[1]);
    txt = txt.replace(textUrl, "");

  }
  return txt;
}