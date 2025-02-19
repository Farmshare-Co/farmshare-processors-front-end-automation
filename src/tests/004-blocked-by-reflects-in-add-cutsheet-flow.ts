import {
    ID_CHUCK_ROAST_EXEMPT,
    ID_BLADE_EXEMPT,
    ID_ARM_ROAST_EXEMPT,
    ID_EYE_ROAST_EXEMPT,
} from '../constants'
import { AbstractSingleRun } from '../Runner/SingleRun'

export default class Run extends AbstractSingleRun {
    public async run(): Promise<void> {
        await this.clickTab('cutsheets')
        await this.clickAddCutsheet()

        await this.selectInspectionLevelOnCutsheet('exempt')
        await this.fillOutRandomNameOnCutsheet()

        await this.clickChip(ID_CHUCK_ROAST_EXEMPT)

        await this.assertChipIsDisabled(ID_BLADE_EXEMPT)
        await this.assertChipIsDisabled(ID_ARM_ROAST_EXEMPT)
        await this.assertChipIsEnabled(ID_EYE_ROAST_EXEMPT)

        await this.clickCloseDialog()

        await this.clickAddCutsheet()

        await this.selectInspectionLevelOnCutsheet('usda')
        await this.fillOutRandomNameOnCutsheet()

        await this.clickChip(ID_CHUCK_ROAST_EXEMPT)

        await this.assertChipIsDisabled(ID_BLADE_EXEMPT)
        await this.assertChipIsDisabled(ID_ARM_ROAST_EXEMPT)
        await this.assertChipIsEnabled(ID_EYE_ROAST_EXEMPT)

        await this.clickCloseDialog()
    }
}
