import topics from './modules/topics.js'
import topicsNumbered from './modules/topicsNumbered.js';
import openai from 'openai-node';
import dotenv from 'dotenv'
import Twit from 'twit';
import config from './config.js';
import fs from 'fs';
dotenv.config({ silent: true });

const client = new Twit(config);
openai.api_key = process.env.OPENAI_API_KEY;

setInterval(() => {
    let topicType = topicsNumbered.get(Math.floor(Math.random() * topicsNumbered.size));
    let theTopics = topics.get(topicType);
    let prompt = theTopics[Math.floor(Math.random() * theTopics.length)];

    console.log(prompt);
    tweetPoem(prompt);

}, 1000 * 60 * 45);


//Completion
function tweetPoem(prompt) {
    openai.Completion.create({
        engine: "davinci-instruct-beta-v3",
        prompt: `Write a haiku about ${prompt}`,
        temperature: 1,
        max_tokens: 200,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 1,
        n: 1,
        stream: false,
        logprobs: null,
        echo: false,
        best_of: 1,
        stop: null,
    }).then((response) => {
        let reformat = response.choices[0].text.split("\n").filter(each => each !== '').join('\n');
        console.log(`TOPIC: ${prompt}\n--------------------\n${reformat}\n--------------------\n`);
        var b64content = fs.readFileSync(`./bot-dreams/${Math.floor(Math.random() * 5554)}.png`, { encoding: 'base64' })

        // first we must post the media to Twitter
        client.post('media/upload', { media_data: b64content }, function (err, data, response) {
            // now we can assign alt text to the media, for use by screen readers and
            // other text-based presentations and interpreters
            var mediaIdStr = data.media_id_string
            var altText = "An image from one of the Poetry By Robots NFT collection"
            var meta_params = { media_id: mediaIdStr, alt_text: { text: altText } }

            client.post('media/metadata/create', meta_params, function (err, data, response) {
                if (!err) {
                    // now we can reference the media and post a tweet (media will attach to the tweet)
                    var params = { status: reformat + "\n\n#NFTs #NFTpoetry #AIartwork", media_ids: [mediaIdStr] }

                    client.post('statuses/update', params, function (err, data, response) {
                        console.log(data)
                    })
                }
            })
        })
    });
}

