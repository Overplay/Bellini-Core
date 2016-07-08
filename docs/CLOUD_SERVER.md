

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
    - still did 'sudo npm install -g sails'


6. update asahi dependencies
    - `sudo npm install -g sails`
    //- `sudo npm update`

7. add the `local.js` file to config
    - vi and insert or whatever floats your boat!

8. run bower update in /assets for uiapp to work
    - 'bower update'


-----------------
at this point, the app runs properly.
-----------------


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


//http://pm2.keymetrics.io/docs/tutorials/pm2-nginx-production-setup might wanna do this instead.
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

predeploy pm2 auto pull?

cgrigsby@Asahi-0:/opt$ sudo chgrp -R asahi prod
cgrigsby@Asahi-0:/opt$ sudo chmod -R 775 prod




pm2 auto pull is throwing an exception about Common.js or something.
- doesn't seem linked

trying remote start instead of local deploy now with process.json


pm2 autopull might be working
 at least when i checkout dev-cole then have pm2-auto-pull running


more testing is being done on pm2-auto-pull. still errors on startup with uv_cwd which means that a directory doesnt
exist most likely

also need to test post-update


pm2 auto pull kills asahi process, going to try to add restart to post update

pm2 update then pm2 start process.json
when a commit is pushed, the app is killed. I am going to write my own module based on the pm2-auto-pull and try to debug
- the app name isn't catching? idk whats going on with auto-pull right now

pm2-auto-pull-0 App %s succesfully pulled
pm2-auto-pull-0 { type: 'axm:option:configuration',
pm2-auto-pull-0   data:
pm2-auto-pull-0    { http: false,
pm2-auto-pull-0      http_latency: 200,
pm2-auto-pull-0      http_code: 500,
pm2-auto-pull-0      ignore_routes: [],
pm2-auto-pull-0      profiling: true,
pm2-auto-pull-0      errors: true,
pm2-auto-pull-0      alert_enabled: true,
pm2-auto-pull-0      custom_probes: true,
pm2-auto-pull-0      network: false,
pm2-auto-pull-0      ports: false,
pm2-auto-pull-0      module_conf: {},
pm2-auto-pull-0      module_name: 'pm2-auto-pull',
pm2-auto-pull-0      module_version: '1.1.3',
pm2-auto-pull-0      pmx_version: '0.6.2' } }
pm2-auto-pull-0 { type: 'axm:option:configuration', data: { error: true } }
pm2-auto-pull-0 { type: 'axm:option:configuration',
pm2-auto-pull-0   data:
pm2-auto-pull-0    { alert_enabled: true,
pm2-auto-pull-0      widget:
pm2-auto-pull-0       { type: 'generic',
pm2-auto-pull-0         logo: 'https://app.keymetrics.io/img/logo/keymetrics-300.png',
pm2-auto-pull-0         theme: [Object] },
pm2-auto-pull-0      isModule: true,
pm2-auto-pull-0      module_conf: {},
pm2-auto-pull-0      module_version: '1.16.0',
pm2-auto-pull-0      module_name: 'pm2-auto-pull',
pm2-auto-pull-0      description: 'PM2 module to auto pull applications when there is an update',
pm2-auto-pull-0      pmx_version: '0.6.2' } }
pm2-auto-pull-0 { type: 'axm:option:configuration', data: { error: true } }
pm2-auto-pull-0 pm2-auto-pull module connected to pm2


PM2 Starting execution sequence in -fork mode- for app name:asahi id:1
PM2 App name:asahi id:1 online
PM2 Process 1 in a stopped status, starting it
PM2 Stopping app:asahi id:1
PM2 Process with pid 21007 still not killed, retrying...
PM2 App [asahi] with id [1] and pid [21007], exited with code [0] via signal [SIGINT]
PM2 Starting execution sequence in -fork mode- for app name:pm2-auto-pull id:0
PM2 App name:pm2-auto-pull id:0 online



TODO:
- change process.json to restart the app in the post update
    - if that doesn't work, then rewrite the pm2 module and test that with some debugging



