

## Setting up a cloud server

1. `sudo apt-get update`

2. `sudo apt-get upgrade`

3. Make sure build-essential is installed
    - To check use dpkg -s build-essentials

4. Make sure Node is at a proper version
    - Node -v

    Then
    - Install ‘n’ www.github.com/tj/n
    - `sudo npm install -g n`



5. In /opt, we will find the the MEAN app default,

    ##### Clone asahi into /opt

    `sudo git clone https://github.com/Overplay/asahi`
    - enter your github username and password

6. update asahi dependencies
    - `sudo npm install -g sails`
    - `sudo npm update`

7. add the `local.js` file to config

8. run bower update in assets for uiapp to work
    - `sudo bower update --allow-root`
    - TODO find the right way to do this
        - why does
        `cgrigsby@Asahi:/opt/asahi/assets$ bower update
         /usr/lib/node_modules/bower/lib/node_modules/configstore/index.js:54
         				throw err;
         				^

         Error: EACCES: permission denied, open '/home/cgrigsby/.config/configstore/bower-github.json'
         You don't have access to this file.

             at Error (native)
             at Object.fs.openSync (fs.js:549:18)
             at Object.fs.readFileSync (fs.js:397:15)
             at Object.create.all.get (/usr/lib/node_modules/bower/lib/node_modules/configstore/index.js:35:26)
             at Object.Configstore (/usr/lib/node_modules/bower/lib/node_modules/configstore/index.js:28:44)
             at readCachedConfig (/usr/lib/node_modules/bower/lib/config.js:19:23)
             at defaultConfig (/usr/lib/node_modules/bower/lib/config.js:11:12)
             at Object.<anonymous> (/usr/lib/node_modules/bower/lib/index.js:16:32)
             at Module._compile (module.js:409:26)
             at Object.Module._extensions..js (module.js:416:10)`


9. Create asahi user and group
    - `sudo useradd asahi`
         - does not add a home directory
    - havent done anthing with this yet lol


- ALSO TODO finish permisions since i have to sudo github...