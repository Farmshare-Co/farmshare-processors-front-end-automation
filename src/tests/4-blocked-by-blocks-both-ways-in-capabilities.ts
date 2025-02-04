import {
    BTN_CHUCK_ROAST_CAPABILITIES,
    ID_ARM_ROAST,
    BTN_ARM_ROAST_CAPABILITIES,
    ID_CHUCK_ROAST,
} from '../constants'
import Runner from '../Runner/Runner'
import wait from '../Runner/wait'

export default async (runner: Runner) => {
    await runner.clickTab('capabilities')
    await wait(3000)

    await runner.clickAtIndex('button', BTN_CHUCK_ROAST_CAPABILITIES)

    await wait(1000)

    await runner.select('select', ID_ARM_ROAST)
    await runner.clickDoneInDialog()

    await wait(5000)

    await runner.clickAtIndex('button', BTN_ARM_ROAST_CAPABILITIES)

    await wait(5000)
    await runner.assertValueEquals(
        'select',
        ID_CHUCK_ROAST,
        'Did not block the other way! Check Arm Roast!'
    )
}
