const Discord = require("discord.js");
//const logger = require('winston');
//const botSettings = require("./settings.json");
var environment = 'remote';

var botSettings;

if(typeof process.env.token === 'undefined'){
  botSettings = require('./settings.json');
  environment = 'local';
}

var twitch_client_id, bot_token, yt_api_key, prefix;

if(environment == 'local'){
  twitch_client_id = botSettings.twitch_api;
  bot_token = botSettings.token;
  yt_api_key = botSettings.youtube_api;
  prefix = botSettings.prefix;
}else{
  twitch_client_id = process.env.twitch_api;
  bot_token = process.env.token;
  yt_api_key = process.env.youtube_api;
  prefix = process.env.prefix;
}

var darksunlive = false;

interval = 20 * 1000;

function checkStreamStatus(stream_name){
  console.log("checking stream status of: " + stream_name);
  if(darksunlive == true){ console.log("already live"); return;}
  var request = require("request");

  var options = { method: 'GET',
    url: `https://api.twitch.tv/kraken/streams/${stream_name}`,
    headers: {
      'Client-ID': twitch_client_id
    }
  }

  request(options, function(error, response, body){
    let jsonResponse = JSON.parse(body);

    if(jsonResponse.stream != null){
      darksunlive = true;
      //console.log(jsonResponse.stream);
      let embed = new Discord.RichEmbed()
          //.setAuthor(message.author.usernam)
          .setAuthor(jsonResponse.stream.channel.display_name, jsonResponse.stream.channel.logo)
          //.setDescription(jsonResponse.stream.channel.display_name + " is streaming: ")
          .setColor("#9B59B6")
          .setDescription("**Playing**: " + jsonResponse.stream.game)
          .setTitle(jsonResponse.stream.channel.status)
          .setURL(jsonResponse.stream.channel.url)
          .setImage(jsonResponse.stream.preview.medium)

      let channel = bot.channels.find("name", "general");
      //console.log(channel);
      channel.send("Now Live: " + jsonResponse.stream.channel.display_name + "! @here");
      channel.send(embed);
    }
  })

}

const bot = new Discord.Client({disableEveryone: true});

bot.on("ready", async () => {
    console.log(`Bot is ready! ${bot.user.username}`);

    try {
        let link = await bot.generateInvite(["ADMINISTRATOR"]);
        console.log(link);
    } catch(e) {
        console.log(e.stack);
    }

});

bot.on("message", async message => {

    if(message.author.bot) return;
    if(message.channel.type === "dm") return;

    let messageArray = message.content.split(" ");
    let command = messageArray[0];

    if(!command.startsWith(prefix)) return;

    //returns back top video id result
    function searchYoutube(query){

    }

    switch(command) {
        // case `${prefix}ping`:
        //   message.channel.send(`${message.author.toString()}`);
        //   break;

        case `${prefix}youtube`:
          const voiceChannel = message.member.voiceChannel;
          const ytdl = require('ytdl-core');
          const streamOptions = { seek: 0, volume: .5 };

          let query = message.content.substring(prefix + 1, message.content.length)

          console.log("Making request");

          var request = require("request");

          var options = { method: 'GET',
            url: 'https://www.googleapis.com/youtube/v3/search',
            qs:
             {
               'maxResults': '1',
               'part': 'snippet',
               'q': query,
               'type': 'video',
               'key': yt_api_key
             }
          }
          //default vals
          var video_id = "vjUqUVrXclE";
          var video_title = "ayy thats pretty good"

          //make request for stuff
          request(options, function (error, response, body) {
            let jsonResponse = JSON.parse(body);
            //console.log(body);
            video_id = jsonResponse.items[0].id.videoId;
            video_title = jsonResponse.items[0].snippet.title;

            voiceChannel.join()
              .then(connection => {
                const stream = ytdl('https://www.youtube.com/watch?v=' + video_id, { filter : 'audioonly' });
                //message.channel.send(message.author.username + " requested: " + video_title);
                let embed = new Discord.RichEmbed()
                    //.setAuthor(message.author.usernam)
                    .setDescription(message.author.username + " Has Requested: ")
                    .setColor("#9B59B6")
                    .addField("Video", video_title)

                message.channel.send(embed);

                const dispatcher = connection.playStream(stream, streamOptions);
              })
              .catch(console.error);
          })


          break;

        case `${prefix}status`:
            if(messageArray.length != 2){ message.channel.send("`useage: !status <channel-name>`"); return;}

            var request = require("request");
            var channel_name = messageArray[1];

            var options = { method: 'GET',
              url: `https://api.twitch.tv/kraken/streams/${channel_name}`,
              headers: {
                'Client-ID': twitch_client_id
              }
            }

            request(options, function(error, response, body){
              let jsonResponse = JSON.parse(body);

              if(jsonResponse.stream != null){
                //console.log(jsonResponse.stream);
                let embed = new Discord.RichEmbed()
                    //.setAuthor(message.author.usernam)
                    .setAuthor(jsonResponse.stream.channel.display_name, jsonResponse.stream.channel.logo)
                    //.setDescription(jsonResponse.stream.channel.display_name + " is streaming: ")
                    .setColor("#9B59B6")
                    .setDescription("**Playing**: " + jsonResponse.stream.game)
                    .setTitle(jsonResponse.stream.channel.status)
                    .setURL(jsonResponse.stream.channel.url)
                    .setImage(jsonResponse.stream.preview.medium)

                message.channel.send(embed);
              }else{
                let embed = new Discord.RichEmbed()
                  .setAuthor(channel_name)
                  .setColor("#9B59B6")
                  .setDescription("This channel is offline!")
                  message.channel.send(embed);
              }
            })

            break;

        case `${prefix}novoice`:
        case `${prefix}spotify`:
            message.channel.send("In Development");
            break;

    }
});


bot.login(bot_token).then((token) => {
  //checkStreamStatus("darksunlive");
  setInterval(function(){ checkStreamStatus("PGL_Dota2") }, interval);
}).catch(console.error);
