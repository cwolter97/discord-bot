const Discord = require("discord.js");
//const logger = require('winston');
//const botSettings = require("./settings.json");
var environment = 'remote';

var botSettings;

if(typeof process.env.token === 'undefined'){
  botSettings = require('./settings.json');
  environment = 'local';
}

const prefix = "!";

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

        case `${prefix}youtube`:
          const voiceChannel = message.member.voiceChannel;
          const ytdl = require('ytdl-core');
          const streamOptions = { seek: 0, volume: .5 };

          let query = message.content.substring(prefix + 1, message.content.length)

          console.log("Making request");

          if(environment == 'local'){
            const yt_api_key = botSettings.youtube_api;
          }else{
            const yt_api_key = process.env.youtube_api;
          }

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

            if(environment == 'local'){
              var twitch_client_id = botSettings.twitch_api;
            }else{
              var twitch_client_id = process.env.twitch_api;
            }

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

if(environment == 'local'){
  bot.login(botSettings.token);
}else{
  bot.login(process.env.token);
}
