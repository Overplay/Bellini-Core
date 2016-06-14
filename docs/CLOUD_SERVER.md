

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

8. run bower update in /assets for uiapp to work
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


    - TO FIX (might be bad but works)
        - cd /home/username/.config/configstore
        - ls -al
            - if bower.json files are root root, chown to username, chgrp to asahi for both as well
        - ls -al should show
            - username asahi for ownership now!

9. Create asahi user and group
    - `sudo useradd asahi`
         - does not add a home directory
    - havent done anthing with this yet lol

10. Add your user to the asahi group
    - sudo usermod -a -G asahi,yourusergroup username

11. chown and chgrp -R asahi /asahi
    - didnt fix
    -cgrigsby@Asahi:/opt/asahi$ npm update
     npm ERR! Linux 3.13.0-85-generic
     npm ERR! argv "/usr/bin/nodejs" "/usr/bin/npm" "update"
     npm ERR! node v4.4.5
     npm ERR! npm  v2.15.5
     npm ERR! path /opt/asahi/node_modules/waterlock-facebook-auth
     npm ERR! code EACCES
     npm ERR! errno -13
     npm ERR! syscall rmdir


12. trying to fix npm
   - npm config set prefix ~/npm


- ALSO TODO finish permisions since i have to sudo github...



REINSTALLING NODE
- https://www.digitalocean.com/community/tutorials/how-to-create-an-node-js-app-using-sails-js-on-an-ubuntu-vps
- reclone asahi
    - has root root since sudo is used to clone on git
    - sudo npm update
- chgrp and chown to asahi again
- bower update in assets
    - still had the bower.json chowned from earlier so no sudo req
    - JK SWEET
      Stack trace:
      Error: EACCES: permission denied, mkdir '/opt/asahi/assets/bower_components'
          at Error (native)

      Console trace:
      Error
          at StandardRenderer.error (/usr/lib/node_modules/bower/lib/renderers/StandardRenderer.js:81:37)
          at Logger.<anonymous> (/usr/lib/node_modules/bower/lib/bin/bower.js:110:26)
          at emitOne (events.js:77:13)
          at Logger.emit (events.js:169:7)
          at Logger.emit (/usr/lib/node_modules/bower/lib/node_modules/bower-logger/lib/Logger.js:29:39)
          at /usr/lib/node_modules/bower/lib/commands/index.js:48:20
          at _rejected (/usr/lib/node_modules/bower/lib/node_modules/q/q.js:844:24)
          at /usr/lib/node_modules/bower/lib/node_modules/q/q.js:870:30
          at Promise.when (/usr/lib/node_modules/bower/lib/node_modules/q/q.js:1122:31)
          at Promise.promise.promiseDispatch (/usr/lib/node_modules/bower/lib/node_modules/q/q.js:788:41)
      System info:
      - redid it with --allow-root
- dont forget local js
    - had to sudo to make it wtf
    - sudo vi local.js
- giving the group permissions on everything!
    -sudo chmod 775 -R asahi/
    - chown the bower json in /home again
    - bower EACCES        EACCES: permission denied, mkdir '/opt/asahi/assets/bower_components/angular-ui-router'

      Stack trace:
      /usr/lib/node_modules/bower/lib/node_modules/fstream/lib/dir-writer.js:35:25
      /usr/lib/node_modules/bower/lib/node_modules/mkdirp/index.js:46:53
      FSReqWrap.oncomplete (fs.js:82:15)

      Console trace:
      Error
          at StandardRenderer.error (/usr/lib/node_modules/bower/lib/renderers/StandardRenderer.js:81:37)
          at Logger.<anonymous> (/usr/lib/node_modules/bower/lib/bin/bower.js:110:26)
          at emitOne (events.js:77:13)
          at Logger.emit (events.js:169:7)
          at Logger.emit (/usr/lib/node_modules/bower/lib/node_modules/bower-logger/lib/Logger.js:29:39)
          at /usr/lib/node_modules/bower/lib/commands/index.js:48:20
          at _rejected (/usr/lib/node_modules/bower/lib/node_modules/q/q.js:844:24)
          at /usr/lib/node_modules/bower/lib/node_modules/q/q.js:870:30
          at Promise.when (/usr/lib/node_modules/bower/lib/node_modules/q/q.js:1122:31)
          at Promise.promise.promiseDispatch (/usr/lib/node_modules/bower/lib/node_modules/q/q.js:788:41)
      System info:
      Bower version: 1.7.9
      Node version: 4.4.5
      OS: Linux 3.13.0-85-generic x64

      - i changed the owner to myself of these files and was still getting the error

