import Runner from './Runner/Runner'
import { AbstractSingleRun } from './Runner/SingleRun'

void (async () => {
    const runner = await Runner.Runner()
    const run = new Run(runner)
    await run.login()
    await run.run()
    await runner.shutdown()
    console.log('TEST PASSED!')
})()

export default class Run extends AbstractSingleRun {
    public async run(): Promise<void> {
        await this.clickNav('processor')
        await this.clickTab('capabilities')

        await this.runner.click('[name="editMode"]')
        await this.runner.click('.cut-header button')
        await this.setInputValue('name', 'Top Serlain (USDA)')
        await this.setInputValue('primal', 'Chuck')
        await this.setInputValue('type', 'chop')
        await this.clickSaveInDialog()

        await this.runner.click('[name="editMode"]')

        await this.runner.click('.card-body button')
        const prop = await this.runner.getProp('.card-body button', 'className')
        const chipClass = prop?.match(/\bchip-[^\s]+/)?.[0] || ''
        await this.clickSubmit()
        await this.clickTab('cutsheets')
        await this.clickAddCutsheet()
        await this.setInputValue('inspectionLevel', 'exempt')

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
