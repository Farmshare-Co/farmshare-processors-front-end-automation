import { AbstractSingleRun } from '../Runner/SingleRun'
import wait from '../Runner/wait'

export default class Run extends AbstractSingleRun {
    public async run(): Promise<void> {
        await this.navigateToSettings()
        await this.toggleChips(['yak'], [])
        await this.toggleChipsByLabel(['exempt', 'whole'], [], 'Yak')

        await this.setInputValue('butcherSlotPricing.yak.exempt', '100')
        await this.setInputValue('customCutsheetPricing.yak.exempt', '10')

        await this.clickSubmit()

        await wait(3000)
        await this.clickTab('capabilities')

        await this.runner.click('.yak-exempt.nav-link')

        await this.toggleChipsByLabel([], [], 'chuck-ribs', true)
        await this.toggleChipsByLabel([], [], 'chuck-roasts', true)
        await this.toggleChipsByLabel([], [], 'chuck-steaks', true)
        await this.toggleChipsByLabel([], [], 'brisket-ribs', true)
        await this.toggleChipsByLabel([], [], 'brisket-roasts', true)
        await this.toggleChipsByLabel([], [], 'brisket-steaks', true)

        await wait(1000)

        await this.clickSubmit()

        await wait(1000)

        await this.navigateToAddJob()
        await this.runner.click('.btn-yak')
        await this.addJob({
            inspection: false,
        })
    }

    protected async toggleChipsByLabel(
        enable: string[],
        disable: string[],
        label: string,
        enableAll?: boolean
    ) {
        if (enableAll) {
            await this.clickAllChips(label)
        } else {
            for (const chip of enable) {
                if (!(await this.getIsChipSelectedByLabel(chip, label))) {
                    await this.clickChipByLabel(chip, label)
                }
            }
            for (const chip of disable) {
                if (await this.getIsChipSelectedByLabel(chip, label)) {
                    await this.clickChipByLabel(chip, label)
                }
            }
        }
    }

    protected async getIsChipSelectedByLabel(id: string, label: string) {
        const className = await this.runner.getProp(
            `.${label} .chip-${id}`,
            'className'
        )
        return className!.includes('btn-primary')
    }

    public clickChipByLabel(id: string, label: string) {
        return this.runner.click(`.${label} button.chip-${id}`)
    }
    protected async clickAllChips(label: string) {
        const buttons = await this.runner.findAll(`.${label} button`)
        for (const button of buttons) {
            const buttonClassHandle = await button.getProperty('className')
            const buttonClass = await buttonClassHandle.jsonValue()
            if (!buttonClass.includes('btn-primary')) {
                await button.click()
            }
        }
    }
}
