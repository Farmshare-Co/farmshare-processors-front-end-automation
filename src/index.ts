import { assert, generateId } from '@sprucelabs/test-utils'
import {
    ID_ARM_ROAST_EXEMPT,
    ID_ARM_ROAST_USDA,
    ID_BACK_FAT_EXEMPT,
    ID_BLADE_EXEMPT,
    ID_BLADE_USDA,
    ID_BONE_IN_ROAST_EXEMPT,
    ID_CHUCK_ROAST_EXEMPT,
    ID_CHUCK_ROAST_USDA,
    ID_CHUCK_STEAK_EXEMPT,
    ID_CUBE_STEAK_EXEMPT,
    ID_DINO_EXEMPT,
    ID_EYE_ROAST_EXEMPT,
    ID_EYE_ROAST_USDA,
    ID_FLANK_STEAK_EXEMPT,
    ID_KOREAN_SHORT_RIBS_EXEMPT,
    ID_PORTERHOUSE_EXEMPT,
    ID_RIBEYE_EXEMPT,
    ID_SIRLOIN_CAP_EXEMPT,
    ID_SKIRT_STEAK_EXEMPT,
    ID_WHOLE_SHANK_EXEMPT,
} from './constants'
import Runner from './Runner/Runner'
import { AbstractSingleRun } from './Runner/SingleRun'
import wait from './Runner/wait'

void (async () => {
    const runner = await Runner.Runner()
    const run = new Run(runner)
    await run.login()
    await run.run()
    await runner.shutdown()
    console.log('TEST PASSED!')
})()

//015
export default class Run extends AbstractSingleRun {
    public async run(): Promise<void> {
        await this.deleteAllJobsInProgress()
        const { date: dropoffDate } = await this.addJobAsProcessor()

        await this.clickAnimalHeadInJobDetails()

        await this.runner.click('.btn-edit-head-details')

        const { inputFormat: killDate, isoFormat: killDateCalendar } =
            this.addDays(dropoffDate, 1)
        const { inputFormat: cutDate, isoFormat: cutDateCalendar } =
            this.addDays(dropoffDate, 2)

        await this.setInputValue('killDate', killDate)
        await this.setInputValue('cutDate', cutDate)

        await this.clickSaveInDialog()

        await this.navigateToCalendar()

        await this.assertDayInCalendarIncludesEventAtStage(
            dropoffDate,
            'Drop-off'
        )

        await this.runner.click('.btn-drop-off')

        await this.assertDayInCalendarDoesNotIncludeEventAtStage(
            dropoffDate,
            'Drop-off'
        )

        await this.runner.click('.btn-harvest')

        await this.assertDayInCalendarIncludesEventAtStage(
            killDateCalendar,
            'Harvest'
        )

        await this.runner.click('.btn-harvest')

        await this.assertDayInCalendarDoesNotIncludeEventAtStage(
            killDateCalendar,
            'Harvest'
        )

        await this.runner.click('.btn-cut')

        await this.assertDayInCalendarIncludesEventAtStage(
            cutDateCalendar,
            'Cut'
        )

        await this.runner.click('.btn-cut')

        await this.assertDayInCalendarDoesNotIncludeEventAtStage(
            cutDateCalendar,
            'Cut'
        )
    }
}
