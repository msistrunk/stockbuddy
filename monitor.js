const puppeteer = require('puppeteer');
const dateFormat = require("dateformat");
const https = require('https');
require('dotenv').config();

(async () => {
    fs = require('fs');
    const browser = await puppeteer.launch({headless: false});
    sendDiscord("this a test", 'testing')
    const page = await browser.newPage();
    let inStock = false;
    while(true){
        try{
            // change this link to whatever you want on amazon
            await page.goto(process.env.PRODUCT_LINK);
            const availability = await page.$eval('#availability', (element) => {
                return element.innerText
            });
            if (!availability.includes('Currently unavailable')) {
                if(inStock == false){
                    inStock = true;
                    // change this link as well
                    sendDiscord("STOCK DETECTED", process.env.PRODUCT_LINK);
                } else {
                    consoleLog('Notification already sent!')
                }
                await new Promise(resolve => setTimeout(resolve, 60000));
            }
            else {
                inStock = false;
                consoleLog('unavailable')
            }
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
        catch(e) {
            const captcha = await page.$eval('.a-box-inner', (element) => {
                return element.innerText
            });
            if(captcha.includes('Enter the characters')){
                consoleLog('captcha bamboozle')
                await new Promise(resolve => setTimeout(resolve, 5000));
            }else {
                consoleLog(e);
            }
        }
    }

    async function sendDiscord(title, message){
        const data = JSON.stringify({
          embeds: [{
            color: 3447003,
            author: {
              name: '5900 bot'
            },
            title: `${title}`,
            description: `${message}`,
          }]
        });
        const options = {
          hostname: 'discord.com',
          path: process.env.DISCORD_WEBHOOK,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length,
          },
        };
        const req = https.request(options, (res) => {
            consoleLog('Discord Message Sent');
        });
        req.on('error', (e) => {
          console.log(e.message);
        });
        req.write(data);
    }
    function consoleLog(message){
        console.log(`${dateFormat(new Date())} ${message}`)
    }


})();