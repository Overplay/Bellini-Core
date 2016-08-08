

## Setting up a cloud server

0. https://www.digitalocean.com/community/tutorials/how-to-set-up-ssh-keys--2
    - set up an ssh key for your account so its easier to log into if you wish
    - if the ssh key login is not working, make sure that `~/.ssh` is set to 700 and `~/.ssh/authorized_keys` is set to 600 

1. run `sudo apt-get update`

2. run `sudo apt-get upgrade`

3. Make sure build-essential is installed
    - To check use dpkg -s build-essential
    - to install, use apt-get

4. Make sure Node is at a proper version
    - Node -v
        - as of 6/20/16, 4.4.5 is current
    - 'sudo npm install -g npm@latest'

5. Install n
    - this is for node version management
    - `sudo npm istall -g n`

6. Create asahi user and group
    - `sudo adduser asahi`
        - use adduser to ensure a home directory is created (it will be needed for pm2) 

7. Add yourself to the asahi group
    - `sudo usermod -a -G asahi USERNAME`

8. Set group permissions on asahi 
    - `sudo chmod -R 775 asahi`

9. Clone asahi and auto-reload into /opt, where it will be served from.
    - `sudo git clone https://github.com/Overplay/asahi`


10. Change permissions to allow asahi user to run everything properly
    - `sudo chown/chgrp -R asahi asahi`

    #### Everything should be run as asahi user from this point forward (unlesss otherwise noted) 

11. Setup the git repos 
    - Add asahi's public key to your github
    - `cd asahi`
        - git remote -v
        - git remote set-url origin git@github.com:Overplay/asahi.git
            - (https://help.github.com/articles/changing-a-remote-s-url/)
   
12. update asahi dependencies
    - `sudo npm install -g sails` (as your sudo account)    
          
13. Update node packages in  `asahi`
    - `cd` into directory then npm update 
    
14. Run bower update in /assets for uiapp to work
    - `cd /assets && bower update`
    
15. Add the `local.js` file to /config
    - vi and insert or whatever floats your boat!
    - also on /home/asahi/local.js on the current server
         - `cd /config && cp ~/local.js .`

16. ### NGINX (install as your sudo privileged user) 
    - `sudo add-apt-repository ppa:nginx/stable`
    - `sudo apt-get update`
    - `sudo apt-get install nginx`


    - ##### ONCE installed

        - create a text file `asahi` in `/etc/nginx/sites-available` with the below
                
            `upstream sails_server {
                    server 127.0.0.1:1337;
                    keepalive 64;
            }
            server {
                listen          80;
                server_name     asahi;
                location / {
                    proxy_pass http://sails_server;
                    proxy_http_version 1.1;
                    proxy_set_header Upgrade $http_upgrade;
                    proxy_set_header Connection 'upgrade';
                    proxy_set_header Host $host;
                    proxy_cache_bypass $http_upgrade;
                 }
            }`
                
        - sym link it (`ln -s`) into `/etc/nginx/sites-enabled and` `rm default`
        - `sudo nginx -s reload`

17. Install PM2 and set up Keymetrics
    - used `sudo npm install pm2@next -g` (currently on 2.0.4)
        - `$ pm2 update`
        - uh oh aut roealo dfghsd
    - set up keymetrics
        - on your keymetrics bucket, simply link by copy pasting the command at the bottom 
        - https://app.keymetrics.io

    SIDE NOTE: To ensure that the db and sessions are preserved during a restart, 
        - In `config/models.js`, set migrate to `safe` for a production server or potentially `alter` for testing (could be dangerous)
        - In `config/session.js`,  uncomment mongo settings to enable 
        - Also, if pushing for production, do NOT leave local.js `wideOpen: true`

17.2. Config urls in waterlock.js and add to .gitignore

18. Start `asahi` application 
    - `git checkout BRANCH` if you're running something other than master! (make sure it has process.json in it) 
    - `pm2 start process.json` in /opt/asahi

19. Start `auto-reload-pm2`  (as asahi user) 
    - `pm2 install auto-reload-pm2`
        - it is on the npm registry and will install automatically! 

20. Checkout http://104.131.145.36/ and see how it looks! 




-----------------
At this point, the app runs properly.
-----------------

