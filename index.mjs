import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import dotenv from 'dotenv';

dotenv.config();

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

const browser = await puppeteer.launch( 
    { 
        headless, 
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-extensions', '--use-fake-ui-for-media-stream', '--start-maximized', ], 
    }
);
    
const provider = async function (){

    const context = browser.defaultBrowserContext();
    await context.overridePermissions(
        "https://meet.google.com/", ["microphone", "camera", "notifications"]
    );

    console.log(await browser.version());

    const page = await browser.newPage();

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.134 Safari/537.36');

    await page.goto('https://accounts.google.com/', {
        waitUntil: 'domcontentloaded',
    });

    await page.waitForSelector('input[type="email"]')
    await page.click('input[type="email"]')
    await page.waitForNetworkIdle()
    await page.type('input[type="email"]', username, {delay: 100});
    await page.screenshot({path: '1.png'});

    await page.waitForSelector('#identifierNext')
    await page.click('#identifierNext')
    await page.waitForNetworkIdle()

    await page.waitForSelector('input[type="password"]')
    await page.click('input[type="password"]')
    await page.waitForNetworkIdle()
    await page.type('input[type="password"]', password, {delay: 100});
    await page.screenshot({path: '2.png'});

    await page.waitForSelector('#passwordNext')
    await page.click('#passwordNext')
    await page.waitForNetworkIdle()

    await page.screenshot({path: '3.png'});

    const waitForAccount = await page.waitForResponse( (response) => response.status() === 200 && response.url().includes('https://myaccount.google.com/') );

    if(!waitForAccount) { await browser.close(); process.exit(1) }

    await page.goto('https://meet.google.com', {
        waitUntil: 'domcontentloaded',
    });

    await page.waitForNetworkIdle()

    await page.waitForSelector('input[aria-label="Enter a code or link"]')
    await page.click('input[aria-label="Enter a code or link"]')
    await page.waitForNetworkIdle()
    await page.keyboard.type(code, {delay: 100});
    await page.keyboard.press('Enter');
    await page.waitForNetworkIdle()

    // Wait for 5 milliseconds
    page.waitForTimeout(500);

    await page.waitForSelector('span', {
        visible: true,
    });

    await page.waitForTimeout(5000);

    await page.evaluate( () => {
        document.dispatchEvent(new KeyboardEvent('keydown', {'key':'d', 'ctrlKey': true} ));
        document.dispatchEvent(new KeyboardEvent('keydown', {'key':'e', 'ctrlKey': true} ));
    });

    await page.screenshot({path: '4.png'});

    await page.evaluate( () => {
        const spans = [...document.getElementsByTagName("span")];
        const span = spans.filter( (span) => (span.innerText === "Join now") )
        if(span[0] && span[0].parentElement){
            span[0].parentElement.click();
        }
    });

    page.waitForTimeout(2000);
    await page.waitForNetworkIdle();

    await page.screenshot({path: '5.png'});

    try {
        await page.waitForSelector('button[aria-label="Show everyone"]', {
            visible: true,
            timeout: 10000
        });

        await page.click('button[aria-label="Show everyone"]');

        await page.screenshot({path: '6.png'});
    }catch (err){
        console.error(err);
    }

    try{
        setInterval( async () => {
            await page.evaluate( () => {
                const spans = [...document.getElementsByTagName("span")];
                const admit = spans.filter( (span) => (span.innerText === "Admit") )
                const view_all = spans.filter( (span) => (span.innerText === "View All") )
                const admit_all = spans.filter( (span) => (span.innerText === "Admit All"));
                if(view_all[0]){
                    view_all[0]?.parentElement?.click();
                    if(admit_all[0]){
                        admit_all[0].parentElement.click();
                    }
                }else{
                    if(admit && admit.length > 0)
                        admit.forEach(a => a?.parentElement?.click());
                }
                
            });
        }, 5000);

        // setInterval( async () => await page.screenshot({path: `${(+Date.now() / 1000 | 0)}.png`}), 5 * 60 * 1000);
    }catch(err){

    }

    console.log("Check the screenshots ✨!");
}

setTimeout(provider, delay);