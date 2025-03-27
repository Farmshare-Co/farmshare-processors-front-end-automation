import globby from '@sprucelabs/globby'
import { diskUtil, slug } from '@sprucelabs/spruce-skill-utils'
import Runner from '../Runner/Runner'
import { AbstractSingleRun } from '../Runner/SingleRun'
import wait from '../Runner/wait'

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

        const vendorIds = await this.getVendorsToConsider()

        let idx = 0
        for (const vendor of vendorIds) {
            const { value: vendorId, label } = vendor
            const vendorSlug = slug(label)

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

            await this.clickNav('processor')
            await this.downloadAllCutsheetsOnJobs(vendorSlug)

            await this.clickNav('processor')

            const foundCapabilities =
                await this.takeScreensOfAllCapabilities(vendorSlug)

            if (!foundCapabilities) {
                this.addVendorToSkipList(vendorId)
                continue
            }

            await this.takeScreensOfAllVendorCutsheets(vendorSlug)
        }
    }

    private async downloadAllCutsheetsOnJobs(vendorSlug: string) {
        this.log.info(`Downloading all cutsheets for ${vendorSlug}`)
        await wait(4000)

        const bookingsInProgress = await this.runner.findAll(
            '.in-progress td:first-of-type a',
            { shouldThrowIfNotFound: false }
        )
        const totalBookingsInProgress = bookingsInProgress.length

        for (
            let bookingIndex = 0;
            bookingIndex < totalBookingsInProgress;
            bookingIndex++
        ) {
            if (bookingIndex > 0) {
                await this.clickNav('processor')
            }

            await this.runner.clickAtIndex('.in-progress a', bookingIndex)
            await wait(1000)
            await this.downloadAllCutsheetsForVendor(vendorSlug)
        }
    }

    private async downloadAllCutsheetsForVendor(vendorSlug: string) {
        const jobId = this.parseJobIdFromUrl()

        if (!jobId) {
            debugger
        }

        await this.clickTab('cutsheets')
        await wait(4000)

        //should not include buttons with disabled attribute
        const buttonSelector = '.btn-download-cutsheet:not([disabled])'
        const cutsheets = await this.runner.findAll(buttonSelector, {
            shouldThrowIfNotFound: false,
        })
        const totalCutsheets = cutsheets.length

        const path = await this.runner.setDownloadPath(
            `${vendorSlug}/cutsheets/_tpm`
        )

        for (
            let cutsheetIndex = 0;
            cutsheetIndex < totalCutsheets;
            cutsheetIndex++
        ) {
            await this.runner.clickAtIndex(buttonSelector, cutsheetIndex)

            let matches: string[] = []

            let attemptsLeft = 100

            do {
                matches = await globby(`${path}/*.pdf`)
                await wait(1000)
                attemptsLeft--
                if (attemptsLeft === 0) {
                    throw new Error('Failed to download cutsheet')
                }
            } while (matches.length === 0)

            const newName = `${jobId}-${cutsheetIndex}-${this.stage}.pdf`
            const destination = diskUtil.resolvePath(path, '..', newName)
            if (diskUtil.doesFileExist(destination)) {
                diskUtil.deleteFile(destination)
            }

            diskUtil.moveFile(matches[0], destination)
        }
    }

    private async getVendorsToConsider() {
        let vendors = await this.runner.getOptionsForSelect('[name="vendor"]')

        const toSkip = this.getVendorToSkip()
        vendors = vendors.filter((vendor) => !toSkip.includes(vendor.value))
        return vendors
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

    private async takeScreensOfAllVendorCutsheets(vendorSlug: string) {
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
                `${vendorSlug}/cutsheets/${cutsheetIndex}-${this.stage}`
            )

            await this.clickCloseDialog()
        }
    }

    private async takeScreensOfAllCapabilities(vendorSlug: string) {
        await this.clickTab('capabilities')
        await wait(1000)

        const alertMessage = await this.runner.get('.alert-danger', {
            shouldThrowIfNotFound: false,
        })

        if (alertMessage) {
            this.log.info(`Skipping ${vendorSlug} because not configured`)
            return false
        }

        const capabilityTabs = await this.runner.findAll('.capabilities button')
        const totalCapabilities = capabilityTabs.length

        if (totalCapabilities === 0) {
            this.log.info(`Skipping ${vendorSlug} because no capabilities`)
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
                `${vendorSlug}/capabilities/${this.stage}-${capabilitiesIndex}`
            )
        }

        return true
    }

    private async clickSwitchVendorDropdown() {
        await this.runner.click('.auth-dropdown')
        await this.runner.click('.switch-vendor')
    }
}
