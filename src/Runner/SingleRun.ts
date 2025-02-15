import { buildLog } from '@sprucelabs/spruce-skill-utils'
import { assert, generateId } from '@sprucelabs/test-utils'
import { SingleRun } from '../automation.types'
import Stats from '../Stats'
import Runner from './Runner'
import wait from './wait'

export abstract class AbstractSingleRun implements SingleRun {
    protected runner: Runner
    protected log = buildLog('SingleRun')

    public constructor(runner: Runner) {
        this.runner = runner
    }

    public abstract run(): Promise<void>

    protected async login() {
        this.log.info('Logging in...')

        await this.runner.goto(this.runner.domain)

        await this.runner.click('button.text-primary')

        if (process.env.LOGIN_STRATEGY === 'email_and_password') {
            await this.loginWithEmailAndPassword()
        } else {
            await this.loginUsingGoogle()
        }

        await this.runner.waitForSelector(
            '[data-rr-ui-event-key="capabilities"]'
        )
    }

    private async loginWithEmailAndPassword() {
        await this.setInputValue('username', process.env.EMAIL!)
        await this.clickSubmit()
        await this.setInputValue('password', process.env.PASSWORD!)
        await this.clickSubmit()
    }

    protected async setInputValue(name: string, value: string) {
        const selector = name.includes('=') ? name : `[name="${name}"]`
        await this.runner.setInputValue(selector, value)
    }

