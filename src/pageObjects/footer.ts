
const _root = '//footer[@data-widget="footer"]'; 
const _locators = {
    ROOT: _root,
    VER_FOR_VIS_IMPARED: _root + '//button[contains(.,"Версия для слабовидящих")]',
    ECOSYSTEM_SECTION: _root + '/div[2]/div/div[2]'
}

export class Footer{
    
    static locators = _locators;

}