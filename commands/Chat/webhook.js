const Discord = require('discord.js');
const fs = require('fs');

const dev = require('../../configurations/developer.json');

module.exports = {
    name: 'webhook',
    alias: ['webhook', 'web', 'hook'],
    desc: 'Simplified webhook management.',
    usage: [
        '//webhook',
        '//webhook <Create | Delete> <Webhook Name>',
        '//webhook <Find> [Webhook Name]',
        '',
        'Without argument, this command runs in guided mode. Otherwise, it will run normally.',
        '',
        'Create: Creates a webhook in the channel the command invoked.',
        'Delete: Deletes an existing webhook in the channel the command invoked.',
        'Find: Finds a webhook in the channel invoked or the whole server if webhook name provided.',
        '',
        'Webhook Name: The name of the webhook you want to create.',
        'Webhook Name: The name of the webhook if it exist in the server.'
    ],
    run: async (msg, args, queue) => {
        const svr = JSON.parse(fs.readFileSync(`./data/guilds/${msg.guild.id}.json`));
        if(svr.modRole.length <= 0) return msg.channel.send('No Moderator Role Set.');
        if(!msg.guild.member(msg.author).roles.cache.find(r => svr.modRole.includes(r.id))) return msg.channel.send('You do not have the required moderation role.');
        if(!queue.get(`${msg.guild.id}.${msg.author.id}`)) queue.set(`${msg.guild.id}.${msg.author.id}`, msg.author.id);

        if(args.length > 0) {
            switch(args.shift()) {
                case('create'): {
                    if(args.length <= 0) return msg.channel.send('Webhook name not provided.');
                    else {
                        msg.channel.createWebhook(args.join(' '), msg.client.user.displayAvatarURL())
                        .then(m => {
                            msg.channel.send(`Webhook created: ${m.url}`)
                        })
                        .catch(() => {
                            msg.channel.send('Encountered error while creating a webhook in this channel.');
                        })
                    }
                } break;

                case('find'): {
                    if(args.length <= 0) {
                        msg.channel.fetchWebhooks()
                        .then(a => {
                            let w = a.map(e => e.name);
                            if(w.length <= 0) return msg.channel.send('This channel doesn\'t have any webhooks.');
                            let webhookEmbed = new Discord.MessageEmbed()
                            .setTitle('Webhooks in this channel')
                            .setDescription(a.map(e => e.name).join('\n'));

                            msg.channel.send({embed: webhookEmbed});
                        })
                        .catch(() => {
                            msg.channel.send('Encountered error while searching for webhooks.');
                        });
                    } else {
                        msg.guild.fetchWebhooks()
                        .then(a => {
                            let w = a.find(e => e.name == args.join(' '));
                            if(!w) return msg.channel.send(`Webhook with the name **${args}** doesn't exist.`);
                            let webhookEmbed = new Discord.MessageEmbed()
                            .setTitle('Webhook Info')
                            .setThumbnail(w.avatar)
                            .addField('Webhook Name', w.name, true)
                            .addField('Webhook Owner', w.owner, true)
                            .addField('Webhook Type', w.type, true)
                            .addField('Webhook URL', w.url, true)
                            .addField('Created By', w.client, true)
                            .addField('Created Since', w.createdAt, true)
                            msg.channel.send({embed: webhookEmbed});
                        })
                        .catch(() => {
                            msg.channel.send('Encountered error while getting the said webhook.');
                        });
                    }
                } break;

                case('delete'): {
                    if(args.length <= 0) return msg.channel.send('No webhook name specified. Please search for the webhook name first before proceeding.');
                    else {
                        msg.channel.fetchWebhooks()
                        .then(a => {
                            let w = a.find(e => e.name == args.join(' '));
                            if(!w) return msg.channel.send('Webhook doesn\'t exist.');
                            w.delete()
                            .then(() => {
                                return msg.channel.send('Webhook deleted successfully.');
                            })
                            .catch(() => {
                                return msg.channel.send('Encountered error while deleting the webhook.');
                            });
                        })
                        .catch(() => {
                            return msg.channel.send('Encountered error while searching for the webhook.')
                        })
                    }
                } break;
                
                default:
            }
        } else {
            let data = queue.get(`${msg.guild.id}.${msg.author.id}`);
            let filter = m => {return data == m.author.id;}

            const CMD = msg.channel.createMessageCollector(filter, {idle: 10000});
            msg.channel.send('Webhook creation initialized. Type the following commands to start using this (commands are not case-sensitive):\n`Create <Webhook Name>`\n`Delete <Webhook Name>`\n`Find [Webhook Name]`\n`Exit`');

            CMD.on('collect', (cmd) => {
                cmd = cmd.content.split(' ');
                let com = cmd.shift();
                com = com.toLowerCase();

                switch(com) {
                    case('create'): {
                        if(cmd.length <= 0) return msg.channel.send('Webhook name not provided.');
                        else {
                            msg.channel.createWebhook(cmd.join(' '), msg.client.user.displayAvatarURL())
                            .then(m => {
                                msg.channel.send(`Webhook created: ${m.url}`)
                            })
                            .catch(() => {
                                msg.channel.send('Encountered error while creating a webhook in this channel.');
                            })
                        }
                    } break;

                    case('find'): {
                        if(cmd.length <= 0) {
                            msg.channel.fetchWebhooks()
                            .then(a => {
                                let w = a.map(e => e.name);
                                if(w.length <= 0) return msg.channel.send('This channel doesn\'t have any webhooks.');
                                let webhookEmbed = new Discord.MessageEmbed()
                                .setTitle('Webhooks in this channel')
                                .setDescription(a.map(e => e.name).join('\n'));

                                msg.channel.send({embed: webhookEmbed});
                            })
                            .catch(() => {
                                msg.channel.send('Encountered error while searching for webhooks.');
                            });
                        } else {
                            msg.guild.fetchWebhooks()
                            .then(a => {
                                let w = a.find(e => e.name == cmd.join(' '));
                                if(!w) return msg.channel.send(`Webhook with the name **${cmd}** doesn't exist.`);
                                let webhookEmbed = new Discord.MessageEmbed()
                                .setTitle('Webhook Info')
                                .setThumbnail(w.avatar)
                                .addField('Webhook Name', w.name, true)
                                .addField('Webhook Owner', w.owner, true)
                                .addField('Webhook Type', w.type, true)
                                .addField('Webhook URL', w.url, true)
                                .addField('Created By', w.client.user.username, true)
                                .addField('Created Since', w.createdAt, true)
                                msg.channel.send({embed: webhookEmbed});
                            })
                            .catch(() => {
                                msg.channel.send('Encountered error while getting the said webhook.');
                            });
                        }
                    } break;

                    case('delete'): {
                        if(cmd.length <= 0) return msg.channel.send('No webhook name specified. Please search for the webhook name first before proceeding.');
                        else {
                            msg.channel.fetchWebhooks()
                            .then(a => {
                                let w = a.find(e => e.name == cmd.join(' '));
                                if(!w) return msg.channel.send('Webhook doesn\'t exist.');
                                w.delete()
                                .then(() => {
                                    return msg.channel.send('Webhook deleted successfully.');
                                })
                                .catch(() => {
                                    return msg.channel.send('Encountered error while deleting the webhook.');
                                });
                            })
                            .catch(() => {
                                return msg.channel.send('Encountered error while searching for the webhook.')
                            })
                        }
                    } break;

                    case('exit'): {
                        CMD.stop();
                    } break;
                    
                    default:
                }
            });
            CMD.on('end', () => {
                queue.delete(`${msg.guild.id}.${msg.author.id}`);
                msg.channel.send('Webhook setup ended.');
            });
        }
    }
}