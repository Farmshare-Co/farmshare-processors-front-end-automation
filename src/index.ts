import { generateId } from '@sprucelabs/test-utils'
import Runner from './Runner/Runner'

void (async () => {
    const runner = await Runner.Runner()
    await runner.login()

    await runner.clickTab('cutsheets')
    await runner.click('button.btn-add-cutsheet')

    await runner.select('[name="inspectionLevel"]', 'usda')
    await runner.type('[name="name"]', generateId())
})()
