import { assert, generateId } from '@sprucelabs/test-utils'
import {
    ID_ARM_ROAST_EXEMPT,
    ID_BLADE_EXEMPT,
    ID_CHUCK_ROAST_EXEMPT,
    ID_EYE_ROAST_EXEMPT,
} from './constants'
import Runner from './Runner/Runner'
import { AbstractSingleRun } from './Runner/SingleRun'

void (async () => {
    const runner = await Runner.Runner()
    const run = new Run(runner)
    await run.run()
})()

export default class Run extends AbstractSingleRun {
    public async run(): Promise<void> {
        await this.runner.login()
    }
}
