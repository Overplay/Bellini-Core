/**
 *
 * GitHub settings for implementing the GitHub update Webhook
 * 
 * The assumption is that the remote is on "origin" and has been set up already
 * and that a deploy key for this repo has been installed for the nodeserver
 * for this repo.
 *
 */

module.exports.github = {

    repository: 'git@github.com:Overplay/bellini-Core.git',
    
    //Comment this guy out to autodetect
    branch: 'master',
    
    //Add folders to run npm update and bower update in
    updateNpms: [ './' ],
    updateBower: ['./assets']

};