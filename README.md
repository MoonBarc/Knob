# Knob
A simple cli app that builds a docker image, tags it with a version, and pushes it to GitHub Packages for Docker.

Made by MoonBarc so he doesn't lose his sanity when developing for Docker.

## Docs
In order to use Knob, you must have a `Knobfile` in your current directory. A Knobfile defines things like the version, url, and authorization details.
Here's an example:
```shell
# Knobfile v0.1
# This is an example Knobfile.

# Fallback for when $ask receives no input or when using $default
SETDEFAULT 0.1

# Use $ask to get a prompt from the terminal, or fall back to the latest default set above.
VERSION $ask

# <username>: Github username <token-path>: A plain github token stored at that path.
LOGIN MoonBarc ~/GH_TOKEN.txt

# $version is replaced with the version specified.
URL docker.pkg.github.com/hypersapling/master-node/mkube-master:$version
```

There are 4 verbs so far:

`[SETDEFAULT,VERSION,LOGIN,URL]`

only Login and URL are required.

There are also 3 system variables (custom ones coming soon)
The system variables include:

`[ask,version,default]`

These need to be started using a `$` and can be put anywhere.

The ask variable is special, and will prompt the user for the value when running the Knobfile

The default variable can be changed using the `SETDEFAULT` verb.

The version variable can be changed using the `VERSION` verb.

The default variable is also the fallback value for when a user does not specify anything in an `$ask` prompt.

Make sure the Dockerfile and Knobfile are both in the root directory!


### Have fun!
