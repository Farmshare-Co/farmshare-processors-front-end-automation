import { assert } from '@sprucelabs/test-utils'
import {
    ID_CHUCK_ROAST_EXEMPT,
    ID_BLADE_EXEMPT,
    ID_ARM_ROAST_EXEMPT,
    ID_EYE_ROAST_EXEMPT,
    ID_BACK_FAT_EXEMPT,
    ID_SIRLOIN_CAP_EXEMPT,
    ID_CUBE_STEAK_EXEMPT,
    ID_WHOLE_SHANK_EXEMPT,
    ID_CHUCK_STEAK_EXEMPT,
    ID_DINO_EXEMPT,
    ID_KOREAN_SHORT_RIBS_EXEMPT,
    ID_SKIRT_STEAK_EXEMPT,
    ID_FLANK_STEAK_EXEMPT,
    ID_BONE_IN_ROAST_EXEMPT,
    ID_RIBEYE_EXEMPT,
    ID_PORTERHOUSE_EXEMPT,
} from '../constants'
import { AbstractSingleRun } from '../Runner/SingleRun'
import wait from '../Runner/wait'

export default class Run extends AbstractSingleRun {
    public async run(): Promise<void> {
        debugger

        await this.addJobAsProcessor()

        await this.clickAnimalHeadInJobDetails(0)
        await this.clickEditOnFirstCutsheetOnAnimalDetails()

        const totalCutsheets = await this.getTotalCutsheets()

        await this.runner.click('.btn-create-new-cutsheet')

        await this.fillOutRandomNameOnCutsheet()
        await this.selectValue('groundMeatSize', '1')
        await this.selectValue('roastSize', '2-3')
        await this.selectValue('steakThickness', '1')
        await this.selectValue('steaksPerPack', '1')

        await this.clickChip(ID_CHUCK_ROAST_EXEMPT)
        await this.assertChipIsDisabled(ID_BLADE_EXEMPT)
        await this.assertChipIsDisabled(ID_ARM_ROAST_EXEMPT)
        await this.assertChipIsEnabled(ID_EYE_ROAST_EXEMPT)

        const chipsToClick = [
            ID_BACK_FAT_EXEMPT,
            ID_SIRLOIN_CAP_EXEMPT,
            ID_CUBE_STEAK_EXEMPT,
            ID_WHOLE_SHANK_EXEMPT,
            ID_CHUCK_STEAK_EXEMPT,
            ID_DINO_EXEMPT,
            ID_KOREAN_SHORT_RIBS_EXEMPT,
            ID_SKIRT_STEAK_EXEMPT,
            ID_FLANK_STEAK_EXEMPT,
            ID_BONE_IN_ROAST_EXEMPT,
            ID_RIBEYE_EXEMPT,
            ID_PORTERHOUSE_EXEMPT,
        ]

        for (const chip of chipsToClick) {
            await this.clickChip(chip)
        }

        await this.clickSaveInDialog()

        const newCutsheetCount = await this.getTotalCutsheets()

        assert.isEqual(
            newCutsheetCount,
            totalCutsheets + 1,
            'Cutsheet was not added'
        )

        await this.runner.clickAtIndex('.btn-danger', totalCutsheets)

        await this.clickSaveInDialog()

        await wait(5000)

        const lastCount = await this.getTotalCutsheets()

        assert.isEqual(lastCount, totalCutsheets, 'Cutsheet was not deleted')

        await this.runner.refresh()

        const refreshedCount = await this.getTotalCutsheets()

        assert.isEqual(
            refreshedCount,
            totalCutsheets,
            'Cutsheet count not the same after refresh'
        )
    }

    private async getTotalCutsheets() {
        const cutsheets = await this.runner.findAll(
            '.cutsheet-catalogue .cutsheet-card'
        )
        const totalCutsheets = cutsheets.length
        return totalCutsheets
    }
}
