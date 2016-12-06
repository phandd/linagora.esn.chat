# linagora.esn.chat

Chat component for OpenPaaS ESN.

## Install

*Note: The following instructions assumes that you have already installed OpenPaaS ESN in the path referenced by $ESN below.*

While waiting for a npm-based dependency injection handler, you have to install the Chat and Emoticon components in OpenPaaS ESN like this:

**1. Clone linagora.esn.chat and linagora.esn.emoticon**

Clone the `linagora.esn.chat` and `linagora.esn.emoticon` repositories.

```
git clone https://ci.open-paas.org/stash/scm/om/linagora.esn.emoticon.git
git clone https://ci.open-paas.org/stash/scm/om/linagora.esn.chat.git
```

Go inside OpenPaaS ESN repository:

```
cd $ESN
npm install
npm link
```

Go inside `linagora.esn.emotion` folder and run:

```
npm install
```

Go inside `linagora.esn.chat` folder and run:

```
npm link linagora-rse
npm install
```

**2. Add the modules in the OpenPaaS ESN configuration file**

You must add "linagora.esn.emoticon" and "linagora.esn.chat" in the modules section in `$ESN/config/default.NODE_ENV.json`. NODE_ENV is the environment variable used to define if the node application is running in 'production' or in 'development' (the default environment is 'development').
Copy the 'modules' array from `$ESN/config/default.json` into `$ESN/config/default.NODE_ENV.json` (`$ESN/config/default.development.json` or `$ESN/config/default.production.json`) and add the "linagora.esn.emoticon" and "linagora.esn.chat" items:

```
"modules": [
  "linagora.esn.core.webserver",
  "linagora.esn.core.wsserver",
  "linagora.esn.emoticon",
  "linagora.esn.chat"
],
```

**3. Create symbolic links**

The modules must be available in the `$ESN/modules` folder:

```
cd $ESN
ln -s path_to_emoticon modules/linagora.esn.emoticon
ln -s path_to_chat modules/linagora.esn.chat
```

## Run

Once installed, you can start OpenPaaS ESN as usual. The Chat module is available in the application grid menu.
