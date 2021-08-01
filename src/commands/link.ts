import { Command, flags } from '@oclif/command'
import { LocalStorage } from 'node-localstorage'

const fs = require('fs')
const chokidar = require('chokidar')

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

export default class Link extends Command {
  private storage: LocalStorage = new LocalStorage(__dirname + '/.config')

  public static description = 'The link command facilitates the wml link'

  public static examples = [`$ cli link`]

  public static usage = '\nlink\t set the current directory as source directory\nlink -p <foo>  add packages from the source directory to be linked\nlink start\t link watch and copy the selected packages to the current directory\n'

  public static flags = {
    help: flags.help({ char: 'h' }),
    // force: flags.boolean({ char: 'f' }),
    verbose: flags.boolean({ char: 'v' }),
    packages: flags.boolean({ char: 'p', description: 'set this flag to add destination path' }),
    list: flags.boolean({ char: 'l', description: 'list all of the packages added' })
  }

  public static args = [{ name: 'file' }]

  public async run() {


    const { args, flags } = this.parse(Link)

    // set the source path
    if (!args.file && !flags.packages && !flags.list) {
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

      if (flags.verbose) this.log('Found the following packages: ')

      // get all the packages name
      let packages: { [key: string]: any } = {}
      for (let i = 0; i < folders.length; i++) {
        if (folders[i][0] == '.') continue
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
          dirs.push(srcDir)
        }

        chokidar.watch(dirs).on('addDir', (path: any) => {
          var dest_dir = get_path(path)
          fs.mkdirSync(dest_dir, { recursive: true }, (err: any) => {
            if (err) throw err
            if (flags.verbose) this.log('folder created: ' + dest_dir)
          })

        }).on('add', (path: any) => {
          var dest_dir = get_path(path)
          fs.copyFile(path, dest_dir, (err: any) => {
            if (err) throw err
            if (flags.verbose) this.log('copied ' + path + 'to destination: ' + dest_dir)

          })
        }).on('change', (path: any) => {
          var dest_dir = get_path(path)
          fs.copyFile(path, dest_dir, (err: any) => {
            if (err) throw err
            if (flags.verbose) this.log('copied ' + path + 'to destination: ' + dest_dir)
          })
        }).on('unlink', (path: any) => {
          var dest_dir = get_path(path)
          fs.unlink(dest_dir, (err: any) => {
            if (err) throw err
            if (flags.verbose) this.log('file deleted: ' + dest_dir)
          })

        }).on('unlinkDir', (path: any) => {
          var dest_dir = get_path(path)
          fs.rmdir(dest_dir, { recursive: true }, (err: any) => {
            if (err) throw err
            if (flags.verbose) this.log('folder deleted: ' + dest_dir)
          })
        }).on('error', (error: any) => {
          this.error('Error happened', error)
        })


        process.on('SIGINT', function () {
          console.log('Exit with ctrl + c')
          console.log(`${dirs.length}`)
          for (let i = 0; i < dirs.length; i++) {
            var dest_dir = get_path(dirs[i])
            fs.rmdirSync(dest_dir, { recursive: true }, (err: any) => {
              if (err) throw err
              if (flags.verbose) console.log('directory deleted: ' + dirs[i])
            })
          }
          process.exit()
        })
        process.on('SIGTSTP', function () {
          console.log('Exit with ctrl + z')
          for (let i = 0; i < dirs.length; i++) {
            var dest_dir = get_path(dirs[i])
            fs.rmdirSync(dest_dir, { recursive: true }, (err: any) => {
              if (err) throw err
              if (flags.verbose) console.log('directory deleted: ' + dirs[i])
            })
          }
          process.exit()
        })
      }
    }
    //list all the package names
    if (flags.list) {
      let retrievedObject = this.storage.getItem('cli.config.json')
      if (retrievedObject != null) {
        let config_json = JSON.parse(retrievedObject)
        let packages = config_json['packages']
        if (Object.keys(packages).length == 0) {
          this.log('no packages found')
        }
        for (let i in packages) {
          console.log(i)
        }
      } else {
        this.log('no packages found')
      }
    }

    if (args.file == 'clear') {
      this.storage.clear()
    }

  }


}




