import env from 'dotenv'
import puppeteer, { Browser, Page } from 'puppeteer'
import wait from './wait'
env.config()

export default class Runner {
   private domain: string
    protected constructor(protected page: Page, protected browser: Browser) {
        this.domain = 'https://partners-dev.farmshare.co'
    }

    public static async Runner() {
        const browser = await puppeteer.launch({
            headless: false,
        })
        const page = await browser.newPage()
        await page.setViewport({
            width: 1024,
            height: 768,
        })
        return new this(page, browser)
    }

    public async login() {
        await this.goto(this.domain)
        await this.click('button.text-primary')
        await this.waitForSelector('[data-provider="google-apps"]')
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

        await this.waitForSelector('[data-rr-ui-event-key="capabilities"]')
    }

    public async clickAtIndex(selector: string, idx: number) {
        const button = await this.getAtIndex(selector, idx)
        await button.click()
    }

    public async get(selector: string) {
        const node = await this.page.$(selector)

        if (!node) {
            throw new Error(`Could not find element with selector '${selector}'!`)
        }
        
        return node
    }

    public async getAtIndex(selector: string, idx: number) {
        const nodes = await this.page.$$(selector)
        const node = nodes[idx]

        if (!node) {
            throw new Error(`Could not find element with selector '${selector}' at index ${idx}!. I did find ${nodes.length} elements, though!`)
        }

        return node
    }

    public async goto(url: string) {
        await this.page.goto(url)
    }

    public async click(selector: string) {
        await this.page.click(selector)
    }

    public async waitForSelector(selector: string) {
       await this.page.waitForSelector(selector)
    }

    public async clickDoneInDialog() {
        await this.click('.modal-content .modal-footer .btn-primary')
    }

    public async select(selector: string, value: string) {
        await this.page.select(selector, value)
    }

    // public async getValue(selector: string) {
        // const element = await this.waitForSelector(selector)
        // return element?.evaluate((node) => node.value)
    // }

    public async type(selector: string, text: string) {
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
