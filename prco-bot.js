const Discord = require('discord.js');
const auth = require('./auth.json');
const ytdl = require('ytdl-core');
const bot = new Discord.Client();
const channelName = "DSPP";
const youtubeSearch = require('youtube-search');
const config = require('./config.json');
let voiceChannel;
let stop = false;
var opt = {
    maxResults:10,
    key: config.youtube_token,
    type:"audio"
}




bot.on("ready", () => {
    voiceChannel = bot.channels.cache.find(channel => channel.name == channelName);
    bot.user.setActivity("-play song ----- -jp channelId song \n -stop");
       
 
});

bot.on("message", (message) => {
    if(isValidCommand(message.content, "-stop")){

        stop = true;
        voiceChannel.leave();

    }else if(isValidCommand(message.content, "-play ")){
 
        bot.channels.cache.forEach((channel) => {
            if(channel.type == "voice"){
                let rightChannel = channel.members.find(member => member.user.id == message.guild.ownerID);
                if(rightChannel)
                channel.join().then((connection) => {
                    playContent(message.content.substring(7), connection);
                    return;
                });
            }
        });
    }else if(isValidCommand(message.content, "-jp ")){

        let channelId = message.content.split(" ");
        if(channelId.length <= 2){
            return;
        }
        let channelname = channelId[1];
        let channel = bot.channels.cache.find(channel => channel.name.toLowerCase() == channelname.toLowerCase() && channel.type == "voice");
 

        if(channel){
            channel.join().then((connection) => {
                playContent(message.content.substring(5 + channelname.length), connection);
            });
            
        }
    }
});


const isValidCommand = (command, realCommand) => command.toLowerCase().startsWith(realCommand);
const getVideo = async (content) => await youtubeSearch(content, opt);
const play = (connection, link, index) => {
     
    const streamOptions = { seek: 0, volume: 1 };
    const stream = ytdl(link, {audioonly:true});
    stream.on('error', console.error);
    const dispatcher = connection.play(stream,streamOptions);
    dispatcher.on("finish", () => {
        setTimeout(() => {
            if(index)
                play(connection, randomLink(), 1);

        }, 3000);
            
    });
    dispatcher.on("end", end => {
        console.log(end);
    });
}

const playContent = (content, connection) => {
    getVideo(content).then((res) => {
            play(connection, res.results[0].link);
    });
}


bot.login(auth.token);