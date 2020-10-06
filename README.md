# Serv
Your Average Server Bot design to Serv you...
Serv is designed to be a scalable yet modular Discord bot that can be easily deployed by anyone cloning this repository.

---
## Deploying your own Serv:
To start deployment of your own Serv, run the file `init.js` included with the source. It will create the necessary files complete with the proper key-value pair. All you have to do is provide the correct data to each files stated in the console output.

1. In `master.json`:
```json
{
    "master": [
        "Required: Your Discord user ID.",
        "Optional: Other Discord user IDs you want to grant full access to the bot.",
        "Note: Add more users by adding more values into this array."
    ],
    "guild": "Required: Your private Discord guild ID (Server).",
    "webhook": "Required: Discord Webhook ID for printing error message to your server."
}
```
2. In `token.json`. Take note that only `token` is required. The rest of the parameters can be left empty:
```json
{
    "token": "Required: Your Discord bot's token.",
    "ytkey": "Optional: Your YouTube API key.",
    "twkey": {
        "consumer": "Optional: Your Twitter consumer key.",
        "consumer_secret": "Optional: Your Twitter consumer secret.",
        "access_token": "Optional: Your Twitter access token.",
        "access_token_secret": "Optional: Your Twitter access token secret."
    },
    "mysql": {
        "user": "Optional: Your MySQL username.",
        "password": "Optional: Your MySQL password."
    }
}
```
Note: Missing token parameters will disable certain aspects of the bot that relies on it. If you want to use features that relies on these other services, go to [Twitter](https://developer.twitter.com/en), [Google](https://developers.google.com/youtube/v3), and [MySQL](https://www.mysql.com/) respectively.

---
## More details coming soon(ish).