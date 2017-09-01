# Crystal Gazer
![Travis](https://travis-ci.org/vgaltes/CrystalGlazer.svg?branch=master)

Crystal Gazer is an application to gather social information about your code. With Crystal Gazer you'll be able to detect hidden dependencies, plan your next refactor or fight against the Conway's law.

Crystal Gazer is based on [Adam Tornhil](https://twitter.com/AdamTornhill)'s work. So please, buy his [book](https://www.amazon.co.uk/Your-Code-Crime-Scene-Bottlenecks/dp/1680500384), check his software forensics [online tool](https://codescene.io/) and check [Code Maat](https://github.com/adamtornhill/code-maat), the tool that Crstal Gazer is inspired in.


## How it works
Crystal Gazer gathers information from your code repository. The majority of the studies are done working with the Git log file. It only supports Git and I don't have plans to add support for other VCS's in the short term. The first time you run a Crystal Gazer command in a repository it will create a .cg folder with two files inside: a log file that is just the result of calling the git log command and a ignore file where you can specify the extensions you want to exclude from the study. When gathering information about the evolution of the complexity of a file, it goes to your remote repo to get the contents of the file in a given commit. To be able to do that, you need to have access to the repo.

# Installation

Install Crystal Glazer from NPM

```
npm install -g crystalgazer
```

Crystal Gazer uses [blessed-contrib](https://github.com/yaronn/blessed-contrib). Windows users, follow the [pre-requisites](http://webservices20.blogspot.co.uk/2015/04/running-terminal-dashboards-on-windows.html)

# Initialisation
In order to create the files needed for Crystal Gazer to work you can run the following command

```
crystalgazer init test -w "./RepoFolder"
```
where:
- test: is the name of the configuration. You can create different configurations for the same repository.
- '-w "./RepoFolder": it's an optional parameter that indicates the working folder. Use it if you are running Crystal Gazer from the outside of your repo root folder.

You don't need to explicitly call the init command. Every Crystal Gazer command calls it internally.

This will create a folder called .cg in your repo. Make sure to add it into your .gitignore file.

## Ignoring files
You'll probably want to exclude some files from the study. You can exclude files with a certain extension using the <configuration_name>.ignore file inside the .cg folder. You just need to add a line for each extension you want to exclude (just the extension, without the point);

## Mapping authors
Sometimes we can find the same person with different names in the git log file. You can setup a mapping between authors names using the <configuration_name>.authors file inside the .cg folder. You just need to add a line for each map you want to define. The line has to have the format `original_name->replacement_name` (without any space between the names and the arrow).

## Available commands

A part from the init command we've just explained you can run the following commands:

### Number of commits

```
crystalgazer numberOfCommits test -w "./RepoFolder"
```

where:
- test: is the name of the configuration.
- '-w "./RepoFolder": it's an optional parameter that indicates the working folder.

This will show you the number of commits you've made to the repository.

### Number of files changed

```
crystalgazer numberOfFilesChanged test -w "./RepoFolder"
```

where:
- test: is the name of the configuration.
- '-w "./RepoFolder": it's an optional parameter that indicates the working folder.

This will show you the number of changes that have been committed. For example, if you have two commits with the same two files committed in both commits, the number of files changed will be 4.

### Files by type

```
crystalgazer filesByType test -w "./RepoFolder"
```

where:
- test: is the name of the configuration.
- '-w "./RepoFolder": it's an optional parameter that indicates the working folder.

This will show you a list of extensions with the number of files that exist (or existed) with that extension. It doesn't reflect the current state of the repo, but the whole story. So, if you commited a file named aFile.js and you deleted it later, that file will count in the files with js extension.

### Authors

```
crystalgazer authors test -w "./RepoFolder"
```

where:
- test: is the name of the configuration.
- '-w "./RepoFolder": it's an optional parameter that indicates the working folder.

This will show you a list of the people that has committed something to the repo.

### Revisions by file

```
crystalgazer revisionsByFile test -w "./RepoFolder"
```

where:
- test: is the name of the configuration.
- '-w "./RepoFolder": it's an optional parameter that indicates the working folder.

This will show you an ordered list of the files with more revisions. You'll be able to spot the files with more chances to have bugs.

### Lines by file

```
crystalgazer linesByFile test -w "./RepoFolder"
```

where:
- test: is the name of the configuration.
- '-w "./RepoFolder": it's an optional parameter that indicates the working folder.

This will show you an ordered list of the files with more lines. The bigger the file, the bigger the chances to have a bug and/or to deserve a refactoring.

### Authors by file

```
crystalgazer authorsByFile test -w "./RepoFolder"
```

where:
- test: is the name of the configuration.
- '-w "./RepoFolder": it's an optional parameter that indicates the working folder.

This will show you an ordered list of the files with more authors. The bigger the number of people contributing to a file, the bigger the chances to have a bug and/or to deserve a refactoring.

### Complexity over time

```
crystalgazer complexityOverTime test "src/a/folder/aFile.cs" -w "./RepoFolder"
```

where:
- test: is the name of the configuration.
- "src/a/folder/aFile.cs": the path of the file we want to study.
- '-w "./RepoFolder": it's an optional parameter that indicates the working folder.

This will show you two line charts with the evolution of the number of lines and the maximum number of tabs of a given file.

### Coupling

```
crystalgazer coupling test -w "./RepoFolder" -n 10 -t 5
```

where:
- test: is the name of the configuration.
- '-w "./RepoFolder": it's an optional parameter that indicates the working folder.
- '-n 2': it's an optional parameter that indicates the number of items to display.
- '-n 5': it's an optional parameter that indicates the minimum number of times a file has to have been commited in order to be able to be considered.

This will show you an ordered list of the files that have been committed together more times. You'll be able to spot hidden dependencies. We're displaying 40 elements.