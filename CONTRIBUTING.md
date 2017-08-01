# Contributing to RDX

:boom: Thanks for the taking the time to contribute! :boom:

## Summary
Create React applications fast with one command. RDX takes a DRY approach and keeps out the extra cruft in configurations. What makes RDX different is it allows you to use HTML files as WebPack entry points so that you can just build React applications like you would build normal web apps. This allows for metadata, embedded images, and code module declarations to reside in the HTML.

## How to Contribute

### Reporting bugs
Oh no! Unfortunately, a part of the development process is the existence of :bug::bug::bug:. Help us make RDX better by creating a new issue. Please include the following information in your issue:

* Got the latest RDX master version?
* What were the steps to reproduce it?
* What is the outcome?
* What was the expected outcome?
* Did it work in previous versions?

Your keen eye is very much appreciated.

### Suggest future improvements
Got an idea to make RDX even cooler? We would :heart: to hear it! Create a new issue and let us know your million dollar idea - if it's within RDX's goals it will be included in our road map. Welcome to our excellent adventure!

### Guidelines
:raised_hands: We are happy to hear that you want to take the plunge and get your hands dirty with the code. Here are some guides to help get your code into RDX.

#### JavaScript
You're in luck, there's an eslint file to help aid in JavaScript styles. If you are using WebStorm you can autoformat based on the eslint file, if you are using another IDE (like Atom) many of them have linting packages (linter-eslint for Atom) that uses the project's eslint file.

#### Commits
Commit messages are loosely based on AngularJS commit styles.
```
<type>: (<subject>) <Action>
```

`Type` can be:
* feat: ()
* fix: ()
* doc: ()
* style: ()
* refactor: ()
* test: ()
* chore: ()

`subject` is what the code change affects i.e. Compile, Serve, README or App. It can be omitted as well, if nothing fits the commit.

`Action` should be in the present tense i.e. Add not Added. Also try to be succinct and descriptive as possible.

```bash
git commit -m "fix: (MyClass someFunction) Add in validation. Fix #21"
```

#### Pull Requests
1. [Fork the project](https://help.github.com/articles/fork-a-repo/)
2. Clone it locally once you are in your directory

  ```bash
  # Clone with SSH
  git clone git@github.com:<your-username>/rdx.git

  # Clone with HTTPS
  git clone https://github.com/<your-username>/rdx.git
  ```
3. Set up a remote called upstream to the original repo at Resist Design
  ```bash
  # For SSH
  git remote add upstream git@github.com:resistdesign/rdx.git

  # For HTTPS
  git remote add upstream https://github.com/resistdesign/rdx.git
  ```
4. Create a new branch for your work off of master. Short descriptive names for branches are always welcomed.
  ```bash
  git checkout -b <branch-name>
  ```
5. If it's been a while since you updated your fork, please checkout master and pull latest changes on upstream then merged onto your branch.
  ```bash
  git checkout master
  git pull upstream master
  git checkout <branch-name>
  git merge master
  ```
6. When you are done with your changes push up your <branch-name> to your fork.
  ```bash
  git push origin <branch-name>
  ```
7. Open a pull request with a short title and a good description.

That's it!
