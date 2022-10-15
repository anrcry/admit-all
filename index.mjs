import puppeteer from 'puppeteer-extra';
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import dotenv from 'dotenv';

const AnonymizePlugin = await import("puppeteer-extra-plugin-anonymize-ua");

dotenv.config();

const sleep = (ms = 1000) => new Promise((r) => setTimeout(r, ms));
const toMs = (sec) => sec * 1000;

if(!'code' in process.env && !'password' in process.env && !'username' in process.env) {
    throw new Error("Please provide the USERNAME, PASSWORD & CODE in the .env file. For more help read the README file.");
}

const username = process.env.EMAIL;

if(username.length == 0){
    throw new Error("Username is required. Please provide the same in the .env file.")
}

const password = process.env.PASSWORD;

if(password.length == 0){
    throw new Error("Password is required. Please provide the same in the .env file.")
}

const code = process.env.CODE;

if( code.length == 0 ){
    throw new Error("Meeting Code is required. Please provide the same in the .env file.")
}


if (! 'headless' in process.env ){
    // So this is headless...
    process.env['HEADLESS'] = 'false'
}

const headless = process.env.HEADLESS === 'true' ? true : false

const delay = 1000

puppeteer.use(StealthPlugin());
puppeteer.use(AnonymizePlugin.default());
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

const browser = await puppeteer.launch( 
    { 
        headless, 
		defaultViewport: null,
		ignoreDefaultArgs: ['--disable-extensions'],
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-fake-ui-for-media-stream', '--start-maximized', ], 
    }
);
    
const provider = async function (){

    const context = browser.defaultBrowserContext();
    await context.overridePermissions(
        "https://meet.google.com/", ["microphone", "camera", "notifications"]
    );

    // console.log(await browser.version());

    const page = await browser.newPage();

    // await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.134 Safari/537.36');

    await page.goto('https://accounts.google.com/', {
        waitUntil: 'domcontentloaded',
    });


    await page.waitForSelector('input[type="email"]', {
        visible: true
    });
    await page.click('input[type="email"]')
    await page.keyboard.type(username, {delay: 100});

    await page.waitForSelector('#identifierNext button', {
        visible: true
    });

    await Promise.all([
        page.waitForNavigation({
            waitUntil: 'domcontentloaded'
        }), // The promise resolves after navigation has finished
        page.click('#identifierNext button'), // Clicking the link will indirectly cause a navigation
    ]);
    
    await page.waitForSelector('input[type="password"]', {
        visible: true
    })
    await page.click('input[type="password"]');
    await page.keyboard.type(password, {delay: 100});
    await page.waitForSelector('#passwordNext button', {
        visible: true
    })
    
    await Promise.all([
        page.waitForNavigation(), // The promise resolves after navigation has finished
        page.click('#passwordNext button'), // Clicking the link will indirectly cause a navigation
    ]);
    

    // await page.screenshot({path: '3.png'});
    console.info("Preparing to join meeting.... This may take some time ⏳");
    console.time('Waiting (Join Meeting)');
    
    const waitForAccount = await page.waitForResponse( (response) => { console.log({ url: response.url() }); return response.url().includes('myaccount.google.com') }, {
        // 5 minute timeout taken if 2FA is encountered...
        timeout: 5 * 60 * 1000
    } );

    if(!waitForAccount) { 
        console.error("👎🏻 Could not redirect...");
        await browser.close(); process.exit(1) 
    }

    console.timeEnd('Waiting (Join Meeting)');

    const meet = await page.goto(`https://meet.google.com/${code}`, {
        waitUntil: 'domcontentloaded',
    });

    const response = await Promise.all([
        //
        page.waitForSelector("div[aria-label=\"Turn off microphone (CTRL + D)\"]", {
            visible: true,
            timeout: toMs(10)
        }).catch( (err) => console.error(err) ),
        page.waitForSelector("div[aria-label=\"Turn off camera (CTRL + E)\"]", {
            visible: true,
            timeout: toMs(10)
        }).catch( (err) => console.error(err) ),,
        page.waitForSelector("div[aria-label=\"Turn off microphone (ctrl + d)\"]", {
            visible: true,
            timeout: toMs(10)
        }).catch( (err) => console.error(err) ),,
        page.waitForSelector("div[aria-label=\"Turn off camera (ctrl + e)\"]", {
            visible: true,
            timeout: toMs(10)
        }).catch( (err) => console.error(err) ),
    ]).then( (values) => values.filter( (value) => typeof value !== 'undefined') );

    if(Array.isArray(response) && response.length != 2) {
        console.error("Sorry we could not switch off the Audio Video hardware");
        await page.close();
        await browser.close();
        process.exit(1);
    }


    const [ microphone, camera ] = response;

    // Clicks cannot be simultaneous...

    await microphone.click({
        button: 'left'
    });

    await camera.click({
        button: 'left'
    });

    // TODO: Join the meeting.

    await Promise.all([
        page.waitForNavigation({
            waitUntil: 'domcontentloaded' // HACK: May be not required...
        }),
        
    ]);
}

setTimeout(provider, delay);