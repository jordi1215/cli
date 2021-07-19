import { Command, flags } from '@oclif/command'
import { LocalStorage } from 'node-localstorage'

const fs = require('fs')

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
  private storage: LocalStorage = new LocalStorage(__dirname + '/.config/faststore.confg')

  private name_dict: LocalStorage = new LocalStorage(__dirname + '/.config/name_dict.confg')

  public static description = 'The link command facilitates the wml link'

  public static examples = [`$ cli link`]

  public static flags = {
    help: flags.help({ char: 'h' }),
    // // flag with no value (-f, --force)
    // force: flags.boolean({ char: 'f' }),
    verbose: flags.boolean({ char: 'v' }),
    packages: flags.boolean({ char: 'p', description: 'set this flag to add destination path' }),
  }

  public static args = [{ name: 'file' }]
  //public static source: string

  public async run() {


    const { args, flags } = this.parse(Link)

    // set the source path
    if (!args.file && !flags.packages) {
      //TODO: clear both storages
      this.storage.clear()
      this.name_dict.clear()
      let source: string = process.cwd()

      // get all module folders inside the packages folder
      const folderName = 'packages'
      let folders: string[] = [];

      if (fs.existsSync(folderName)) {
        folders = fs.readdirSync(folderName)
      }
      else {
        this.log("Error: No folder names 'packages' found")
      }

      if (flags.verbose) {
        this.log('Found the following packages: ')
      }
      // get all the packages name
      for (let i = 0; i < folders.length; i++) {
        let package_path: string = source + '/packages/' + folders[i]
        let full_path: string = package_path + '/package.json'
        let raw_data = fs.readFileSync(full_path)
        let my_json = JSON.parse(raw_data)
        let name = my_json['name']
        if (flags.verbose) {
          this.log(name)
        }
        this.name_dict.setItem(name, package_path)
      }
    }

    // add the paths
    if (args.file && flags.packages) {
      let module_path: any = ""
      if (args.file.charAt(0) == '@') {
        module_path = this.name_dict.getItem(args.file)
      }
      else {
        module_path = args.file
      }
      this.storage.setItem(`path${this.storage.length + 1}`, module_path)
    }

    // the start command
    if (args.file == 'start') {
      let command: string = ''

      // add all the path
      for (let i = 0; i < this.storage.length; i++) {
        command = 'wml add '
        command += this.storage.getItem(`path${i + 1}`)
        command += ' '
        command += process.cwd()
        this.log(command)
        //run_command(command)
      }
      this.log('wml start')
      //run_command('wml start')
    }

    if (args.file == 'clear') {
      this.storage.clear()
      this.name_dict.clear()
    }
  }
}
