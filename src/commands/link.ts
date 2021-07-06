import { Command, flags } from '@oclif/command'
import { LocalStorage } from 'node-localstorage'

function run_command(command: string) {
  const { exec } = require("child_process")
  exec(command, (error: { message: any }, stdout: any, stderr: any) => {
    if (error) {
      console.log(`error: ${error.message}`)
      return
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`)
      return
    }
    console.log(`stdout: ${stdout}`)
  })
}

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
    packages: flags.boolean({ char: 'p', description: 'set this flag to add destination path' }),
  }

  public static args = [{ name: 'file' }]
  public static source: string

  public async run() {


    const { args, flags } = this.parse(Link)

    // set the source path
    if (!args.file && !flags.packages) {
      Link.source = process.cwd()
      this.log(`added ${Link.source} as the source`)
      this.storage.setItem('source', Link.source)
    }

    // add the paths
    if (args.file && flags.packages) {
      this.storage.setItem(`path${this.storage.length}`, args.file)
    }

    if (args.file == 'start') {
      let command: string = ''

      // add all the path
      for (let i = 0; i < this.storage.length - 1; i++) {
        command = 'wml add '
        command += this.storage.getItem('source')
        command += ' '
        command += this.storage.getItem(`path${i + 1}`)
        this.log(command)
        run_command(command)
      }

      run_command('wml start')


    }


  }
}
