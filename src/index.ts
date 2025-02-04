import {
    BTN_CHUCK_ROAST_CAPABILITIES,
    ID_ARM_ROAST,
    BTN_ARM_ROAST_CAPABILITIES,
    ID_CHUCK_ROAST,
} from './constants'
import Runner from './Runner/Runner'
import wait from './Runner/wait'

void (async () => {
    const runner = await Runner.Runner()
    await runner.login()
    // await runner.redirect('/admin/job-export')
    await runner.clickTab('capabilities')
    await wait(3000)

    //select chuck roast
    await runner.clickAtIndex('button', BTN_CHUCK_ROAST_CAPABILITIES)

    //make it blocked by arm roast
    await runner.select('select', ID_ARM_ROAST)
    await runner.clickDoneInDialog()

    //confirm it's blocked the other way
    //select arm roast
    await runner.clickAtIndex('button', BTN_ARM_ROAST_CAPABILITIES)

    await runner.assertValueEquals(
        'select',
        ID_CHUCK_ROAST,
        'Did not block the other way! Check Arm Roast!'
    )

    await runner.shutdown()
})()
