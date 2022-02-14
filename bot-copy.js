import topics from './modules/topics.js'
import topicsNumbered from './modules/topicsNumbered.js';
import openai from 'openai-node';
import dotenv from 'dotenv'
import Twit from 'twit';
import config from './config.js';
dotenv.config({ silent: true });

const client = new Twit(config);
openai.api_key = process.env.OPENAI_API_KEY;

setInterval(() => {
    let topicType = topicsNumbered.get(Math.floor(Math.random() * topicsNumbered.size));
    let theTopics = topics.get(topicType);
    let prompt = theTopics[Math.floor(Math.random() * theTopics.length)];

    console.log(prompt);
    tweetPoem(prompt);

}, 1000 * 60 * 30);


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
        client.post('statuses/update', { status: reformat.toString() + "\n #NFTs #NFTpoetry\n\n https://poetrybyrobots.com" }, (res, rej) => {
             if (rej) console.log(rej);
         });
    });
}

