## React Chrome Extension

### Installation

1. Clone the repository
2. In the same folder as **package.json**, run **npm i** (It is best to get the latest version of NodeJS)
3. Do a **npm run build**
4. Go to <a>chrome://extensions</a>, have the developer mode enabled and click **Load unpacked**
5. Select the **build** folder



### Writing Code

1. All the code should be written and created in **/src/components**

2. In the new file, you can use the template below

   ```react
   import React, { Component } from 'react'
   
   export default class Example extends Component {
       render() {
           return (
               <div>
                   
               </div>
           )
       }
   }
   
   ```

3. In **App.js**, first import the component, create a new route under <Switch> tag. 

   ```react
   import Example from ./components/Example.js
   ...
   ...
   <Switch>
     ...
    	// your route here
     <Route path="/yoururl" component={Example}></Route>
   </Switch>
   ```

4. Then go to **SideNav.js** in components folder, add your <Link> tag in the div.

   ```react
   <Link className="grey darken-3 waves-effect waves-light card-panel center-align" to="/yoururl">
             <span>Example</span>
   </Link>
   ```

5. Everytime you want to reflect changes on chrome extension, you have to run **npm run build**, do that.

6. Your new component should be on the side navbar, you can click it to see your component