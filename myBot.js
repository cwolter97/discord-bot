const Discord = require("discord.js");
//const logger = require('winston');
const botSettings = require("./settings.json");

console.log(botSettings.token);

const prefix = botSettings.prefix;

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

    switch(command) {

        case `${prefix}spotify`:

            break;
            //the following command was created by JD Stocksett
        case `${prefix}weather`:
            console.log("Checking zip");

            let zipCode = messageArray[1];

            console.log(`Zip is ${zipCode}`);

            var request = require("request");

            var options = { method: 'GET',
              url: 'http://api.openweathermap.org/data/2.5/weather',
              qs:
               { zip: `${zipCode},us`,
                 appid: 'c9b9747a481872999cf199acc6bec4ff',
                 units: 'imperial' }
                }

            console.log("Making request");

            request(options, function (error, response, body) {
              if (error) throw new Error(error);

              console.log(body);

              let jsonResponse = JSON.parse(body);

              message.channel.send(`The weather is currently ${jsonResponse.main.temp} degrees in ${jsonResponse.name}.`);
            })
            break;
            //the following command was created by JD Stocksett
        case `${prefix}gifme`:
            let tag = message.content.substring(command.length+1 ,message.content.length);

            console.log(tag);

            var request = require("request");

            var options = { method: 'GET',
              url: 'http://api.giphy.com/v1/gifs/random',
              qs: { tag: `${tag}`, api_key: '33RGz8gaeEWlZBnitnrtjD261dzk5iyj' }
            }

            let msg = await message.channel.send("Generating...");

            request(options, function (error, response, body) {
                if (error) throw new Error(error);

                let jsonResponse = JSON.parse(body);
                let embedURL = jsonResponse.data.embed_url;
                let gifURL = jsonResponse.data.images.original.url;

                let msgEmbed = new Discord.RichEmbed()
                    .setURL(embedURL)
                    .setImage(gifURL)
                    .setTitle(`${message.author.username}'s ${tag} gif:`)

                try{
                    message.channel.send({embed: msgEmbed});
                } catch (e) {
                    console.log(e.stack);
                }
                    /*
                    try {
                        message.channel.send({embed:{
                            title:`Your ${tag} gif`,
                            url:`${embedURL}`,
                            image: {
                                "url": `${gifURL}`

                        }}});
                    } catch(e) {
                       console.log(e.stack);
                    }
                    */
                msg.delete();
            });
            break;

    }
});


bot.login(botSettings.token);
