import { test, expect } from '@playwright/test';
import { todayPlus, todayPlusAsStr } from '../helpers/dates';
import { OzonTravel } from '../pageObjects/ozonTravel';


test.beforeEach(async ({ page }) => {
    await OzonTravel.open(page);
});

test('Successful page load', async ({ page }) => {
    await expect(page.locator('body')).toContainText('Покупать авиа- и ж/д билеты на Ozon удобно!');
});

test('All stories', async ({ page }) => {
    const storiesView = '//div[@class="vue-portal-target"]//div[img[contains(@src, "main")]]/..';
    
    await page.locator('text=Смотреть все').click();
    await expect(page.locator(storiesView)).toHaveCount(1);
});

test('Reserve as a juridical face', async ({ page }) => {
    await page.locator('text=Бронируйте как юрлицо').click();
    await expect(page.locator('body')).toContainText('Ozon Travel');
    await expect(page.locator('body')).toContainText('для бизнеса');
    await expect(page.locator('body')).toContainText('0%');
    await expect(page.locator('body')).toContainText('сервисного сбора');
    await expect(page.locator('body')).toContainText('за командировки');
});

test('Validation of empty fields', async ({ page }) => {
    const findTickets = page.locator('//button[contains(.,"Найти билеты")]');

    await findTickets.click();
    await page.waitForResponse('https://xapi.ozon.ru/api/frontend-perf.bx/v2/events');
    await findTickets.click();
    await findTickets.click();
    await page.waitForSelector('input[name="travelSearchFrom"][errors="Введите город вылета"]')
    await page.waitForSelector('input[name="travelSearchTo"][errors="Введите город прилета"]')
    await page.waitForSelector('//p[text()="Туда"]/ancestor::label/..//p[text()="Введите дату"]');
});

test.describe('Airline tickets', ()=>{
    test('Destination switch network calls', async ({ page }) => {
        const fromLoc = page.locator(OzonTravel.FROM);
        const toLoc = page.locator(OzonTravel.TO);
    
        await page.waitForTimeout(1000);
        await toLoc.click();
        await fromLoc.click();
        await page.locator('text=MOW').first().click();
        await page.waitForResponse('https://www.ozon.ru/api/composer-api.bx/_action/travelMainSaveField');
        await toLoc.click();
        await page.locator('text=LED').first().click();
        await page.waitForResponse('https://www.ozon.ru/api/composer-api.bx/_action/travelMainSaveField');
        await page.locator(OzonTravel.DESTINATION_SWITCH).click();
        await page.waitForResponse('https://www.ozon.ru/api/composer-api.bx/_action/travelAutocompleteLocation');
    });

    test('Complex route', async ({ page }) => {
        await page.locator('//span[text()="Составить сложный маршрут"]').click();
        await expect(page.locator('//span[text()="Добавить перелет"]')).toHaveCount(1);
    });
});

test.describe('Railway tickets',() => {
    test('Search', async ({ page }) => {
        await page.locator('//span[text()="ЖД билеты"]/ancestor::button').click();
        await OzonTravel.findTicket(page, 'Москва', 'Санкт-Петербург', todayPlus(10));
        await page.waitForSelector('div[text="По времени отправления"]');
    });
    test('Advantages', async ({ page }) => {
        await page.locator('//span[text()="ЖД билеты"]/ancestor::button').click();
        await expect(page.locator(OzonTravel.ADVANTAGES)).toContainText('Экономия времени и денег');
        await expect(page.locator(OzonTravel.ADVANTAGES)).toContainText('Большой выбор');
        await expect(page.locator(OzonTravel.ADVANTAGES)).toContainText('Поддержка 24/7');
        await expect(page.locator(OzonTravel.ADVANTAGES)).toContainText('Удобный поиск');
    });
})
test.describe('Hotels', () => {
    
    test('Smoke', async ({ page }) => {
        await OzonTravel.selectHotelTab(page);
        await expect(page.locator('body')).toContainText('Бронирование отелей и гостиниц');
    });
    test('Find by city', async ({ page }) => {
        await OzonTravel.selectHotelTab(page);
        await OzonTravel.findHotel(page, 'city', "Москва", todayPlusAsStr(3), todayPlusAsStr(20));
        await expect(page.locator('body')).toContainText('Опрашиваем подходящие отели');
    });
    test('Find by hotel', async ({ page }) => {
        await OzonTravel.selectHotelTab(page);
        await OzonTravel.findHotel(page, 'hotel', "SK ROYAL Москва 4", todayPlusAsStr(10), todayPlusAsStr(16));
        await expect(page.locator('body')).toContainText('Опрашиваем подходящие отели');
    });
    //FIXME: stabilize
    test('Find by airport', async ({ page }) => {
        await OzonTravel.selectHotelTab(page);
        await OzonTravel.findHotel(page, 'airport', "Аэропорт Москвы Домодедово", 
            todayPlusAsStr(3),
            todayPlusAsStr(10));
        await expect(page.locator('body')).toContainText('Опрашиваем подходящие отели');
    });
}
)