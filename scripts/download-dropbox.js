#!/usr/bin/env node
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const DROPBOX_URL = 'https://www.dropbox.com/transfer/AAAAAC_WGavYtFh2-CJGgQov0R3pm4wPUmcDfe__feh6XdxKoM_g71k';
const DOWNLOAD_DIR = '/home/toti/projects/enauwi-resort/downloads';

async function downloadDropboxTransfer() {
  console.log('Starting Dropbox Transfer download...');
  
  // Ensure download directory exists
  if (!fs.existsSync(DOWNLOAD_DIR)) {
    fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
  }

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    acceptDownloads: true
  });

  const page = await context.newPage();

  console.log('Navigating to Dropbox Transfer page...');
  await page.goto(DROPBOX_URL, { waitUntil: 'networkidle', timeout: 60000 });

  // Wait for the page to load
  await page.waitForTimeout(3000);
  
  console.log('Page title:', await page.title());

  try {
    // First, accept cookies if present
    const acceptCookiesBtn = await page.$('button:has-text("Accept All")');
    if (acceptCookiesBtn) {
      console.log('Accepting cookies...');
      await acceptCookiesBtn.click();
      await page.waitForTimeout(1000);
    }

    // Look for the download button
    const downloadBtn = await page.$('button[data-testid="download-button"]') ||
                        await page.$('button:has-text("Download")') ||
                        await page.$('[data-testid="download-all-button"]');
    
    if (downloadBtn) {
      console.log('Found download button, clicking...');
      await downloadBtn.click();
      await page.waitForTimeout(2000);
      
      // Check for login modal and click "continue with download only"
      const downloadOnlyLink = await page.$('text=continue with download only') ||
                               await page.$('a:has-text("download only")') ||
                               await page.$('button:has-text("download only")');
      
      if (downloadOnlyLink) {
        console.log('Found "download only" option, clicking...');
        
        // Start waiting for download before clicking
        const downloadPromise = page.waitForEvent('download', { timeout: 300000 });
        await downloadOnlyLink.click();
        
        console.log('Waiting for download to start (this may take a while for 896MB)...');
        const download = await downloadPromise;
        
        const fileName = download.suggestedFilename();
        const filePath = path.join(DOWNLOAD_DIR, fileName);
        
        console.log(`Downloading: ${fileName}`);
        await download.saveAs(filePath);
        console.log(`Saved to: ${filePath}`);
        
        // Check file size
        const stats = fs.statSync(filePath);
        console.log(`File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
      } else {
        console.log('Looking for other download options...');
        
        // Maybe the download started directly
        try {
          const downloadPromise = page.waitForEvent('download', { timeout: 30000 });
          const download = await downloadPromise;
          
          const fileName = download.suggestedFilename();
          const filePath = path.join(DOWNLOAD_DIR, fileName);
          
          console.log(`Downloading: ${fileName}`);
          await download.saveAs(filePath);
          console.log(`Saved to: ${filePath}`);
          
          const stats = fs.statSync(filePath);
          console.log(`File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
        } catch (e) {
          console.log('No direct download started, taking screenshot...');
          await page.screenshot({ path: path.join(DOWNLOAD_DIR, 'no-download-link.png') });
          
          // Print page text content
          const textContent = await page.textContent('body');
          console.log('Page text:', textContent.substring(0, 500));
        }
      }
    } else {
      console.log('No download button found, taking screenshot...');
      await page.screenshot({ path: path.join(DOWNLOAD_DIR, 'no-button.png') });
    }
  } catch (error) {
    console.error('Error during download:', error.message);
    await page.screenshot({ path: path.join(DOWNLOAD_DIR, 'error-page.png') });
  }

  await browser.close();
  console.log('Browser closed.');
}

downloadDropboxTransfer().catch(console.error);
