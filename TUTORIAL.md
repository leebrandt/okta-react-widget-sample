# Build a React Application with User Authentication
React has quickly become one of the most favored front-end web frameworks. It is second only to plain old HTML5, [according to JAXenter](https://jaxenter.com/technology-trends-2017-top-frameworks-131993.html). So it’s no surprise that developers are learning it, and employers are asking for it.

In this tutorial, you’ll start with a very simple React app with a couple of pages and some routing built in, but not much more, and you’ll add authentication to it using [Okta’s Sign-In Widget](http://developer.okta.com/code/javascript/okta_sign-in_widget). The Sign-In Widget is an embeddable Javascript widget that allows developers to use Okta’s secure, scalable architecture with a minimum of effort from within React applications. Let’s get started!
## Get the Simple React Seed Project
Start by cloning the simple React seed project.

```bash
git clone https://github.com/leebrandt/simple-react-seed.git okta-react-widget-sample
cd okta-react-widget-sample
npm install
npm start
```
When you open `http://localhost:3000`, you should see something like this:

 ![Running Seed](static/React-Simple-Seed-Screener.png)

When you click on the navigation links, you should see page placeholders for those links.
## Add the Okta Sign-In Widget
Install the [Okta Sign-In Widget](https://github.com/okta/okta-signin-widget) using NPM. We’ll be using version 1.9.0 of the Sign-In Widget, which is the most recent version at the time of this writing. Note that [using Yarn won't work](https://github.com/okta/okta-signin-widget/issues/191).

```bash
npm install @okta/okta-signin-widget@1.9.0 --save
```

This will add the Okta Sign-In Widget code to your `node_modules` folder.

![Okta in node_modules](static/Okta-Widget-NPM-Modules-Screener.png)

Then add the styles for the widget to you `index.html` file from the Okta CDN:

```html
    <link
      href="https://ok1static.oktacdn.com/assets/js/sdk/okta-signin-widget/1.9.0/css/okta-sign-in.min.css"
      type="text/css"
      rel="stylesheet"/>
    <!-- Theme file: Customize or replace this file if you want to override our default styles -->
    <link
      href="https://ok1static.oktacdn.com/assets/js/sdk/okta-signin-widget/1.9.0/css/okta-theme.css"
      type="text/css"
      rel="stylesheet"/>
```

## The LoginPage Component
You'll first create a folder called `auth` in the `./src/components` folder, then you'll create a file called `LoginPage.js` where your `LoginPage` component will go.

Let’s start with the most basic of components

```js
import React from 'react';

export default class LoginPage extends React.Component{
  render(){
    return(
      <div>Login Page</div>
    );
  }
}
```

This little component doesn't *do* much but at least you now have a handle to add the `LoginPage` to your routing. So in your `./src/app.js` file, you'll import the component with:

```js
import LoginPage from './components/auth/LoginPage';
``` 
and then add the route inside the main route (the one with the path of "/")
```js
<Route path="/login" component={LoginPage}/>
```
## Add the OpenID Connect Application in Okta
In order to *use* Okta as your OpenID Connect provider for authentication, youll need to set up an application in the [Okta developer portal](http://developer.okta.com/).

So log in to your Okta account, [or create one]http://developer.okta.com] if you haven’t yet. Navigate to Admin > Add Applications and click on the Create New App button. Select Single Page App (SPA) for Platform and OpenID Connect for the sign on method. Click the Create button and give your application a name. On the next screen, add `http://localhost:3000` as a Redirect URI and click Finish. You should see settings like the following.

![OIDC Application Settings](static/Okta-Developer-Portal-OIDC-App-Screener.png)

Make note of the `Client ID` (yours shouldn't be blurred out) and make note of your Dev ID (it's the number part of your subdomain of the URL) So if you are at https://dev-1234-admin.oktapreview.com/... your Dev ID is 1234. 

Now that you have that, you can setup the widget to talk to your new app!
## Add the Widget to Your Component
```js
import React from 'react';
import OktaSignIn from '@okta/okta-signin-widget';

export default class LoginPage extends React.Component{
  constructor(){
    super();
    this.widget = new OktaSignIn({
      baseUrl: 'https://dev-[dev id].oktapreview.com',
      clientId: '[client id]',
      redirectUri: 'http://localhost:3000',
      authParams: {
        responseType: 'id_token'
      }
    });
  }

  render(){
    return(
      <div>Login Page</div>
    );
  }
}
```

Thus far you've imported the `OktaSignIn` function from the [Okta Sign-In Widget](https://github.com/okta/okta-signin-widget) `npm` module you installed earlier. Then, in the constructor of the component, you’ll initialize an instance of `OktaSignIn` with the configuration for the application. This way, the application code will be able to talk to Okta and Okta will recognize that this is the app you just created.
## Show The Login Widget
Next, you’ll create the code to actually render the Sign-In Widget to the page! You'll need to change your render method to create an HTML element you can render the widget into. Then, add a `componentDidMount` function to make sure you don't try to render the widget before the HTML element is on the page.

```js
import React from 'react';
import OktaSignIn from '@okta/okta-signin-widget';

export default class LoginPage extends React.Component{
  constructor(){
    super();
    this.state = {user:null};
    this.widget = new OktaSignIn({
      baseUrl: 'https://dev-[dev id].oktapreview.com',
      clientId: '[client id]',
      redirectUri: 'http://localhost:3000',
      authParams: {
        responseType: 'id_token'
      }
    });
  }

  componentDidMount(){
    this.widget.renderEl({el:'#okta-login-container'},
      (response) => {
        this.setState({user: response.claims.email});
        this.widget.remove();
      },
      (err) => {
        console.log(err);
      }
    );
  }

  render(){
    return(
      <div id="okta-login-container" />
    );
  }
}
```
You also added state to your component. If you're using a flux implementation, this would naturally come from the app state. But to keep this tutorial simple, let your `LoginPage` keep track of it's own state.
## Check Whether the User is Logged In
You don't necessarily want to render the widget right away. You'll need to add a check to make sure the user isn't already logged in, and move your `renderEl` out to a function called `showLogin`. 

```js
 // ...other stuff removed for brevity's sake
 componentDidMount(){
    this.widget.session.get((response) => {
      if(response.status !== 'INACTIVE'){
        this.setState({user:response.login});
      }else{
        this.showLogin();
      }
    });
  }

  showLogin(){
    Backbone.history.stop();
    this.widget.renderEl({el:'#okta-login-container'},
      (response) => {
        this.setState({user: response.claims.email});
        this.widget.remove();
      },
      (err) => {
        console.log(err);
      }
    );
  }
```
>*You might have noticed a weird bit of code in that `showLogin` method. That first line: `Backbone.history.stop()`. The widget itself uses [Backbone.js]() to navigate between its own screens (login, forgot password, etc.), and when it renders, it starts the `Backbone.history`. Since you've now moved it out into a `showLogin` function, the widget is going to re-render whenever the function is called. So this is just a little trick to tell Backbone to stop the history, because it’s going to restart when the widget is rendered.*
## The Final LoginPage React Component
Let's wrap this up. Make sure you bind the class's `this` context to each of your methods. Add a `logout` method, and change your `render` method to make a decision on what to render, based on whether there is a currently logged in user.

So the final version of `LoginPage.js` should look like this.

```js
import React from 'react';
import OktaSignIn from '@okta/okta-signin-widget';

export default class LoginPage extends React.Component{
  constructor(){
    super();
    this.state = { user: null };
    this.widget = new OktaSignIn({
      baseUrl: 'https://dev-[dev id].oktapreview.com',
      clientId: '[client id]',
      redirectUri: 'http://localhost:3000',
      authParams: {
        responseType: 'id_token'
      }
    });

    this.showLogin = this.showLogin.bind(this);
    this.logout = this.logout.bind(this);
  }

  componentDidMount(){
    this.widget.session.get((response) => {
      if(response.status !== 'INACTIVE'){
        this.setState({user:response.login});
        this.widget.remove();
      }else{
        this.showLogin();
      }
    });
  }

  showLogin(){
    Backbone.history.stop();
    this.widget.renderEl({el:'#okta-login-container'}, 
      (response) => {
        this.setState({user: response.claims.email});
      },
      (err) => {
        console.log(err);
      }
    );
  }

  logout(){
    this.widget.signOut(() => {
      this.setState({user: null});
      this.showLogin();
    });
  }

  render(){
    return(
      <div>
        {this.state.user ? (
          <div className="container">
            <div>Welcome, {this.state.user}!</div>
            <button onClick={this.logout}>Logout</button>
          </div>
        ) : null}
        {this.state.user ? null : (
          <div id="okta-login-container" className="login" />
        )}
      </div>
    );
  }
}
```
## Check It Out
When you run the app now (with `npm start`), you should see something like this:

![Finished Sample](static/Finished-Sample-Screener.gif)

If it works - congrats! If it doesn't, please post a question to Stack Overflow with an [okta tag](http://stackoverflow.com/questions/tagged/okta), or hit me up on Twitter [@leebrandt](https://twitter.com/leebrandt).
## Known Issues
There is one known issue in this tutorial. The widget's CSS takes over the whole page and will override your app's CSS. This is a [documented issue](https://github.com/okta/okta-signin-widget/issues/126) and you can see [Matt Raible's comment on it](https://github.com/okta)
## React + Okta
You can find a completed version of the application created in this blog post [on GitHub](https://github.com/leebrandt/okta-react-widget-sample). 

Building authentication in an application is hard. It’s even less fun to build it over and over again in each application you build. Okta does the hard part for you and makes it a lot more fun to be a developer! [Sign up for a forever-free developer account](https://www.okta.com/developer/signup/) and try Okta today!

I hope you’ve enjoyed this quick tour of our React support. If you have questions about Okta’s features, or what we’re building next, please hit me up on Twitter [@leebrandt](https://twitter.com/leebrandt), leave a comment below, or open an issue on GitHub. 