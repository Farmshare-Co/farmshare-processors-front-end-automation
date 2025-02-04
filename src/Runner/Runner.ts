import { buildLog, diskUtil } from '@sprucelabs/spruce-skill-utils'
import { assert } from '@sprucelabs/test-utils'
import env from 'dotenv'
import puppeteer, { Browser, Page } from 'puppeteer'
import wait from './wait'
env.config()

export default class Runner {
    private domain: string
    private log = buildLog('Runner')

    protected constructor(
        protected page: Page,
        protected browser: Browser
    ) {
        this.domain = process.env.DOMAIN ?? 'https://partners-dev.farmshare.co'
    }

    public static async Runner() {
        const browser = await puppeteer.launch({
            headless: false,
            userDataDir: diskUtil.createRandomTempDir(),
        })
        const page = await browser.newPage()
        await page.setViewport({
            width: 1024,
            height: 768,
        })
        return new this(page, browser)
    }

    public async login() {
        this.log.info('Logging in...')

        await this.goto(this.domain)

        await this.click('button.text-primary')

        if (process.env.EMAIL) {
            await this.loginWithEmailAndPassword()
        } else {
            await this.loginUsingGoogle()
        }

        await this.waitForSelector('[data-rr-ui-event-key="capabilities"]')
    }

    private async loginWithEmailAndPassword() {
        await this.type('[name="username"]', process.env.EMAIL!)
        await this.click('[type="submit"]')
        await this.type('[name="password"]', process.env.PASSWORD!)
        await this.click('[type="submit"]')
    }

    private async loginUsingGoogle() {
        await this.click('[data-provider="google-apps"]')
        await this.waitForSelector('[autocomplete="username webauthn"]')
        await this.type(
            '[autocomplete="username webauthn"]',
            process.env.GOOGLE_EMAIL!
        )
        await this.click('[id="identifierNext"]')

        await wait(2000)

        await this.waitForSelector('[type="password"]')

        await wait(2000)
        await this.type('[type="password"]', process.env.GOOGLE_PASSWORD!)

        await this.clickAtIndex('button', 1)
    }

    public async clickAtIndex(selector: string, idx: number) {
        const button = await this.getAtIndex(selector, idx)
        await button.click()
    }

    public async get(selector: string) {
        const node = await this.page.$(selector)

        if (!node) {
            throw new Error(
                `Could not find element with selector '${selector}'!`
            )
        }

        return node
    }

    public async getAtIndex(selector: string, idx: number) {
        const nodes = await this.page.$$(selector)
        const node = nodes[idx]

        if (!node) {
            throw new Error(
                `Could not find element with selector '${selector}' at index ${idx}!. I did find ${nodes.length} elements, though!`
            )
        }

        return node
    }

    public async goto(url: string) {
        await this.page.goto(url)
    }

    public async clickTab(tab: string) {
        await this.click(`[data-rr-ui-event-key="${tab}"]`)
    }

    public async click(selector: string) {
        await this.waitForSelector(selector)
        await this.page.click(selector)
    }

    public async waitForSelector(selector: string) {
        return await this.page.waitForSelector(selector)
    }

    public async clickDoneInDialog() {
        this.log.info('Clicking done in dialog...')
        await this.click('.modal-content .modal-footer .btn-primary')
        await wait(500)
    }

    public async select(selector: string, value: string) {
        await this.waitForSelector(selector)
        this.log.info(`Selecting "${value}" in "${selector}"`)
        await this.page.select(selector, value)
    }

    public async getValue(selector: string) {
        //@ts-ignore
        return await this.page.$eval(selector, (el: HTMLInputElement) => {
            debugger
            return el.value
        })
    }

    public async assertValueEquals(
        selector: string,
        expected: string,
        msg?: string
    ) {
        const value = await this.getValue(selector)
        assert.isEqual(
            value,
            expected,
            msg ??
                `Input matching "${selector}" should have value "${expected}", but got "${value}".`
        )
    }

    public async type(selector: string, text: string) {
        await this.waitForSelector(selector)
        this.log.info(`Typing "${text}" into "${selector}"`)
        await this.page.type(selector, text)
    }

    public getCurrentUrl() {
        return this.page.url()
    }

    public async shutdown() {
        await this.browser.close()
    }

    public async redirect(destination: string) {
        await this.page.goto(this.domain + destination)
    }
}