whats happening now is pm2 is pulling successfully, stopping asahi then restarting itself instead of asahi :(
- restarting asahi from keymetrics also restarts pm2-auto-pull for some reason

- trying to get some debugging stuff

-creating my own auto pull @ colegrigsby/auto-repo-reload

- forking vs clustering. trying with 2 forks of asahi for updating


current state:
    auto pull updates correctly but when restarting, it restarts itself as a process. not sure if this is from pm2 or
    if it is being caused by autopull. might have to do with the pull and reload call in pm2 to _pull. so I may try
    to call this directly if possible. might be a pull and restart?

    - might have to start auto reload from scratch at this point....

IDEA - promise chain in set interval and only take care of given processes, not all. might make it more specific.

todo pm2.connect for pm2 and calling stuff in pm2!
auto-reload2-0 0
auto-reload2-0 Did you forgot to call pm2.connect(function() { }) before interacting with PM2 ?


testing testing testing!

auto-reload pullAndReload seems to be starting the wrong app after pulling....

-getting rid of ecosystem just in case it was interfering with settings. if not, then i will post a git / redo process.json or
even write it all out manually (the pull, then exec restart) -without watch will prevent errors!
    - might still run update

    writing with vizion!!!
    err, meta duh

    trying pm2.reload but with my file instead of name.... if this works im gonna be so mad
    could have to do with pwd!
    trying restart
    pm2 is messed up i think

    - gonna have to do it with child exec probably :/

    here it goes

    soooo might have to write it as a sails hook

    - auto pull retest
    - could write my own module that also updates and restarts pm2?


-- pull and reload testing with call back.

- trying with a dev fix from pm2

- gonna be interesting with my own reload now. going to try vizion stuff again too


- auto-reload2-1 Unexpected token ILLEGAL
  auto-reload2-1 ReferenceError: EXEC_TIMEOUT is not defined
  auto-reload2-1     at exec (/usr/lib/node_modules/pm2/lib/CLI/Version.js:247:16)
  auto-reload2-1     at /usr/lib/node_modules/pm2/lib/CLI/Version.js:274:7
  auto-reload2-1     at /usr/lib/node_modules/pm2/node_modules/async/lib/async.js:181:20
  auto-reload2-1     at iterate (/usr/lib/node_modules/pm2/node_modules/async/lib/async.js:262:13)
  auto-reload2-1     at Object.async.forEachOfSeries.async.eachOfSeries (/usr/lib/node_modules/pm2/node_modules/async/lib/async.js:281:9)
  auto-reload2-1     at Object.async.forEachSeries.async.eachSeries (/usr/lib/node_modules/pm2/node_modules/async/lib/async.js:214:22)
  auto-reload2-1     at execCommands (/usr/lib/node_modules/pm2/lib/CLI/Version.js:272:11)
  auto-reload2-1     at /usr/lib/node_modules/pm2/lib/CLI/Version.js:43:13
  auto-reload2-1     at /usr/lib/node_modules/pm2/lib/CLI/Version.js:342:31
  auto-reload2-1     at /usr/lib/node_modules/pm2/node_modules/async/lib/async.js:52:16
  auto-reload2-1     at /usr/lib/node_modules/pm2/node_modules/async/lib/async.js:264:21
  auto-reload2-1     at /usr/lib/node_modules/pm2/node_modules/async/lib/async.js:44:16
  auto-reload2-1     at /usr/lib/node_modules/pm2/lib/CLI/Version.js:327:22
  auto-reload2-1     at /usr/lib/node_modules/pm2/node_modules/async/lib/async.js:52:16
  auto-reload2-1     at /usr/lib/node_modules/pm2/node_modules/async/lib/async.js:264:21
  auto-reload2-1     at /usr/lib/node_modules/pm2/node_modules/async/lib/async.js:44:16

- problem with dev on their end
https://github.com/Unitech/pm2/issues/2077

- restart call
    TypeError: Cannot read property 'only' of undefined
    auto-reload2-1     at /usr/lib/node_modules/pm2/lib/CLI.js:523:13
    auto-reload2-1     at Array.forEach (native)
    auto-reload2-1     at CLI._startJson (/usr/lib/node_modules/pm2/lib/CLI.js:522:11)
    auto-reload2-1     at CLI.restart (/usr/lib/node_modules/pm2/lib/CLI.js:1060:10)
    auto-reload2-1     at /opt/auto-reload2/app.js:140:25
    auto-reload2-1     at /opt/auto-reload2/node_modules/vizion/lib/git.js:214:16
    auto-reload2-1     at /opt/auto-reload2/node_modules/vizion/lib/git.js:192:12
    auto-reload2-1     at ChildProcess.exithandler (child_process.js:204:7)
    auto-reload2-1     at emitTwo (events.js:87:13)
    auto-reload2-1     at ChildProcess.emit (events.js:172:7)
    auto-reload2-1     at maybeClose (internal/child_process.js:827:16)
    auto-reload2-1     at Process.ChildProcess._handle.onexit (internal/child_process.js:211:5)


- reload
    - same ^^^
- with name
    - works
- testing conf
    - again

- auto reload cant git pull on /opt/asahi for some reason. looking into why ssh isn't working
- https://help.github.com/articles/changing-a-remote-s-url/ need to set to ssh for some reason ugh hahahah
    - TODO add to directions

- auto-reload-pm2 npm module :)
- had to call connect
- having to publish each time i update is fun
    - the published version isn't working hahahahahha
    - testing agian
    - works locally at least
- wow pullAndReload might work locally now too whatttt

- just gonna use locally now
    - easier until unitech gets back to me

    TODO
    - test with configured path......
        - config asahi path where permissions are correct
    - publish module once fixed DONE
    - clean up dev area of asahi and start script??
    - deploy y/n
    - test auto-reload with pullAndReload FAILED
    #### asahi overall DO stuff
    - user not working with ssh :/
    - need to fix permissions for deployment as asahi
    - nginx documentation (multiple sails applications??) figure out whats going on haha


retesting with exec ahhh this is no fun
- trying to print
- weird stuff going on
    - exec_cmd

testing pm2-auto-pull with fixes
    - still does not work. submitted issue https://github.com/Unitech/pm2/issues/2270