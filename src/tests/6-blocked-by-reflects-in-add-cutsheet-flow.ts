import { assert, generateId } from '@sprucelabs/test-utils'
import {
    ID_CHUCK_ROAST_EXEMPT,
    ID_BLADE_EXEMPT,
    ID_ARM_ROAST_EXEMPT,
    ID_EYE_ROAST_EXEMPT,
} from '../constants'
import { AbstractSingleRun } from '../Runner/SingleRun'

export default class Run extends AbstractSingleRun {
    public async run(): Promise<void> {
        await this.runner.clickTab('cutsheets')
        await this.clickAddCutsheet()

        await this.selectInspectionLevel('exempt')
        await this.fillOutRandomName()

        await this.runner.clickChip(ID_CHUCK_ROAST_EXEMPT)

        await this.assertChipIsDisabled(ID_BLADE_EXEMPT)
        await this.assertChipIsDisabled(ID_ARM_ROAST_EXEMPT)
        await this.assertChipIsEnabled(ID_EYE_ROAST_EXEMPT)

        await this.clickCloseDialog()

        await this.clickAddCutsheet()

        await this.selectInspectionLevel('usda')
        await this.fillOutRandomName()

        await this.runner.clickChip(ID_CHUCK_ROAST_EXEMPT)

        await this.assertChipIsDisabled(ID_BLADE_EXEMPT)
        await this.assertChipIsDisabled(ID_ARM_ROAST_EXEMPT)
        await this.assertChipIsEnabled(ID_EYE_ROAST_EXEMPT)

        await this.clickCloseDialog()
    }

    private async clickCloseDialog() {
        await this.runner.click('.btn-close')
    }

    private async fillOutRandomName() {
        await this.runner.type('[name="name"]', generateId())
    }

    private async selectInspectionLevel(inspection: string) {
        await this.runner.select('[name="inspectionLevel"]', inspection)
    }

    private async clickAddCutsheet() {
        await this.runner.click('button.btn-add-cutsheet')
    }

    private async assertChipIsEnabled(id: string) {
        const isEnabled = await this.getIsChipEnabled(id)
        assert.isTrue(isEnabled, `Chip ${id} should be enabled`)
    }

    private async assertChipIsDisabled(id: string) {
        const isEnabled = await this.getIsChipEnabled(id)
        assert.isFalse(isEnabled, `Chip ${id} should be disabled`)
    }

    private async getIsChipEnabled(id: string) {
        return await this.runner.getIsEnabled('button.chip-' + id)
    }
}