    protected async selectValue(name: string, value: string) {
        const selector = name.includes('=') ? name : `[name="${name}"]`
        await this.runner.select(selector, value)
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

    protected async clickSaveInDialog() {
        this.log.info('Clicking done in dialog...')
        await this.runner.click('.modal-content .modal-footer .btn-primary')
        await wait(1000)
    }

    protected async clickTab(tab: string) {
        await this.runner.click(`[data-rr-ui-event-key="${tab}"]`)
        await wait(3000)
    }

    public clickChipEdit(id: string) {
        return this.runner.click(`button.edit-chip-${id}`)
    }

    public clickChip(id: string) {
        return this.runner.click(`button.chip-${id}`)
    }

    protected async clickCloseDialog() {
        await this.runner.click('.btn-close')
    }

    protected async assertChipIsEnabled(id: string) {
        const isEnabled = await this.getIsChipEnabled(id)
        assert.isTrue(isEnabled, `Chip ${id} should be enabled`)
    }

    protected async assertChipIsDisabled(id: string) {
        const isEnabled = await this.getIsChipEnabled(id)
        assert.isFalse(isEnabled, `Chip ${id} should be disabled`)
    }

    protected async fillOutRandomNameOnCutsheet() {
        await this.setInputValue('name', generateId())
    }

    protected async selectInspectionLevelOnCutsheet(inspection: string) {
        await this.runner.select('[name="inspectionLevel"]', inspection)
    }

    protected async getIsChipEnabled(id: string) {
        return await this.runner.getIsEnabled('button.chip-' + id)
    }

    protected async assertValueEquals(
        selector: string,
        expected: string,
        msg?: string
    ) {
        const value = await this.runner.getValue(selector)
        this.log.info(
            `Check ${Stats.checks++}: Asserting value of "${selector}" is equal to "${expected}"`
        )
        assert.isEqual(
            value,
            expected,
            msg ??
                `Input matching "${selector}" should have value "${expected}", but got "${value}".`
        )
    }

    protected async addJobAsProcessor(options?: AddJobOptions) {
        await this.clickNav('processor')
        await this.clickTab('add-job')
        const results = await this.addJob(options)
        return results
    }

    protected async addJob(options?: AddJobOptions) {
        const {
            firstName,
            lastName,
            phone,
            email,
            farmName,
            inspection,
            splitType,
            sex,
            totalHeads = 1,
        } = options ?? {}

        const date = (await this.runner.getProp(
            '.dropoff-date-box',
            'data-date'
        )) as string
        const slotsRemaining = await this.getSlotsRemainingOnAddJobTab()

        await this.runner.click('.dropoff-date-box button')

        await this.setInputValue(
            'requesterContactInformation.firstName',
            firstName ?? process.env.CUSTOMER_1_FIRST!
        )

        await this.setInputValue(
            'requesterContactInformation.lastName',
            lastName ?? process.env.CUSTOMER_1_LAST!
        )

        await this.setInputValue(
            '[id="floatingInput.requesterContactInformation.phone"]',
            phone ?? process.env.CUSTOMER_1_PHONE!
        )

        await this.setInputValue(
            '[id="floatingInput.requesterContactInformation.email"]',
            email ?? process.env.CUSTOMER_1_EMAIL!
        )

        await this.setInputValue(
            'requesterContactInformation.company',
            farmName ?? process.env.CUSTOMER_1_FARM!
        )

        for (let i = 0; i < totalHeads; i++) {
            await this.addAnimalHeadWhenAddingJob({
                inspection,
                splitType,
                sex,
                idx: i,
            })
        }

        await this.clickSubmit()

        await wait(5000)

        const id = this.parseJobIdFromUrl()

        return { date, slotsRemaining, id }
    }

    private parseJobIdFromUrl() {
        const url = this.runner.getCurrentUrl()
        const match = url.match(
            /\/(?:processing-job|scheduling)\/([^/]+)\/details/
        )
        const id = match?.[1]
        return id
    }

    private async addAnimalHeadWhenAddingJob(options?: {
        inspection: string | undefined | false
        splitType: string | undefined
        sex: string | undefined
        idx?: number
    }) {
        const { inspection, splitType, sex, idx = 0 } = options || {}

        await this.runner.click('.add-animal-btn')

        if (inspection !== false) {
            await this.selectValue(
                `scheduledHeads[${idx}].inspectionLevel`,
                inspection ?? 'exempt'
            )
        }

        await this.selectValue(
            `scheduledHeads[${idx}].splitType`,
            splitType ?? 'whole'
        )

        await this.selectValue(`scheduledHeads[${idx}].sex`, sex ?? 'm')

        await this.runner.click('.edit-contact')
        await this.runner.click('[name="isRequestedByUser"]')

        await this.clickSaveInDialog()
    }

    protected async getSlotsRemainingOnAddJobTab() {
        const slots = await this.runner.getInnerHtml(
            '.dropoff-date-box span.slots'
        )
        return parseInt(slots.trim(), 10)
    }

    protected async setDepositAndVerify(value: string) {
        await this.clickNav('processor')
        await this.clickTab('settings')
        await this.setInputValue('schedulingDeposit', value)
        await this.clickSubmit()
        await this.runner.refresh()
        await this.assertValueEquals('[name="schedulingDeposit"]', value)
    }

    public async deleteAllJobsInProgress(): Promise<void> {
        await this.clickNav('processor')
        await this.clickTab('agenda')
        do {
            const button = await this.runner.get('.in-progress .btn-cancel', {
                shouldThrowIfNotFound: false,
            })

            if (!button) {
                break
            }

            await button.click()
            await this.selectValue('reason', 'Other')
            await this.setInputValue('details', generateId())
            await this.clickSaveInDialog()
        } while (true)
    }

    protected async clickNav(name: string) {
        await this.runner.click(`.${name}.nav-link`)
        await this.waitForPageLoad()
    }

    protected async waitForPageLoad() {
        await this.runner.waitForSelector('#navbar')
    }

    protected async assertExists(select: string) {
        await this.runner.waitForSelector(select)
    }

    protected async addJobAsProducer(options?: AddJobAsProducerOptions) {
        const {
            firstName = process.env.CUSTOMER_1_FIRST!,
            lastName = process.env.CUSTOMER_1_LAST!,
            zip = process.env.CUSTOMER_1_ZIP!,
            phone = process.env.CUSTOMER_1_PHONE!,
            shouldCheckout = true,
            hasDeposit = true,
        } = options || {}

        await this.runner.openNewPage()

        await this.runner.redirect('/scheduling')
        await this.runner.click('.col button')

        const { date, slotsRemaining } = await this.addJob(options)

        if (!shouldCheckout) {
            return { date, slotsRemaining }
        }

        if (hasDeposit) {
            await this.enterDepositPaymentDetails({
                firstName,
                lastName,
                zip,
                phone,
            })
        }

        const id = this.parseJobIdFromUrl()

        return { date, slotsRemaining, id }
    }

    private async enterDepositPaymentDetails(options: {
        firstName: string
        lastName: string
        zip: string
        phone: string
    }) {
        const { firstName, lastName, zip, phone } = options
        await this.assertExists('[name="embedded-checkout"]')
        await this.runner.focusOnFrame('embedded-checkout')

        //optionally skip confirmation view
        const all = await this.runner.findAll('button.LinkActionButton', {
            shouldThrowIfNotFound: false,
        })
        await wait(1000)
        for (const link of all) {
            const innerHtml = await link.getProperty('innerHTML')
            const text = innerHtml.toString()
            if (text.includes('Pay without Link')) {
                //click the link
                await link.click()
                await wait(1000)
            }
        }

        await this.setInputValue('cardNumber', '4242424242424242')
        await this.setInputValue('cardExpiry', '12/45')
        await this.setInputValue('cardCvc', '123')
        await this.setInputValue('billingName', `${firstName} ${lastName}`)

        await this.setInputValue('billingPostalCode', zip)

        await wait(1000)
        await this.runner.click('[name="termsOfServiceConsentCheckbox"]')
        const phoneInput = await this.runner.get('[name="phoneNumber"]', {
            shouldThrowIfNotFound: false,
        })
        if (phoneInput) {
            await this.setInputValue('phoneNumber', phone)
        }

        await wait(1000)
        await this.runner.click('.SubmitButton')
        await wait(1000 * 5)
        await this.runner.close()

        await wait(3000)
        await this.clickSaveInDialog()
    }

    protected async clickAnimalHeadInJobDetails(idx = 0) {
        const link = await this.runner.findAll('.animal-heads-list a')
        await link[idx].click()
    }

    protected async assertInputValueEquals(
        statusSeletor: string,
        status: string
    ) {
        const value = await this.runner.getValue(statusSeletor)
        assert.isEqual(
            value,
            status,
            `${statusSeletor} was not updated set to the expected value`
        )
    }

    protected async getFirstCutsheetsNameInCutsheetDetails() {
        return await this.runner.getInnerText(
            '.cutsheet-catalogue .cutsheet-name'
        )
    }

    protected async clickEditOnFirstCutsheetOnAnimalDetails() {
        await this.runner.click(
            '.animal-head-cutsheet-information .btn-edit-cutsheet'
        )
    }

    protected async clickAddFirstCutsheetToCartOnCutsheetDetails() {
        await this.runner.click('.cutsheet-catalogue .btn-add')
    }

    protected async clickCheckboxesForAllSplitsInCutsheetDetailsDialog() {
        const all = await this.runner.findAll('[name="cutsheets"]')
        for (const checkbox of all) {
            await checkbox.click()
        }
    }

    protected async getFirstCutsheetNameOnAnimalDetails() {
        return await this.runner.getInnerText(
            '.animal-head-cutsheet-information .cutsheet-name td:last-of-type'
        )
    }

    protected addDays(date: string, days: number) {
        const dateParts = date.split('-').map((part) => parseInt(part))
        const d = new Date(dateParts[0], dateParts[1] - 1, dateParts[2])

        d.setDate(d.getDate() + days)

        const newDate = d.toISOString().split('T')[0]
        const datePartsNew = newDate.split('-')
        const zeroPadded = datePartsNew.map((part) => part.padStart(2, '0'))
        const inputFormat = `${zeroPadded[1]}${zeroPadded[2]}${zeroPadded[0]}`
        const isoFormat = `${zeroPadded[0]}-${zeroPadded[1]}-${zeroPadded[2]}`
        return { inputFormat, isoFormat }
    }

    protected async assertDayInCalendarIncludesEventAtStage(
        dropoffDate: string,
        stage: CalendarEventStage
    ) {
        const match = await this.getDateCell(dropoffDate)
        const expected = this.generateCalendarEventTitle(stage)

        assert.doesInclude(
            match,
            expected,
            `Could not find ${stage} date on calendar!`
        )
    }

    protected async assertDayInCalendarDoesNotIncludeEventAtStage(
        dropoffDate: string,
        stage: CalendarEventStage
    ) {
        const match = await this.getDateCell(dropoffDate)
        const expected = this.generateCalendarEventTitle(stage)

        assert.doesNotInclude(
            match,
            expected,
            `Could not find ${stage} date on calendar!`
        )
    }

    protected generateCalendarEventTitle(stage: CalendarEventStage) {
        return `${stage}: ${process.env.CUSTOMER_1_FARM}: 1 Beef`
    }

    protected async getDateCell(dropoffDate: string) {
        return await this.runner.getInnerText(`[data-date="${dropoffDate}"]`)
    }

    protected async declineAllJobsNeedingApproval() {
        const jobIds: string[] = []

        do {
            const jobId = await this.runner.getProp(
                '.pending-approvals [data-id]',
                'data-id',
                {
                    shouldThrowIfNotFound: false,
                }
            )

            if (!jobId) {
                break
            }

            jobIds.push(jobId)

            const reviewButton = await this.runner.get(
                `.pending-approvals [data-id="${jobId}"] .btn-review`
            )

            if (!reviewButton) {
                break
            }

            await reviewButton.click({})
            await this.runner.click('.modal-dialog .btn-danger')
        } while (true)
        return jobIds
    }

    protected async refreshAndWaitForLoad() {
        await this.runner.refresh()
        await this.waitForPageLoad()
    }
}

interface AddJobOptions {
    firstName?: string
    lastName?: string
    phone?: string
    email?: string
    farmName?: string
    inspection?: string | false
    splitType?: string
    sex?: string
    totalHeads?: number
}

export type CalendarEventStage = 'Drop-off' | 'Harvest' | 'Cut'

export type AddJobAsProducerOptions = AddJobOptions & {
    zip?: string
    shouldCheckout?: boolean
    hasDeposit?: boolean
}
