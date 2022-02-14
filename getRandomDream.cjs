const fs = require('fs');



fs.readdir('./bot-dreams', 'utf-8', (err, data)=>{
    if(err) return err
    let randomArt = Math.floor(Math.random() * data.length);
    console.log(randomArt);
})

