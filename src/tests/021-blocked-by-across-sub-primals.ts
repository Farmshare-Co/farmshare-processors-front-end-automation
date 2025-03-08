import {
    ID_TRI_TIP_EXEMPT,
    ID_TOP_ROUND,
    ID_WHOLE_SHANK,
    ID_SIRLOIN_CAP_EXEMPT,
} from '../constants'
import { AbstractSingleRun } from '../Runner/SingleRun'

export default class Run extends AbstractSingleRun {
    public async run(): Promise<void> {
        await this.clickTab('capabilities')

        await this.runner.click('button.beef-exempt')

        await this.executeBlockedByRoutine(
            ID_TRI_TIP_EXEMPT,
            ID_TOP_ROUND,
            ID_WHOLE_SHANK,
            ID_SIRLOIN_CAP_EXEMPT
        )

        await this.clickTab('cutsheets')
        await this.clickAddCutsheet()
        await this.selectInspectionLevelOnCutsheet('exempt')
        await this.fillOutRandomNameOnCutsheet()

        await this.clickChip(ID_TRI_TIP_EXEMPT)

        await this.assertChipIsDisabled(ID_TOP_ROUND)
        await this.assertChipIsDisabled(ID_WHOLE_SHANK)

        await this.clickCloseDialog()
    }
}
