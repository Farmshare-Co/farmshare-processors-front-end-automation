import {
    ID_ARM_ROAST_EXEMPT,
    ID_ARM_ROAST_USDA,
    ID_BLADE_EXEMPT,
    ID_BLADE_USDA,
    ID_CHUCK_ROAST_EXEMPT,
    ID_CHUCK_ROAST_USDA,
    ID_EYE_ROAST_EXEMPT,
    ID_EYE_ROAST_USDA,
} from '../constants'
import { AbstractSingleRun } from '../Runner/SingleRun'

export default class Run extends AbstractSingleRun {
    public async run(): Promise<void> {
        await this.runner.clickTab('capabilities')

        let chuckRoastId = ID_CHUCK_ROAST_EXEMPT
        let armRoastId = ID_ARM_ROAST_EXEMPT
        let bladeId = ID_BLADE_EXEMPT
        let eyeRoastId = ID_EYE_ROAST_EXEMPT

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

        await this.executeBlockedByRoutine(
            chuckRoastId,
            armRoastId,
            bladeId,
            eyeRoastId
        )
    }

    private async executeBlockedByRoutine(
        chuckRoastId: string,
        armRoastId: string,
        bladeId: string,
        eyeRoastId: string
    ) {
        await this.runner.clickChipEdit(chuckRoastId)

        await this.setBlockedByValue(0, armRoastId)
        await this.setBlockedByValue(1, bladeId)
        await this.setBlockedByValue(2, eyeRoastId)

        await this.runner.clickDoneInDialog()

        await this.runner.clickChipEdit(armRoastId)

        await this.runner.assertValueEquals(
            'select[name="selectedCutBlockers.0"]',
            chuckRoastId,
            'Did not block the other way! Check Arm Roast to make sure it has selected Chuck Roast!'
        )

        await this.runner.clickDoneInDialog()

        await this.runner.clickChipEdit(bladeId)

        await this.runner.assertValueEquals(
            'select[name="selectedCutBlockers.0"]',
            chuckRoastId,
            'Did not block the other way! Check Blade!'
        )

        await this.runner.assertValueEquals(
            'select[name="selectedCutBlockers.1"]',
            'Select one...',
            'Showing duplicate Chuck Roast! Check Blade!'
        )

        await this.runner.clickDoneInDialog()

        await this.runner.clickChipEdit(eyeRoastId)

        await this.runner.assertValueEquals(
            'select[name="selectedCutBlockers.0"]',
            chuckRoastId,
            'Did not block the other way! Check Eye Roast!'
        )

        await this.runner.select(
            'select[name="selectedCutBlockers.0"]',
            'Select one...'
        )

        await this.runner.clickDoneInDialog()

        await this.assertRetainedFirst2BlockedBy(
            chuckRoastId,
            armRoastId,
            bladeId
        )

        await this.runner.refresh()

        await this.assertRetainedFirst2BlockedBy(
            chuckRoastId,
            armRoastId,
            bladeId
        )
    }

    private async setBlockedByValue(idx: number, armRoastId: string) {
        await this.runner.select(
            `select[name="selectedCutBlockers.${idx}"]`,
            armRoastId
        )
    }

    private async assertRetainedFirst2BlockedBy(
        chipId: string,
        blockedBy1Id: string,
        blockedBy2Id: string
    ) {
        await this.runner.clickChipEdit(chipId)

        await this.runner.assertValueEquals(
            'select[name="selectedCutBlockers.0"]',
            blockedBy1Id,
            'Did not retain block on Chuck Roast!'
        )

        await this.runner.assertValueEquals(
            'select[name="selectedCutBlockers.1"]',
            blockedBy2Id,
            'Did not retain block on Chuck Roast!'
        )

        await this.runner.assertValueEquals(
            'select[name="selectedCutBlockers.2"]',
            'Select one...',
            'Did not unblock the other way! Check Chuck Roast!'
        )

        await this.runner.clickDoneInDialog()
    }
}
