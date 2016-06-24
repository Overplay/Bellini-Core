

## Setting up a cloud server

https://www.digitalocean.com/community/tutorials/how-to-set-up-ssh-keys--2

1. `sudo apt-get update`

2. `sudo apt-get upgrade`

3. Make sure build-essential is installed
    - To check use dpkg -s build-essential
    - to install, use apt-get

4a. Make sure Node is at a proper version
    - Node -v
        - as of 6/20, 4.4.5 is current
4b. 'sudo npm install -g npm@latest'
4c. Then
    - Install ‘n’ www.github.com/tj/n
    - `sudo npm istall -g n`

(at this point, i logged off then on just to let all the apt get updates work themselves out hopefully.)

5. In /opt, we will find the the MEAN app default,

    ##### Clone asahi into /opt

    `sudo git clone https://github.com/Overplay/asahi`
        - sudo because /opt is root root 755
    - enter your github username and password

    **** when sudo git clone, asahi becomes root root.
    - i am going to change the owner to myself for now, if this works, in the future, create the asahi user here and
        have that all set up?
        - I am going to create asahi user / group now.

    - just did npm update
        - make: Entering directory `/opt/asahi/node_modules/sails-mongo/node_modules/mongodb/node_modules/kerberos/build'
            CXX(target) Release/obj.target/kerberos/lib/kerberos.o
          In file included from ../lib/kerberos.cc:1:0:
          ../lib/kerberos.h:5:27: fatal error: gssapi/gssapi.h: No such file or directory
           #include <gssapi/gssapi.h>
                                     ^
          compilation terminated.
          make: *** [Release/obj.target/kerberos/lib/kerberos.o] Error 1
          make: Leaving directory `/opt/asahi/node_modules/sails-mongo/node_modules/mongodb/node_modules/kerberos/build'
          gyp ERR! build error
          gyp ERR! stack Error: `make` failed with exit code: 2
          gyp ERR! stack     at ChildProcess.onExit (/usr/lib/node_modules/npm/node_modules/node-gyp/lib/build.js:276:23)
          gyp ERR! stack     at emitTwo (events.js:87:13)
          gyp ERR! stack     at ChildProcess.emit (events.js:172:7)
          gyp ERR! stack     at Process.ChildProcess._handle.onexit (internal/child_process.js:200:12)
          gyp ERR! System Linux 3.13.0-85-generic
          gyp ERR! command "/usr/bin/nodejs" "/usr/lib/node_modules/npm/node_modules/node-gyp/bin/node-gyp.js" "rebuild"
          gyp ERR! cwd /opt/asahi/node_modules/sails-mongo/node_modules/mongodb/node_modules/kerberos
          gyp ERR! node -v v4.4.5
          gyp ERR! node-gyp -v v3.3.1
          gyp ERR! not ok
    - still did 'sudo npm install -g sails'


6. update asahi dependencies
    - `sudo npm install -g sails`
    //- `sudo npm update`

7. add the `local.js` file to config
    - vi and intert or whatever floats yo boat!

8. run bower update in /assets for uiapp to work
    - 'bower update'


-----------------
at this point, the app runs properly.
-----------------


    // - `sudo bower update --allow-root`
    /* - TODO find the right way to do this
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

            */


     - BOWER IS FIXED




~~~~~~
next step, get asahi to be able to run everything properly
~~~~~~~~
        - create user, log in as them and sails lift, figure out what needs to be changed in permissions
        - just doing this, sails runs, but npm does not update
            - cgrigsby does though. gonna change the permissions of asahi to 775 and make the user/group asahi
                - add cgrigsby to asahi too

            ** npm had to be updated to the latest to fix some permissions stuff
            - still some node modules were owned by cgrigsby and in cgrigsby so once they were chowned and chgrpd then
                asahi was able to npm update
                :)
                - also bower update runs !


9. Create asahi user and group
    - `sudo !!!!useradd!!!! asahi`
         - does not add a home directory
         *EDIT* USE adduser for pm2 to run properly on asahi
            - need the home directory

10. Add yourself to the asahi group
    - sudo usermod -a -G asahi username

chmod -R 775 asahi

11. chown and chgrp -R asahi asahi
    - from now on, run npm and bower from asahi account, it will all run properly

12. install pm2
    - sudo npm install -g pm2 (As your user)
    - test run with asahi
        - pm2 start app.js
        works :)


TODO finish the pull and stuff to update the app


http://pm2.keymetrics.io/docs/tutorials/pm2-nginx-production-setup might wanna do this instead.
13. NGINX
    - http://devnull.guru/deployment-of-a-sane-app-part-2-adding-an-nginx-reverse-proxy/
    -

   ONCE installed
   'server {
       listen          80;
       server_name     sailsjs.dev;

       location / {
           proxy_pass http://localhost:1337;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }'
   create a file in /etc/nginx/sites-available with the above
   sym link it to /etc/nginx/sites-enabled and remove default

   add
   '
           upstream sails_server {
                   server 127.0.0.1:1337;
                   keepalive 64;
           }


           server {
                   listen        80;
                   server_name   example.com;

                   location / {
                           proxy_pass                          http://sails_server;                        proxy_http_version                  1.1;
                           proxy_set_header  Connection        "";
                           proxy_set_header  Host              $http_host;
                           proxy_set_header  X-Forwarded-For   $proxy_add_x_forwarded_for;
                           proxy_set_header  X-Real-IP         $remote_addr;
                   }

           }

   '

    to context in /etc/nginx/nginx.conf

    test out by running
    sudo nginx

    works!




PM2 autoreloading
https://github.com/pm2-hive/pm2-auto-pull/blob/master/app.js

http://pm2.keymetrics.io/docs/usage/deployment/
trying to deploy remotely from my local machine
install pm2



in a directory of my choosing
pm2 ecosystem
set up with server ip and user and git repo
make sure to set up ssh key for the user

got the deploy setup working but
                                Coles-MBP:deploy cole$ pm2 deploy ecosystem.json production
                                 --> Deploying to production environment
                                 --> on host 104.131.145.36
                                 Not a git repository
                                 To compare two paths outside a working tree:
                                 usage: git diff [--no-index] <path> <path>

                                   commit or stash your changes before deploying

                                 Deploy failed

     This deploy failed because the directory being deployed from must be a repo. This is just a bug in pm2-deploy

     ** need to edit develop and production in ecosystem and change post deploy commands
     ** depoly wants ecosystem file on branch too

     * had to change permissions of opt to be in the asahi group and make it 775
****** LOCAL JS FILE *********
     post deploy
        - npm update
        - cd assets && bower update
        - LOCAL JS
        - make sure that pm2-auto update is on TODO
        - start or restart the server
        - change permissions and ownership on files? should be fine if just deploying with asahi user

cgrigsby@Asahi-0:/opt$ sudo chgrp -R asahi prod
cgrigsby@Asahi-0:/opt$ sudo chmod -R 775 prod


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




SOOO,

the user asahi will be running the application, so pm2 needs to be installed on their account.

Originally, i created asahi without a home directory, but pm2 relys on '/home/asahi/.pm2'

soooo removed asahi and re added with home directory