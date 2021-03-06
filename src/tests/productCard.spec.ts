import { test, expect } from '@playwright/test';
import { Header } from '../pageObjects/header';
import { ProductCard } from '../pageObjects/productCard';
import { getElementColor } from "../helpers/dom";


test.beforeEach(async ({ page }) => {
    const productLink = 'https://www.ozon.ru/product/chehol-nakladka-gurdini-ultra-twin-0-3-mm-silikon-dlya-apple-iphone-se-2020-7-8-4-7-162212667'
    await page.goto(productLink);
    await page.waitForSelector('text=Рекомендуем также');
});

test('All main sections must be displayed', async ({ page }) => {

    await expect(page.locator('#layoutPage')).toContainText('Фото и видео покупателей');
    await expect(page.locator('#layoutPage')).toContainText('Рекомендуем также');
    await expect(page.locator('#layoutPage')).toContainText('Покупают вместе');
    await expect(page.locator('#layoutPage')).toContainText('Спонсорские товары');
    await expect(page.locator('#layoutPage')).toContainText('Характеристики');
    await expect(page.locator('#layoutPage')).toContainText('Подборки товаров');
    await expect(page.locator('#layoutPage')).toContainText('Отзывы и вопросы о товаре');
});

test('Scroll to description', async ({ page }) => {
    const getOffset = async () => {
        return await page.evaluate(() => {
            return window.scrollY
        });
    }

    await page.locator('text=Перейти к описанию').click();

    let offsetAfterScroll = await getOffset();
    while (true) {
        const currentOffset = await getOffset();
        if (currentOffset === offsetAfterScroll) {
            break;
        }
        offsetAfterScroll = currentOffset;
    }

    expect(offsetAfterScroll).toBeGreaterThan(2000);
});

test('Add to comparison button should change text when product is added', async ({ page }) => {

    const productHeaderSection = page.locator(ProductCard.nameSection);

    await expect(productHeaderSection).toContainText('Добавить к сравнению');
    await productHeaderSection.locator('text=Добавить к сравнению').click();
    await expect(productHeaderSection).not.toContainText('Добавить к сравнению');
    await expect(productHeaderSection).toContainText('Перейти в сравнение');
});

test('Icon color should change when product is added to favourites', async ({ page }) => {
    const expectedFavIconColor = 'rgb(249, 17, 85)'

    await page.locator('text=В избранное').click();
    const count = await Header.getFavouriteItemsCount(page);
    expect(count).toEqual(1);
    await expect(page.locator(ProductCard.nameSection)).toContainText('В избранном');
    const color = await page.evaluate(getElementColor, 'button[aria-label="Убрать из избранного"] > span > svg')
    expect(color).toEqual(expectedFavIconColor);
});

test('Share options should show on hover', async ({ page }) => {

    await page.locator(ProductCard.nameSection).locator('[aria-label="Поделиться"] > span span').hover();

    const exp = expect(page.locator('.vue-portal-target').nth(1));

    await exp.toContainText('Скопировать ссылку');
    await exp.toContainText('ВКонтакте');
    await exp.toContainText('Одноклассники');
    await exp.toContainText('Telegram');
    await exp.toContainText('Twitter');
});

test('Sticky header with add to cart button on scroll', async ({ page }) => {

    await page.evaluate(() => {
        window.scroll(0, 2000);
    });

    const bb = await page
        .locator('[triggering-object-selector="#short-product-info-trigger-new"]')
        .locator('//button[contains(., "Добавить в корзину")]').boundingBox();

    expect(bb).not.toBeNull();

});

test('Add to cart button should change text on product addition/deletion', async ({ page }) => {
    const checkOutSection = page.locator(ProductCard.checkoutSection);

    await ProductCard.addToCart(page);

    const count = await Header.getCartItemsCount(page);
    expect(count).toEqual(1);
    await expect(checkOutSection).not.toContainText('Добавить в корзину');
    await expect(checkOutSection).toContainText('В корзине');

    await ProductCard.decreaseQty(page);
    await expect(checkOutSection).toContainText('Добавить в корзину');
});

test('Popup on notification link', async ({ page }) => {
    const notifForm = page.locator('//h1[contains(., "Узнайте о снижении цены")]/..');

    await page.locator('text=Узнать о снижении цены').click();

    await expect(notifForm.locator('//p[text()="Ваш e-mail"]/preceding-sibling::input')).toHaveCount(1);
    await expect(notifForm.locator('//span[text()="Готово"]/ancestor::button')).toHaveCount(1);
});