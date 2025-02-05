import { buildLog, diskUtil } from '@sprucelabs/spruce-skill-utils'
import env from 'dotenv'
import puppeteer, { Browser, Page } from 'puppeteer'
import wait from './wait'
env.config()

export default class Runner {
    public domain: string
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

    public async refresh() {
        await this.page.reload()
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

    public async click(selector: string) {
        await this.waitForSelector(selector)
        await this.page.click(selector)
        await wait(1000)
    }

    public async waitForSelector(selector: string) {
        return await this.page.waitForSelector(selector)
    }

    public async select(selector: string, value: string) {
        await this.waitForSelector(selector)
        this.log.info(`Selecting "${value}" in "${selector}"`)
        await this.page.select(selector, value)
        await wait(1000)
    }

    public async getValue(selector: string) {
        await this.waitForSelector(selector)
        //@ts-ignore
        return await this.page.$eval(selector, (el: HTMLInputElement) => {
            return el.value
        })
    }

    public async getIsEnabled(selector: string): Promise<boolean> {
        //@ts-ignore
        return await this.page.$eval(selector, (el: HTMLInputElement) => {
            return !el.disabled
        })
    }

    public async type(selector: string, text: string) {
        await this.waitForSelector(selector)
        this.log.info(`Typing "${text}" into "${selector}"`)
        await this.page.type(selector, text)
    }

    public async setInputValue(selector: string, value: string) {
        await this.waitForSelector(selector)
        this.log.info(`Setting "${selector}" to "${value}"`)
        await this.page.$eval(
            selector,
            //@ts-ignore
            (el: HTMLInputElement) => {
                el.value = ''
            },
            value
        )
        await this.type(selector, value)
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
