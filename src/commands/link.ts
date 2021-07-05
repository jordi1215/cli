import { Command, flags } from '@oclif/command'
// import Configstore from 'configstore'
//import Configstore = require('configstore')

// let index: number = 0
export default class Link extends Command {
    static description = 'The link command facilitates the wml link'

    static examples = [
        `$ cli link`,
    ]

    static flags = {
        help: flags.help({ char: 'h' }),
        // flag with a value (-n, --name=VALUE)
        // name: flags.string({ char: 'n', description: 'name to print' }),
        // // flag with no value (-f, --force)
        // force: flags.boolean({ char: 'f' }),
        verbose: flags.boolean({ char: 'v' }),
        packages: flags.boolean({ char: 'p' }),
    }

    static args = [{ name: 'file' }]
    static source: string

    async run() {

        const { args, flags } = this.parse(Link)

        if (!args.file) {
            Link.source = process.cwd()
            this.log(`added ${Link.source} as the source`)
            // const config = new Configstore("cli", { source: Link.source });
        }
        else {
            // this.log(`source: ${config.get('source')}`)
        }

        if (args.file && flags.packages) {
            // index number = config.size - 1
            // 

        }
        // const name = flags.name ?? 'world'
        // this.log(`hello ${name} from ./src/commands/hello.ts`)
        // if (args.file && flags.force) {
        //     this.log(`you input --force and --file: ${args.file}`)
        // }
        // const { exec } = require("child_process")



        // let my_var: string = "help";

        // exec(`wml --${my_var}`, (error: { message: any }, stdout: any, stderr: any) => {
        //     if (error) {
        //         console.log(`error: ${error.message}`)
        //         return
        //     }
        //     if (stderr) {
        //         console.log(`stderr: ${stderr}`)
        //         return
        //     }
        //     console.log(`stdout: ${stdout}`)
        // })
    }
}