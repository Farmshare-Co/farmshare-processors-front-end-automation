import { assertOptions } from '@sprucelabs/schema'
import { buildLog, diskUtil } from '@sprucelabs/spruce-skill-utils'
import { assert } from '@sprucelabs/test-utils'
import env from 'dotenv'
import puppeteer, { Browser, Frame, Page } from 'puppeteer'
import Stats from '../Stats'
import wait from './wait'
env.config()

export default class Runner {
    public domain: string
    private log = buildLog('Runner')
    private history: RunnerHistoryItem[] = []

    protected constructor(
        protected page: PageOrFrame,
        protected browser: Browser
    ) {
        this.domain = process.env.DOMAIN ?? 'https://partners-dev.farmshare.co'
    }

    public static async Runner() {
        //make sure all env's are set
        assertOptions(process, [
            'env.EMAIL',
            'env.PASSWORD',
            'env.LOGIN_STRATEGY',
            'env.DOMAIN',
            'env.CUSTOMER_1_FIRST',
            'env.CUSTOMER_1_LAST',
            'env.CUSTOMER_1_PHONE',
            'env.CUSTOMER_1_EMAIL',
            'env.CUSTOMER_1_FARM',
            'env.CUSTOMER_1_ZIP',
        ])

        const { page, browser } = await Runner.Page()
        return new this(page, browser)
    }

    public static async Page() {
        const browser = await puppeteer.launch({
            headless: false,
            userDataDir: diskUtil.createRandomTempDir(),
        })
        const page = await browser.newPage()
        await page.setViewport({
            width: 1500,
            height: 1200,
        })
        return { page, browser }
    }

    public async openNewPage() {
        this.history.push({ browser: this.browser, page: this.page })

        const { page, browser } = await Runner.Page()
        this.page = page
        this.browser = browser
    }

    public async findAll(selector: string) {
        await this.waitForSelector(selector)
        return await this.page.$$(selector)
    }

    public async refresh() {
        if (this.page instanceof Page) {
            await this.page.reload()
        } else {
            throw new Error('You cannot refresh an iFrame!')
        }
    }

    public async clickAtIndex(selector: string, idx: number) {
        const button = await this.getAtIndex(selector, idx)
        await button.click()
    }

    public async get(
        selector: string,
        options?: { shouldThrowIfNotFound?: boolean }
    ) {
        const { shouldThrowIfNotFound = true } = options ?? {}

        if (shouldThrowIfNotFound) {
            await this.waitForSelector(selector)
        }
        const node = await this.page.$(selector)

        if (!node && shouldThrowIfNotFound) {
            throw new Error(
                `Could not find element with selector '${selector}'!`
            )
        }

        return node!
    }

    public async getAtIndex(selector: string, idx: number) {
        const nodes = await this.page.$$(selector)
        const node = nodes[idx]

        if (!node) {
            throw new Error(
                `Could not find element with selector '${selector}' at index ${idx}!. I did find ${nodes.length} elements, though!`
            )
        }

        return node!
    }

    public async getInnerHtml(selector: string) {
        const node = await this.get(selector)
        return await node.evaluate((node) => node.innerHTML)
    }

    public async getInnerText(selector: string) {
        const node = await this.get(selector)
        return await node.evaluate((node) => node.textContent)
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
        this.log.info(`Check ${Stats.checks++}: Selector "${selector}"`)
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
        const disabled = await this.getProp(selector, 'disabled')
        return !disabled
    }

    public async getProp(selector: string, propName: string) {
        await this.waitForSelector(selector)
        return await this.page.$eval(
            selector,
            //@ts-ignore
            (el: HTMLInputElement, propName: string) => {
                if (propName.startsWith('data')) {
                    return el.getAttribute(propName)
                }
                //@ts-ignore
                return el[propName]
            },
            propName
        )
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

    public async focusOnFrame(urlLookup: string) {
        await wait(1000)
        if (this.page instanceof Frame) {
            throw new Error('You cannot get an iFrame in an iFrame!')
        }

        const match = this.page
            .frames()
            .find((frame) => frame.url().includes(urlLookup))

        assert.isTruthy(
            match,
            `Could not find frame with url containing ${urlLookup}`
        )

        this.history.push({ page: this.page })
        this.page = match
    }

    public async close() {
        const last = this.history.pop()
        if (this.page instanceof Page) {
            await this.page.close()
        }

        this.browser = last?.browser ?? this.browser
        this.page = last?.page ?? this.page
    }

    public async dragAndDrop(
        sourceSelector: string,
        destinationSelector: string
    ) {
        const source = await this.get(sourceSelector)
        const destination = await this.get(destinationSelector)
        const sourceBox = await source!.boundingBox()
        const destinationBox = await destination?.boundingBox()

        const page = this.page as Page

        await page.mouse.move(
            sourceBox!.x + sourceBox!.width / 2,
            sourceBox!.y + sourceBox!.height / 2
        )

        await page.mouse.down()

        await page.mouse.move(
            destinationBox!.x + destinationBox!.width / 2,
            destinationBox!.y + destinationBox!.height / 2,
            {
                steps: 100,
            }
        )

        await page.mouse.up()
    }
}

interface RunnerHistoryItem {
    browser?: Browser
    page: PageOrFrame
}

type PageOrFrame = Page | Frame
