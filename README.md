# BELLINI-CORE: 2nd Gen Cloud Service based on Original Asahi





#Moving Bordeaux Enhancements Over
1. Make sure the user-auth.service.js is moved from Bordeaux.
2. In the routes file, make sure the `withUserResolve` function is available.
3. For the initial `redirectController` make sure the above resolver is used to pass a resolved user to the redirectController:
```$xslt
.state( 'welcome', {
            url:   '/',
            views: buildCompleteView( {
                template:   '<og-spinner></og-spinner>',
                controller: 'redirectController'
            } ),
            resolve: withUserResolve()

        } )
```
4. Make sure `redirectController` uses the resolved user instead of fetching, yet again from the service directly.
5. Get rid of `user-auth.service.js` dependency in `user.service.js` as this is circular with the changes to Bourdeaux.
The easiest thing to do is to just copy the user.service.js. It has everything needed and more.


#OLD STUFF

Waterlock is a nice start towards handing authentication for a Sails.js app, but it still requires the user do a lot
of work such as: policies, login pages, password reset pages, etc.

Installation:

1. Clone repo

2. `cd` into folder then `npm install`

3. There will be some "bowery" stuff to do, but we'll make a Grunt task for that later, for now just run `bower update`
where needed.


Structure Notes
---------------

1. The usual Grunting of `assets` to `.tmp` is turned off. I like to really know how my stuff is going together and this
   is particularly important when using AngularJS. Assets is served directly as the root of the webserver.
   <br>
2. EJS templates are used as the "index.html" of SPA Angular apps. So for example, the UI is bult from `views/ui` by
    merging the uilayout.ejs with uiapp.ejs. These files use EJS includes to grab JS and CSS dependencies from `views/partials`.
    These dependencies live in `assets/**`. 
    <br>
3. Login, Logout and Password reset all have their own EJS templates in `views/users`.
    <br>
