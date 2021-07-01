import { Command, flags } from '@oclif/command'
import { LocalStorage } from 'node-localstorage'

// let index: number = 0
export default class Link extends Command {
  private storage: LocalStorage = new LocalStorage('~/.config/faststore.confg')

  public static description = 'The link command facilitates the wml link'

  public static examples = [`$ cli link`]

  public static flags = {
    help: flags.help({ char: 'h' }),
    // flag with a value (-n, --name=VALUE)
    // name: flags.string({ char: 'n', description: 'name to print' }),
    // // flag with no value (-f, --force)
    // force: flags.boolean({ char: 'f' }),
    verbose: flags.boolean({ char: 'v' }),
  }

  public static args = [{ name: 'file' }]
  public static source: string
  private index = 0

  public async run() {
    this.index += 1

    console.log({ index: this.index })

    const { args } = this.parse(Link)

    if (!args.file) {
      Link.source = process.cwd()
      this.log(`added ${Link.source} as the source`)
      this.storage.setItem('source', Link.source)
    } else {
      this.log(`source: ${this.storage.getItem('source')}`)
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
