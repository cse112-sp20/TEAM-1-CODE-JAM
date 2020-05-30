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

3. In **App.js**, first import the component, create a new route under \<Switch> tag. 

   ```react
   import Example from "./components/Example.js"
   ...
   ...
   <Switch>
     ...
    	// your route here
     <Route path="/yoururl" component={Example}></Route>
   </Switch>
   ```

4. Then go to **SideNav.js** in components folder, add your \<Link> tag in the div.

   ```react
   <Link className="grey darken-3 waves-effect waves-light card-panel center-align" to="/yoururl">
             <span>Example</span>
   </Link>
   ```

5. Everytime you want to reflect changes on chrome extension, you have to run **npm run build**, do that.

6. Your new component should be on the side navbar, you can click it to see your component

### Edit Background.js

Background.js needs to be edited in public folder. How npm run build works is bundle everything in src folder and move the public folder into build folder.

### Testing

All tests should be written under **\__tests__** folder. Preferbably with the ***example.test.js*** naming scheme. To run test simply run **npm test**. To run a individual test, run **npm test -- example**

### Commit Guideline

The following guide line is from <a href="https://www.freecodecamp.org/news/writing-good-commit-messages-a-practical-guide/">freecodecamp</a>

```
git commit -m "Subject" -m "Description..."
```



1. **Specify the type of commit:**

- feat: The new feature you're adding to a particular application
- fix: A bug fix
- style: Feature and updates related to styling
- refactor: Refactoring a specific section of the codebase
- test: Everything related to testing
- docs: Everything related to documentation
- chore: Regular code maintenance.[ You can also use emojis to represent commit types]

2. **Separate the subject from the body with a blank line**

3. **Your commit message should not contain any whitespace errors**

4. **Remove unnecessary punctuation marks**

5. **Do not end the subject line with a period**

6. **Capitalize the subject line and each paragraph**

7. **Use the imperative mood in the subject line**

8. **Use the body to explain what changes you have made and why you made them.**

9. **Do not assume the reviewer understands what the original problem was, ensure you add it.**

10. **Do not think your code is self-explanatory**

11. **Follow the commit convention defined by your team**

An example of a commit message would be 

```
git commit -m "docs: add the commit guideline in readme" -m "The guideline in the readme serves as a unifed style for github commits. From now on, every commit should follow the guideline"
```

