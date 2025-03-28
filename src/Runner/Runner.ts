import { assertOptions } from '@sprucelabs/schema'
import { buildLog, diskUtil } from '@sprucelabs/spruce-skill-utils'
import { assert } from '@sprucelabs/test-utils'
import env from 'dotenv'
import puppeteer, { Browser, Frame, Page } from 'puppeteer'
import Stats from '../Stats'
import { applyLogPrefixToMethods } from './applyLogPrefixToMethods'
import wait from './wait'
env.config()

export default class Runner {
    public domain: string
    private originalLog = buildLog('Runner')
    private log = this.originalLog
    private history: RunnerHistoryItem[] = []

    protected constructor(
        protected page: PageOrFrame,
        protected browser: Browser
    ) {
        this.domain = process.env.DOMAIN ?? 'https://partners-dev.farmshare.co'
        applyLogPrefixToMethods(this)
    }

    public setLogPrefix(prefix: string) {
        this.log = this.originalLog.buildLog(prefix)
    }

    public static async Runner() {
        //make sure all env's are set
        assertOptions(process, [
            'env.EMAIL',
            'env.PASSWORD',
            'env.DOMAIN',
            'env.CUSTOMER_1_FIRST',
            'env.CUSTOMER_1_LAST',
            'env.CUSTOMER_1_PHONE',
            'env.CUSTOMER_1_EMAIL',
            'env.CUSTOMER_1_FARM',
            'env.CUSTOMER_1_ZIP',
            'env.CUSTOMER_2_FIRST',
            'env.CUSTOMER_2_LAST',
            'env.CUSTOMER_2_PHONE',
            'env.CUSTOMER_2_EMAIL',
            'env.CUSTOMER_2_FARM',
            'env.CUSTOMER_2_ZIP',
        ])

        const { page, browser } = await Runner.Page()
        return new this(page, browser)
    }

    public static async Page() {
        const browser = await puppeteer.launch({
            headless: false,
            userDataDir: diskUtil.createRandomTempDir(),
            protocolTimeout: 60000,
        })
        const page = await browser.newPage()
        await page.setViewport({
            width: 1500,
            height: parseInt(process.env.VIEWPORT_HEIGHT ?? `${1200}`, 10),
        })
        return { page, browser }
    }

    public async openNewPage() {
        this.history.push({ browser: this.browser, page: this.page })

        const { page, browser } = await Runner.Page()
        this.page = page
        this.browser = browser
    }

    public async scrollTo() {
        await this.page.evaluate(() => {
            window.scrollBy(0, 10000000)
        })
    }

    public async findAll(selector: string, options?: SelectOptions) {
        await this.waitForSelector(selector, options)
        return await this.page.$$(selector)
    }

    public async getValuesForSelectOptions(selector: string) {
        debugger
        const options = await this.getOptionsForSelect(selector)
        const values = options.map((o) => o.value)

        return values.filter((v) => !!v) as string[]
    }

    public async getOptionsForSelect(selector: string) {
        const values = await this.page.$$eval(selector + ' option', (options) =>
            options.map((option) => ({
                value: option.getAttribute('value'),
                label: option.textContent,
            }))
        )

        return values.filter((v) => !!v.value) as {
            value: string
            label: string
        }[]
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

    public async get(selector: string, options?: SelectOptions) {
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
    public async getInnerTextAll(selector: string) {
        const node = await this.findAll(selector)
        const text: string[] = []
        for (const n of node) {
            const textContent = await n.evaluate((node) => node.textContent)
            text.push(textContent!)
        }
        return text
    }

    public async goto(url: string) {
        await this.page.goto(url)
    }

    public async click(selector: string) {
        await this.waitForSelector(selector)

        this.log.info(`Clicking "${selector}"`)
        await this.page.click(selector)
        await wait(1000)
    }

    public async waitForSelector(selector: string, options?: SelectOptions) {
        const { shouldThrowIfNotFound = true } = options ?? {}

        if (!shouldThrowIfNotFound) {
            this.log.info(`Skipping check for selector "${selector}"`)
            return null
        }

        this.log.info(`Check ${Stats.checks++}: Selector "${selector}"`)

        try {
            return await this.page.waitForSelector(selector)
        } catch (err) {
            throw err
        }
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

    public async getProp(
        selector: string,
        propName: string,
        options?: SelectOptions
    ) {
        const { shouldThrowIfNotFound = true } = options ?? {}

        await this.waitForSelector(selector, options)

        try {
            return (await this.page.$eval(
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
            )) as string
        } catch (err) {
            if (!shouldThrowIfNotFound) {
                return null
            }
            throw err
        }
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
        await wait(1000)
    }

    public async dragAndDrop(
        sourceSelector: string,
        destinationSelector: string
    ) {
        const page = this.page as Page

        await this.hoverOver(sourceSelector)

        await page.mouse.down()

        await wait(500)
        await page.mouse.move(1, 1)
        await wait(500)

        await this.hoverOver(destinationSelector)

        await page.mouse.up()
    }

    public async hoverOver(sourceSelector: string) {
        const source = await this.get(sourceSelector)
        const sourceBox = await source!.boundingBox()
        await (this.page as Page).mouse.move(
            sourceBox!.x + sourceBox!.width / 2,
            sourceBox!.y + sourceBox!.height / 2
        )
    }

    public async setDownloadPath(path: string) {
        const downloadDir = process.env.DOWNLOAD_DIR
        if (!downloadDir) {
            throw new Error('Please define DOWNLOAD_DIR in your environment!')
        }

        const fullPath = diskUtil.resolvePath(downloadDir, path)

        if (!diskUtil.doesDirExist(fullPath)) {
            diskUtil.createDir(fullPath)
        }

        if (!(this.page instanceof Page)) {
            throw new Error('You cannot set download path in an iFrame!')
        }

        const client = await this.page.createCDPSession()
        await client.send('Page.setDownloadBehavior', {
            behavior: 'allow',
            downloadPath: fullPath,
        })

        return fullPath
    }

    public async takeScreenshot(path: string) {
        const screenshotDir = process.env.SCREENSHOT_DIR
        if (!screenshotDir) {
            throw new Error('Please define SCREENSHOT_DIR in your environment!')
        }

        const screenshotPath =
            diskUtil.resolvePath(screenshotDir, path) + '.png'

        // create dirs recursively to avoid errors, dropping the file at the end first
        const pathWithoutFile = screenshotPath.split('/').slice(0, -1).join('/')
        diskUtil.createDir(pathWithoutFile)

        this.log.info(`Taking screenshot at "${screenshotPath}"`)

        if (this.page instanceof Page) {
            await this.page.screenshot({
                path: screenshotPath,
            })
        } else {
            throw new Error('Cannot take screenshot from an iFrame!')
        }
    }
}

interface RunnerHistoryItem {
    browser?: Browser
    page: PageOrFrame
}

type PageOrFrame = Page | Frame

interface SelectOptions {
    shouldThrowIfNotFound?: boolean
}
