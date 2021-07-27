import { Command, flags } from '@oclif/command'
import { LocalStorage } from 'node-localstorage'

const fs = require('fs')
const chokidar = require('chokidar')
const fse = require('fs-extra')

// This function returns the path after the package folder from the source directory
function get_path(path: string) {
  const nodes_Dir = process.cwd() + '/node_modules/@vtex'
  var string = path.split("/")
  var res = ''
  var flag = false
  for (let i = 0; i < string.length; i++) {
    if (string[i] == 'packages') {
      flag = true
    }
    else if (flag) {
      res += '/' + string[i]
    }
  }
  return nodes_Dir + res
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
        let dirs: string[] = []
        // add all the path that need to be watched
        for (let i = 0; i < Object.keys(module_paths).length; i++) {
          const srcDir = module_paths[`path_${i + 1}`];
          var string = srcDir.split("/")
          dirs.push(srcDir)
        }

        // let working_folder = process.cwd() + '/node_modules/@vtex'
        // fs.mkdir(working_folder, { recursive: true }, (err: any) => {
        //   if (err) throw err
        // })
        // if (!fs.existsSync(working_folder)) {
        //   fs.mkdirSync(working_folder)
        // }
        // working_folder = process.cwd() + '/node_modules/@vtex'
        // if (!fs.existsSync(working_folder)) {
        //   fs.mkdirSync(working_folder)
        // }

        chokidar.watch(dirs).on('addDir', (path: any) => {
          var dest_dir = get_path(path)
          fs.mkdirSync(dest_dir, { recursive: true }, (err: any) => {
            if (err) throw err
            //console.log("Directory is created.");
          })

        }).on('add', (path: any) => {
          var dest_dir = get_path(path)
          fs.copyFile(path, dest_dir, (err: any) => {
            if (err) throw err
            console.log('added ' + path)
            console.log('destination: ' + dest_dir)

          })
        }).on('change', (path: any) => {
          var dest_dir = get_path(path)
          fs.copyFile(path, dest_dir, (err: any) => {
            if (err) throw err
            // console.log('source.txt was copied to destination.txt');
          })
        }).on('unlink', (path: any) => {
          var dest_dir = get_path(path)
          fs.unlink(dest_dir, (err: any) => {
            if (err) throw err
          })

        }).on('unlinkDir', (path: any) => {
          var dest_dir = get_path(path)
          fs.rmdir(dest_dir, { recursive: true }, (err: any) => {
            if (err) throw err
          })
        }).on('error', (error: any) => {
          console.error('Error happened', error)
        })
      }
    }

    if (args.file == 'clear') {
      this.storage.clear()
    }
  }
}
