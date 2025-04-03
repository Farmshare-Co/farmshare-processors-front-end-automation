import { assert } from '@sprucelabs/test-utils'
import { AbstractSingleRun } from '../Runner/SingleRun'
import wait from '../Runner/wait'

export default class Run extends AbstractSingleRun {
    public async run(): Promise<void> {
        await this.navigateToCapabilities()

        await this.runner.click('[name="editMode"]')
        await this.runner.click('.cut-header button')
        await this.setInputValue('name', 'Top Serlain (USDA)')
        await this.setInputValue('primal', 'Chuck')
        await this.setInputValue('type', 'chop')
        await this.clickSaveInDialog()

        await this.runner.click('[name="editMode"]')

        await this.runner.click('.cuts-card button')

        const prop = await this.runner.getProp('.cuts-card button', 'className')
        const chipClass = prop?.match(/\bchip-[^\s]+/)?.[0] || ''
        await this.clickSubmit()

        await this.navigateToCutsheets()
        await this.clickAddCutsheet()
        await this.setInputValue('inspectionLevel', 'exempt')

        await wait(5000)

        const firstCheck = await this.runner.getProp(
            `.${chipClass}`,
            'className',
            {
                shouldThrowIfNotFound: false,
            }
        )

        assert.isEqual(firstCheck, null)

        await this.setInputValue('inspectionLevel', 'usda')

        const secondCheck = await this.runner.getProp(
            `.${chipClass}`,
            'className',
            {
                shouldThrowIfNotFound: false,
            }
        )

        assert.isNotEqual(secondCheck, null)

        await wait(5000)
    }
}
