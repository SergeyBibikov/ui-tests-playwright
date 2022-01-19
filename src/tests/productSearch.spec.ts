import { test, expect, devices } from '@playwright/test';
import * as assert from 'assert';

import { Homepage } from '../pageObjects/homepage';
import { SearchResults } from '../pageObjects/searchResults';
import { Header } from '../pageObjects/header';


test.describe.parallel('Search suite', () => {
    test('Search for Iphone 13', async ({ page }) => {
        const filterCategories = ['Линейка', 'Оперативная память'];
        const filterOptions = ['Apple iPhone 12', '4-8 ГБ'];

        await Homepage.open(page);
        await Homepage.searchProduct(page, 'iphone 13');
        const foundItemsCount = await SearchResults.getFoundItemsCount(page);
        assert.equal(foundItemsCount > 400, true);
        const category = await SearchResults.getDetectedCategory(page);
        assert.strictEqual(category, "Смартфоны Apple");
        await SearchResults.addFilter(page, filterCategories[0], filterOptions[0]);
        await SearchResults.addFilter(page, filterCategories[1], filterOptions[1]);
        await page.waitForSelector('text=Очистить всё');
        await SearchResults.haveActiveFilters(page, [
            'Бренды: Apple',
            `${filterCategories[0]}: ${filterOptions[0]}`,
            `${filterCategories[1]}: ${filterOptions[1]}`]);
    });

    test('Unsuccessful search', async ({ page }) => {
        const searchString = 'grgew';
        await Homepage.open(page);
        await Homepage.searchProduct(page, searchString);
        const resultsCount = page.locator(SearchResults.fullTextResults);
        await expect(resultsCount).toContainText('По запросу grew найдено');
        await expect(resultsCount).toContainText(`Вы искали ${searchString}?`);
        await resultsCount.locator('div >> nth=1').click();
        await page.waitForSelector('//div[contains(text(),"Простите, по вашему запросу товаров сейчас нет.")]', { timeout: 5000 });
    });

    test('Add item to cart', async ({ page }) => {
        await Homepage.open(page);
        await Homepage.searchProduct(page, 'Iphone 13 128GB');
        await SearchResults.addItemToReqularCart(page, 'Смартфон Apple iPhone 13 128GB, темная ночь');
        const cartItemsCount = await Header.getCartItemsCount(page);
        assert.equal(cartItemsCount, 1);
    });

});