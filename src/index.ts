import { diskUtil } from '@sprucelabs/spruce-skill-utils'
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

export default class Run extends AbstractSingleRun {
    private stage: 'before' | 'after' = 'before'
    private vendorsToSkipPath = diskUtil.resolvePath(process.cwd(), '.cache/')
    private vendorsToSkipFile = diskUtil.resolvePath(
        this.vendorsToSkipPath,
        'vendors-to-skip.json'
    )

    public async run(): Promise<void> {
        await this.clickSwitchVendorDropdown()

        this.setupSkipFileIfDoesntExist()

        const vendorIds = await this.getVendorIdsToConsider()

        let idx = 0
        for (const vendorId of vendorIds) {
            if (idx++ > 0) {
                await this.clickSwitchVendorDropdown()
            }
            await this.runner.select('[name="vendor"]', vendorId)
            await this.clickSaveInDialog()
            await wait(1000)

            // if not configured, they won't have a capabilities tab
            const found = await this.runner.get(
                '[data-rr-ui-event-key="capabilities"]',
                {
                    shouldThrowIfNotFound: false,
                }
            )

            if (!found) {
                this.addVendorToSkipList(vendorId)
                continue
            }

            const foundCapabilities =
                await this.takeScreensOfAllCapabilities(vendorId)

            if (!foundCapabilities) {
                this.addVendorToSkipList(vendorId)
                continue
            }

            await this.takeScreensOfAllVendorCutsheets(vendorId)
        }
    }

    private async getVendorIdsToConsider() {
        let vendorIds =
            await this.runner.getValuesForSelectOptions('[name="vendor"]')

        const toSkip = this.getVendorToSkip()
        vendorIds = vendorIds.filter((id) => !toSkip.includes(id))
        return vendorIds
    }

    private setupSkipFileIfDoesntExist() {
        diskUtil.createDir(this.vendorsToSkipPath)
        if (!diskUtil.doesFileExist(this.vendorsToSkipFile)) {
            this.writeVendorsToSkip([])
        }
    }

    private addVendorToSkipList(vendorId: string) {
        const vendorsToSkip = this.getVendorToSkip()
        vendorsToSkip.push(vendorId)
        this.writeVendorsToSkip(vendorsToSkip)
    }

    private getVendorToSkip() {
        return JSON.parse(diskUtil.readFile(this.vendorsToSkipFile))
    }

    private writeVendorsToSkip(ids: string[]) {
        diskUtil.writeFile(this.vendorsToSkipFile, JSON.stringify(ids))
    }

    private async takeScreensOfAllVendorCutsheets(vendorId: string) {
        await this.clickTab('cutsheets')

        await wait(1000)

        const cutsheets = await this.runner.findAll('.table .dropdown', {
            shouldThrowIfNotFound: false,
        })
        const totalCutsheets = cutsheets.length

        for (
            let cutsheetIndex = 0;
            cutsheetIndex < totalCutsheets;
            cutsheetIndex++
        ) {
            await this.runner.clickAtIndex('.table .dropdown', cutsheetIndex)

            await this.runner.click('.dropdown-item')

            await wait(1000)

            await this.runner.takeScreenshot(
                `${vendorId}/cutsheets/${this.stage}-${cutsheetIndex}`
            )

            await this.clickCloseDialog()
        }
    }

    private async takeScreensOfAllCapabilities(vendorId: string) {
        await this.clickTab('capabilities')
        await wait(1000)

        const alertMessage = await this.runner.get('.alert-danger', {
            shouldThrowIfNotFound: false,
        })

        if (alertMessage) {
            this.log.info(`Skipping ${vendorId} because not configured`)
            return false
        }

        const capabilityTabs = await this.runner.findAll('.capabilities button')
        const totalCapabilities = capabilityTabs.length

        if (totalCapabilities === 0) {
            this.log.info(`Skipping ${vendorId} because no capabilities`)
            return false
        }

        for (
            let capabilitiesIndex = 0;
            capabilitiesIndex < totalCapabilities;
            capabilitiesIndex++
        ) {
            await this.runner.clickAtIndex(
                '.capabilities button',
                capabilitiesIndex
            )

            await wait(1000)
            await this.runner.takeScreenshot(
                `${vendorId}/capabilities/${this.stage}-${capabilitiesIndex}`
            )
        }

        return true
    }

    private async clickSwitchVendorDropdown() {
        await this.runner.click('.auth-dropdown')
        await this.runner.click('.switch-vendor')
    }
}
