import { buildLog } from '@sprucelabs/spruce-skill-utils'
import { assert } from '@sprucelabs/test-utils'
import { SingleRun } from '../automation.types'
import Runner from './Runner'
import wait from './wait'

export abstract class AbstractSingleRun implements SingleRun {
    protected runner: Runner
    protected log = buildLog('SingleRun')

    public constructor(runner: Runner) {
        this.runner = runner
    }

    public abstract run(): Promise<void>

    public async login() {
        this.log.info('Logging in...')

        await this.runner.goto(this.runner.domain)

        await this.runner.click('button.text-primary')

        if (process.env.EMAIL) {
            await this.loginWithEmailAndPassword()
        } else {
            await this.loginUsingGoogle()
        }

        await this.runner.waitForSelector(
            '[data-rr-ui-event-key="capabilities"]'
        )
    }

    private async loginWithEmailAndPassword() {
        await this.runner.type('[name="username"]', process.env.EMAIL!)
        await this.clickSubmit()
        await this.runner.type('[name="password"]', process.env.PASSWORD!)
        await this.clickSubmit()
    }

    protected async clickSubmit() {
        await this.runner.click('[type="submit"]')
    }

    private async loginUsingGoogle() {
        await this.runner.click('[data-provider="google-apps"]')
        await this.runner.waitForSelector('[autocomplete="username webauthn"]')
        await this.runner.type(
            '[autocomplete="username webauthn"]',
            process.env.GOOGLE_EMAIL!
        )
        await this.runner.click('[id="identifierNext"]')

        await wait(2000)

        await this.runner.waitForSelector('[type="password"]')

        await wait(2000)
        await this.runner.type(
            '[type="password"]',
            process.env.GOOGLE_PASSWORD!
        )

        await this.runner.clickAtIndex('button', 1)
    }

    public async clickDoneInDialog() {
        this.log.info('Clicking done in dialog...')
        await this.runner.click('.modal-content .modal-footer .btn-primary')
        await wait(1000)
    }

    public async clickTab(tab: string) {
        await this.runner.click(`[data-rr-ui-event-key="${tab}"]`)
        await wait(3000)
    }

    public clickChipEdit(id: string) {
        return this.runner.click(`button.edit-chip-${id}`)
    }

    public clickChip(id: string) {
        return this.runner.click(`button.chip-${id}`)
    }

    public async assertValueEquals(
        selector: string,
        expected: string,
        msg?: string
    ) {
        const value = await this.runner.getValue(selector)
        this.log.info(
            `Asserting value of "${selector}" is equal to "${expected}"`
        )
        assert.isEqual(
            value,
            expected,
            msg ??
                `Input matching "${selector}" should have value "${expected}", but got "${value}".`
        )
    }
}
