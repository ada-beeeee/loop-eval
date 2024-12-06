import { test, expect, Page } from '@playwright/test';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, 'test.env') });
const username = process.env.LOOP_USERNAME ? process.env.LOOP_USERNAME : "username not found!";
const password = process.env.LOOP_PASSWORD ? process.env.LOOP_PASSWORD : "password not found!";

const test_data = fs.readFileSync('test-data.json').toString();
const test_list = JSON.parse(test_data);

const app_url = 'https://animated-gingersnap-8cf7f2.netlify.app/';

test_list.forEach(({ test_case, tab, column, tags }) => {
  test(test_case, async ({ page }) => {
    // log in to project board
    await login(page);

    // check that ticket is in correct column
    await page.getByRole('button', { name: tab }).click();
    expect (await current_column(page, test_case)).toContain(column);

    // check that ticket contains correct tags
    let tag_texts = await current_tags(page, test_case);
    tags.forEach(function (t: string) {
      expect (tag_texts.includes(t)).toBe(true);
    });
  });
});

async function current_column(page: Page, test_case: string): Promise<string> {
  let column_element = page.getByText(test_case).locator('../../..').locator('css=h2');
  await column_element.isVisible();
  return (await column_element.allInnerTexts())[0];
}

async function login(page: Page): Promise<void> {
  await page.goto(app_url);
  await page.locator('input[id="username"]').fill(username);
  await page.locator('input[id="password"]').fill(password);
  await page.getByText("Sign in").click();
}

async function current_tags(page: Page, test_case: string): Promise<string[]> {
  let tag_div = page.getByText(test_case).locator('..').locator('css=div').first();
  let tag_texts = await tag_div.allInnerTexts();
  return tag_texts[0].split('\n');
}
