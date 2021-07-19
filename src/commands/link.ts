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
  private storage: LocalStorage = new LocalStorage(__dirname + '/.config')

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
      this.storage.clear()
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
      let packages: { [key: string]: any } = {}
      for (let i = 0; i < folders.length; i++) {
        let package_path: string = source + '/packages/' + folders[i]
        let full_path: string = package_path + '/package.json'
        let raw_data = fs.readFileSync(full_path)
        let my_json = JSON.parse(raw_data)
        let name: string = my_json['name']
        if (flags.verbose) {
          this.log(name)
        }
        packages[name] = package_path
      }
      let json: { [key: string]: any } = {}
      json['packages'] = packages
      json['module_paths'] = {}
      this.storage.setItem('cli.config.json', JSON.stringify(json))
    }

    // add the paths
    if (args.file && flags.packages) {
      let module_path: any = ""
      let retrievedObject = this.storage.getItem('cli.config.json')
      if (retrievedObject != null) {
        let config_json = JSON.parse(retrievedObject)
        if (args.file.charAt(0) == '@') {
          module_path = config_json['packages'][args.file]
        }

        else {
          module_path = args.file
        }
        let module_paths = config_json['module_paths']
        module_paths[`path_${Object.keys(module_paths).length + 1}`] = module_path
        config_json['module_paths'] = module_paths
        this.storage.setItem('cli.config.json', JSON.stringify(config_json))
      }
    }

    // the start command
    if (args.file == 'start') {
      let command: string = ''
      let retrievedObject = this.storage.getItem('cli.config.json')
      if (retrievedObject != null) {
        let config_json = JSON.parse(retrievedObject)
        let module_paths = config_json['module_paths']
        // add all the path
        for (let i = 0; i < Object.keys(module_paths).length; i++) {
          command = 'wml add '
          command += module_paths[`path_${i + 1}`]
          command += ' '
          command += process.cwd()
          this.log(command)
          //run_command(command)
        }
        this.log('wml start')
        //run_command('wml start')
      }
    }

    if (args.file == 'clear') {
      this.storage.clear()
    }
  }
}
