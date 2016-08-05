import Twit from 'twit';
import mysql from 'mysql';

// Access Token and access token secret Twitter
let T = new Twit({
  consumer_key:         '31lM0JUOS33Q84Sro9tXUbEtN'
  , consumer_secret:      'RV4T0Tl3BwiSl46KFA7V9ApwWT6ChosUlqFIcwQOYEvbYeHq1c'
  , access_token:         '1522666332-ik3HhDSCsHMu2Cwu17wo9QEIvze4RR6hO4zsvcc'
  , access_token_secret:  'T9e8J4SHrh1Xm36nEUe5ObpQTR0hWkBgpYWuPMqfhXW6u'
})
// Param Conection DB (mysql)
let connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  database : 'twitter_stream'
});

// Conect Mysql
connection.connect();

//Config filter
let stream = T.stream('statuses/filter', { track: '#BuenViernes', language: 'es' })

//Listener Stream
stream.on('tweet', (tweet)  => {
  //console.log(tweet)
  console.log("ID: "+ tweet.id + " TEXT: "+ tweet.text +" USER: "+ tweet.user.screen_name)

  var tweet  = {id_tweet: tweet.id, id_tweet_str: tweet.id_str, text: tweet.text, id_user_str: tweet.user.id_str,followers_count: tweet.user.followers_count ,favourites_count: tweet.user.favourites_count,profile_image_url: tweet.user.profile_image_url , screen_name: tweet.user.screen_name,description: tweet.user.description, created_at: tweet.created_at, timestamp_ms: tweet.timestamp_ms };

  try {
    connection.beginTransaction((err) => {
      if (err) { throw err; }

      connection.query('INSERT INTO feed SET ?', tweet , (err, result) => {
        if (err) {
          return connection.rollback(function() {
            throw err;
          });
        }
        connection.commit((err) => {
          if (err) {
            return connection.rollback(() => {
              throw err;
            });
          }
          console.log('Registro afectado: ' + result.affectedRows);
        });

      });
    });
  }catch(err) {
    console.log("ERROR: " + err);
  }
})

// Event disconnect
stream.on('disconnect', (disconnectMessage) => {
  console.log("Desconectado");
})

// Event connected
stream.on('connected', (response) => {
  console.log("Conectado Twitter API Stream: " + response.statusCode);
})
