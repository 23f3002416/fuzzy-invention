const { chromium } = require('playwright');

async function scrapeTablesFromUrl(page, url) {
    try {
        console.log(`Scraping ${url}...`);
        await page.goto(url, { waitUntil: 'networkidle' });
        
        // Wait for tables to load
        await page.waitForSelector('table', { timeout: 10000 });
        
        // Extract all numbers from all tables
        const numbers = await page.evaluate(() => {
            const tables = document.querySelectorAll('table');
            const allNumbers = [];
            
            tables.forEach(table => {
                const cells = table.querySelectorAll('td, th');
                cells.forEach(cell => {
                    const text = cell.textContent.trim();
                    // Extract all numbers from the cell text
                    const matches = text.match(/-?\d+\.?\d*/g);
                    if (matches) {
                        matches.forEach(match => {
                            const num = parseFloat(match);
                            if (!isNaN(num)) {
                                allNumbers.push(num);
                            }
                        });
                    }
                });
            });
            
            return allNumbers;
        });
        
        const sum = numbers.reduce((acc, num) => acc + num, 0);
        console.log(`URL: ${url} - Found ${numbers.length} numbers, Sum: ${sum}`);
        return sum;
        
    } catch (error) {
        console.error(`Error scraping ${url}:`, error.message);
        return 0;
    }
}

async function main() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    // URLs to scrape (seeds 33-42)
    const baseUrl = 'https://sanand0.github.io/tdsdata/js_table/?seed=';
    const seeds = [33, 34, 35, 36, 37, 38, 39, 40, 41, 42];
    
    let totalSum = 0;
    
    console.log('Starting table scraping for seeds 33-42...');
    console.log('==========================================');
    
    for (const seed of seeds) {
        const url = `${baseUrl}${seed}`;
        const sum = await scrapeTablesFromUrl(page, url);
        totalSum += sum;
    }
    
    await browser.close();
    
    console.log('==========================================');
    console.log(`FINAL TOTAL SUM: ${totalSum}`);
    console.log('==========================================');
    console.log(`Scraping completed by 23f3002416@ds.study.iitm.ac.in`);
}

main().catch(console.error);