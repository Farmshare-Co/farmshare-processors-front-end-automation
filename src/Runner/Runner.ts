import env from 'dotenv'
import puppeteer, { Page } from 'puppeteer'
import wait from './wait'
env.config()

export default class Runner {
    protected constructor(protected page: Page) {}

    public static async Runner() {
        const browser = await puppeteer.launch({
            headless: false,
        })
        const page = await browser.newPage()
        await page.setViewport({
            width: 1024,
            height: 768,
        })
        return new this(page)
    }

    public async login() {
        await this.goto('https://partners-dev.farmshare.co')
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
    }

    public async clickAtIndex(selector: string, idx: number) {
        const loginButton = await this.getAtIndex(selector, idx)
        await loginButton.click()
    }

    public async getAtIndex(selector: string, idx: number) {
        const buttons = await this.page.$$(selector)
        const loginButton = buttons[idx]
        return loginButton
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

    public async type(selector: string, text: string) {
        await this.page.type(selector, text)
    }
}
