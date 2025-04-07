import { assert, generateId } from '@sprucelabs/test-utils'
import {
    ID_ARM_ROAST_EXEMPT,
    ID_ARM_ROAST_USDA,
    ID_BLADE_EXEMPT,
    ID_BLADE_USDA,
    ID_CHUCK_ROAST_EXEMPT,
    ID_CHUCK_ROAST_USDA,
    ID_EYE_ROAST_EXEMPT,
    ID_EYE_ROAST_USDA,
} from './constants'
import Runner from './Runner/Runner'
import { AbstractSingleRun, AddJobAsProducerOptions } from './Runner/SingleRun'
import wait from './Runner/wait'

void (async () => {
    const runner = await Runner.Runner()
    const run = new Run(runner)
    await run.login()
    await run.run()
    await runner.shutdown()
    console.log('TEST PASSED!')
})()

//046
export default class Run extends AbstractSingleRun {
    public async run(): Promise<void> {
        await this.navigateToCapabilities()
        await this.runner.click('button.beef-exempt')

        let chuckRoastId = ID_CHUCK_ROAST_EXEMPT
        let armRoastId = ID_ARM_ROAST_EXEMPT
        let bladeId = ID_BLADE_EXEMPT
        let eyeRoastId = ID_EYE_ROAST_EXEMPT

        await this.clearBlockedByCuts([
            chuckRoastId,
            armRoastId,
            bladeId,
            eyeRoastId,
        ])

        await this.executeBlockedByRoutine(
            chuckRoastId,
            armRoastId,
            bladeId,
            eyeRoastId
        )
        await this.runner.click('[data-rr-ui-event-key="beef-usda"]')

        chuckRoastId = ID_CHUCK_ROAST_USDA
        armRoastId = ID_ARM_ROAST_USDA
        bladeId = ID_BLADE_USDA
        eyeRoastId = ID_EYE_ROAST_USDA
        await this.clearBlockedByCuts([
            chuckRoastId,
            armRoastId,
            bladeId,
            eyeRoastId,
        ])

        await this.executeBlockedByRoutine(
            chuckRoastId,
            armRoastId,
            bladeId,
            eyeRoastId
        )
    }
}
