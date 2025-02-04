// import { assert } from '@sprucelabs/test-utils'
import Runner from './Runner/Runner'
import wait from './Runner/wait'

void (async () => {
    const runner = await Runner.Runner()
    await runner.login()
    // await runner.redirect('/admin/job-export')
    await runner.waitForSelector('[data-rr-ui-event-key="capabilities"]')
    await runner.click('[data-rr-ui-event-key="capabilities"]')

    await runner.waitForSelector('button')
    await wait(3000)

    //select chuck roast
    await runner.clickAtIndex('button', 15);

    //make it blocked by arm roast
    await runner.select('select', '66fac7b8e56b9f6d628a5401');
    await runner.clickDoneInDialog()

    //confirm it's blocked the other way
    //select arm roast
    await runner.clickAtIndex('button', 19);

    // const value = await runner.getValue('select');
    // debugger


    // select.('value', '66fac7b8e56b9f6d628a5401')

    // await runner.shutdown()
})()
