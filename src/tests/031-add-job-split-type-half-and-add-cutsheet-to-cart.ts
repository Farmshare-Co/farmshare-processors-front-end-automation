import { assert } from '@sprucelabs/test-utils'
import { AbstractSingleRun } from '../Runner/SingleRun'
import wait from '../Runner/wait'

export default class Run extends AbstractSingleRun {
    public async run(): Promise<void> {
        await this.deleteAllJobsInProgress()
        await this.clickNav('processor')
        await this.clickTab('settings')
        await this.toggleChips(
            ['whole', 'half'],
            ['quarters', 'half_and_two_quarters']
        )
        await this.clickSubmit()
        await this.clickTab('add-job')
        await this.fillOutAddJobForm({
            firstName: 'Test',
            lastName: 'Farms',
            farmName: 'Test Farms',
            phone: '555-123-1234',
            email: 'testFarm@gmail.com',
            inspection: false,
            totalHeads: 0,
        })
        await this.runner.click('.add-animal-btn')

        await this.selectValue(`scheduledHeads[0].splitType`, 'half')

        await this.runner.clickAtIndex('.edit-contact', 0)

        const contacts = [
            {
                firstName: 'Kizizi',
                lastName: 'Farms',
                email: 'kizizi@gmail.com',
            },
            { firstName: 'Blue', lastName: 'Farms', email: 'blue@gmail.com' },
        ]

        await this.fillOutAnimalHeadContactForm({
            firstName: contacts[0].firstName,
            lastName: contacts[0].lastName,
            email: contacts[0].email,
        })

        await this.clickSaveInDialog()

        await this.runner.clickAtIndex('.edit-contact', 1)

        await this.fillOutAnimalHeadContactForm({
            firstName: contacts[1].firstName,
            lastName: contacts[1].lastName,
            email: contacts[1].email,
        })

        await this.clickSaveInDialog()
        await this.clickSubmit()

        await wait(400)
        const jobId = this.parseJobIdFromUrl()
        await this.navigateToJobDetailBySearch({ jobId, search: 'Test Farms' })

        await this.clickTab('cutsheets')

        await this.runner.click('.edit-all-cutsheets')

        await this.runner.click('.btn-add-to-cart')

        await this.clickCheckboxesForAllSplitsInCutsheetDetailsDialog()

        await this.assertInnerTextIntoCutsheetsCart(contacts)

        await this.clickSaveInDialog()
        await this.clickSubmit()
    }

    private async assertInnerTextIntoCutsheetsCart(contacts: any[]) {
        for (let idx = 1; idx <= contacts.length; idx++) {
            const { firstName, lastName } = contacts[idx - 1]
            const selector = `[for="form.cutsheets.usdaBeef1${firstName}${lastName}Half${idx}"]`
            const value = await this.runner.getInnerText(selector)
            assert.isTrue(value?.includes(`${firstName} ${lastName}`))
        }
    }

    private async fillOutAnimalHeadContactForm(options: {
        firstName: string
        lastName: string
        email: string
    }) {
        const { firstName, lastName, email } = options
        await this.runner.setInputValue(
            '[id="floatingInput.firstName"]',
            firstName
        )

        await this.runner.setInputValue(
            '[id="floatingInput.lastName"]',
            lastName
        )

        await this.runner.setInputValue('[id="floatingInput.email"]', email)
    }
}
