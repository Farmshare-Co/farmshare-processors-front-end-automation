import { assert, generateId } from '@sprucelabs/test-utils'
import { AbstractSingleRun } from '../Runner/SingleRun'

export default class Run extends AbstractSingleRun {
    public async run(): Promise<void> {
        await this.deleteAllJobsInProgress()

        await this.addJobAsProcessor()

        await this.clickOnFirstAnimalHeadInJobDetails()
        await this.clickEditOnFirstCutsheetOnAnimalDetails()

        const cutsheetName = await this.getFirstCutsheetsNameInCutsheetDetails()

        await this.clickAddFirstCutsheetToCartOnCutsheetDetails()
        await this.clickCheckboxesForAllSplitsInCutsheetDetailsDialog()

        await this.clickSaveInDialog()

        const notes = generateId()

        await this.fillOutNotesOnFirstHeadOnCutsheetDetails(notes)

        await this.clickSubmit()

        await this.clickOnFirstAnimalHeadInJobDetails()

        const actualCutsheetName =
            await this.getFirstCutsheetNameOnAnimalDetails()

        assert.isEqual(
            cutsheetName,
            actualCutsheetName,
            'Cutsheet name did not save'
        )

        const actualNotes = await this.getFirstCutsheetNotesOnAnimalDetails()

        assert.isEqual(notes, actualNotes, 'Notes did not save')
    }

    private async getFirstCutsheetNotesOnAnimalDetails() {
        return await this.runner.getInnerText(
            '.animal-head-cutsheet-information .cutsheet-notes td:last-of-type'
        )
    }

    private async fillOutNotesOnFirstHeadOnCutsheetDetails(notes: string) {
        await this.runner.type(
            '[name="cutsheetRequests.[0].cutsheets.[0].notes"]',
            notes
        )
    }

    private async clickOnFirstAnimalHeadInJobDetails() {
        await this.clickAnimalHeadInJobDetails(0)
    }
}
