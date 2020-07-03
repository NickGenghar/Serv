const Discord = require('discord.js');
const fs = require('fs');

module.exports = {
    event: 'raw',
    /**
     * @param {Discord.Client} bot
     * @param {any} tag
     */
    run: async (bot, tag) => {
        if(tag.t == 'MESSAGE_REACTION_ADD') {
            let svr = JSON.parse(fs.readFileSync(`./data/guilds/${tag.d.guild_id}.json`));
            if(svr.reactions.length > 0) {
                let payload = svr.reactions.find(v => {return v.msg == tag.d.message_id && v.emoji == tag.d.emoji.id});
                if(payload) {
                    let guild = bot.guilds.cache.find(i => i.id == tag.d.guild_id);
                    let role = guild.roles.cache.find(i => i.id == payload.role);
                    let member = guild.members.cache.find(i => i.id == tag.d.user_id);
                    if(!member.user.bot) {
                        member.roles.add(role)
                        .catch(e => {
                            if(e) throw e;
                        });
                    }
                }
            }
        } else if(tag.t == 'MESSAGE_REACTION_REMOVE') {
            let svr = JSON.parse(fs.readFileSync(`./data/guilds/${tag.d.guild_id}.json`));
            if(svr.reactions.length > 0) {
                let payload = svr.reactions.find(v => {return v.msg == tag.d.message_id && v.emoji == tag.d.emoji.id});
                if(payload) {
                    let guild = bot.guilds.cache.find(i => i.id == tag.d.guild_id);
                    let role = guild.roles.cache.find(i => i.id == payload.role);
                    let member = guild.members.cache.find(i => i.id == tag.d.user_id);
                    if(!member.user.bot) {
                        member.roles.remove(role)
                        .catch(e => {
                            if(e) throw e;
                        });
                    }
                }
            }
        }
    }
}