### Where I'm at....
    - I need to sudo npm, git and bower currently which seems strange
    - id cgrigsby
        - uid=1001(cgrigsby) gid=1002(asahi) groups=1002(asahi),27(sudo),1001(cgrigsby)

        - app runs, so thats cool, but something is definitely going on with permissions
        - cgrigsby@Asahi:/opt/asahi$ ls -al
          total 68
          drwxrwxr-x 11 asahi asahi 4096 Jun 14 10:15 .
          drwxr-xr-x  4 root  root  4096 Jun 14 10:15 ..
          drwxrwxr-x  8 asahi asahi 4096 Jun 14 10:15 api
          -rwxrwxr-x  1 asahi asahi 1802 Jun 14 10:15 app.js
          drwxrwxr-x 11 asahi asahi 4096 Jun 14 10:22 assets
          drwxrwxr-x  4 asahi asahi 4096 Jun 14 10:28 config
          drwxrwxr-x  4 asahi asahi 4096 Jun 14 10:15 data
          drwxrwxr-x  2 asahi asahi 4096 Jun 14 10:15 docs
          drwxrwxr-x  8 asahi asahi 4096 Jun 14 10:15 .git
          -rwxrwxr-x  1 asahi asahi 2800 Jun 14 10:15 .gitignore
          -rwxrwxr-x  1 asahi asahi 2134 Jun 14 10:15 Gruntfile.js
          drwxrwxr-x 36 asahi asahi 4096 Jun 14 10:16 node_modules
          -rwxrwxr-x  1 asahi asahi 1587 Jun 14 10:15 package.json
          -rwxrwxr-x  1 asahi asahi 1116 Jun 14 10:15 README.md
          -rwxrwxr-x  1 asahi asahi   84 Jun 14 10:15 .sailsrc
          drwxrwxr-x  4 asahi asahi 4096 Jun 14 10:15 tasks
          drwxrwxr-x  8 asahi asahi 4096 Jun 14 10:15 views

          - i set all the perms to this but bower is still being dymb


       cgrigsby@Asahi:/opt/asahi$ npm update
       npm ERR! Linux 3.13.0-85-generic
       npm ERR! argv "/usr/bin/nodejs" "/usr/bin/npm" "update"
       npm ERR! node v4.4.5
       npm ERR! npm  v2.15.5
       npm ERR! path /opt/asahi/node_modules/waterlock-facebook-auth
       npm ERR! code EACCES
       npm ERR! errno -13
       npm ERR! syscall rmdir

       npm ERR! Error: EACCES: permission denied, rmdir '/opt/asahi/node_modules/waterlock-facebook-auth'
       npm ERR!     at Error (native)
       npm ERR!  { [Error: EACCES: permission denied, rmdir '/opt/asahi/node_modules/waterlock-facebook-auth']
       npm ERR!   errno: -13,
       npm ERR!   code: 'EACCES',
       npm ERR!   syscall: 'rmdir',
       npm ERR!   path: '/opt/asahi/node_modules/waterlock-facebook-auth' }
       npm ERR!
       npm ERR! Please try running this command again as root/Administrator.
       npm ERR! error rolling back Error: EACCES: permission denied, rmdir '/opt/asahi/node_modules/waterlock-facebook-auth'
       npm ERR! error rolling back     at Error (native)
       npm ERR! error rolling back  { [Error: EACCES: permission denied, rmdir '/opt/asahi/node_modules/waterlock-facebook-auth']
       npm ERR! error rolling back   errno: -13,
       npm ERR! error rolling back   code: 'EACCES',
       npm ERR! error rolling back   syscall: 'rmdir',
       npm ERR! error rolling back   path: '/opt/asahi/node_modules/waterlock-facebook-auth' }
       npm ERR! Linux 3.13.0-85-generic
       npm ERR! argv "/usr/bin/nodejs" "/usr/bin/npm" "update"
       npm ERR! node v4.4.5
       npm ERR! npm  v2.15.5
       npm ERR! path npm-debug.log.2117024986
       npm ERR! code EACCES
       npm ERR! errno -13
       npm ERR! syscall open

       npm ERR! Error: EACCES: permission denied, open 'npm-debug.log.2117024986'
       npm ERR!     at Error (native)
       npm ERR!  { [Error: EACCES: permission denied, open 'npm-debug.log.2117024986']
       npm ERR!   errno: -13,
       npm ERR!   code: 'EACCES',
       npm ERR!   syscall: 'open',
       npm ERR!   path: 'npm-debug.log.2117024986' }
       npm ERR!
       npm ERR! Please try running this command again as root/Administrator.

       npm ERR! Please include the following file with any support request:
       npm ERR!     /opt/asahi/npm-debug.log

       
git checkout
fatal: Unable to create '/opt/asahi/.git/index.lock': Permission denied


