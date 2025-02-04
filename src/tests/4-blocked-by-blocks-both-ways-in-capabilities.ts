import {
    ID_ARM_ROAST,
    ID_BLADE,
    ID_CHUCK_ROAST,
    ID_EYE_ROAST,
} from '../constants'
import Runner from '../Runner/Runner'
import wait from '../Runner/wait'

export default async (runner: Runner) => {
    await runner.clickTab('capabilities')
    await wait(3000)

    await runner.click(`button.blocked-by-${ID_CHUCK_ROAST}`)

    await runner.select('select[name="selectedCutBlockers.0"]', ID_ARM_ROAST)
    await runner.select('select[name="selectedCutBlockers.1"]', ID_BLADE)
    await runner.select('select[name="selectedCutBlockers.2"]', ID_EYE_ROAST)

    await runner.clickDoneInDialog()

    await runner.click(`button.blocked-by-${ID_ARM_ROAST}`)

    await runner.assertValueEquals(
        'select[name="selectedCutBlockers.0"]',
        ID_CHUCK_ROAST,
        'Did not block the other way! Check Arm Roast to make sure it has selected Chuck Roast!'
    )

    await runner.clickDoneInDialog()

    await runner.click(`button.blocked-by-${ID_BLADE}`)

    await runner.assertValueEquals(
        'select[name="selectedCutBlockers.0"]',
        ID_CHUCK_ROAST,
        'Did not block the other way! Check Blade!'
    )

    await runner.assertValueEquals(
        'select[name="selectedCutBlockers.1"]',
        'Select one...',
        'Showing duplicate Chuck Roast! Check Blade!'
    )

    await runner.clickDoneInDialog()

    await runner.click(`button.blocked-by-${ID_EYE_ROAST}`)

    await runner.assertValueEquals(
        'select[name="selectedCutBlockers.0"]',
        ID_CHUCK_ROAST,
        'Did not block the other way! Check Eye Roast!'
    )

    await runner.select('select[name="selectedCutBlockers.0"]', '')

    await runner.clickDoneInDialog()

    await runner.click(`button.blocked-by-${ID_CHUCK_ROAST}`)

    await runner.assertValueEquals(
        'select[name="selectedCutBlockers.0"]',
        'Select one...',
        'Did not unblock the other way! Check Chuck Roast!'
    )
}
