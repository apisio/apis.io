# APIs.io

[APIs.io](http://apis.io) is an experimental API Search service to help discover APIs on the web.

The service uses the [APIs.json](http://apisjson.org) proposed discovery format. To find APIs type in the box.

To get listed follow the instructions in the FAQ and get and give us feedback!

## Stack

This project is build using [Meteor](http://meteor.com). Meteor is a framework  to build web and mobile apps in pure Javascript.

## Install your own locally

1. Install Meteor as described [here](https://www.meteor.com/install)
2. Clone repo locally
```
git clone git@github.com:apisio/apis.io.git
cd apis.io
```
3. Rename `settings_tpl.json` into `settings.json` and change placeholders values with your own
4. Launch meteor `meteor --settings settings.json`
5. Go to `http://localhost:3000/apis/add` and submit the sample data from [API Evangelist](http://apievangelist.com) with URL `http://localhost:3000/samples/evangelist/apis.json`

You will now have one API listed from one Maintainer.

## Deploy
To deploy your own version of APIs.io is very easy, they are several platform to host Meteor apps.
### On Scalingo
[Scalingo](http://scalingo.com) is a new Heroku-like service coming from Europe, really easy to use and free up to 3 apps.
1. Create an account on [Scalingo](http://scalingo.com).
2. Install scalingo command line tool [link](http://cli.scalingo.com/)
3. Login in your scalingo account with the CLI `scalingo login`
4. Create a new app `scalingo create NAME_OF_MY_APP`
This will create a new app on Scalingo and add a new remote on your git repo.
5. Meteor needs a MongoDB instance, add it to your scalingo app `scalingo -a NAME_OF_MY_APP addons-add scalingo-mongodb free`
6. Deploy your app with `git push scalingo master`, your app should now be available at `NAME_OF_MY_APP.scalingo.com`

## On Modulus
coming

## Anywhere
Check tutorials on how to deploy Meteor apps anywhere with tools like [demeteorizer](http://blog.modulus.io/demeteorizer)

## Understanding Collections
This project uses 3 Meteor collections:
+ APIFiles, to store all info from an `apis.json` file
+ APIs, to store individual APIs described in an APIFile
+ Maintainers, to store info about Maintainers

## APIs.io's API
APIs.io has it own API and the documentation could be found [here](http://apis.io/apiDoc) this let you search for APIs, submit a new APIs.json file and get info about maintainers.

The API is monitored using [3scale](http://3scale.net) API management platform, you are free to use another solution to monitor activity.

Code for the API could be found under `/server/api`

## Contribute
+ Interested by discussions around APIs.json spec?
  + Contribute to the google group https://groups.google.com/forum/#!forum/apisjson
  + Make pull request to the repo https://github.com/api-commons/api-json

+ Interested by contributing to APIs.io project?
   + Submit issues https://github.com/apisio/apis.io/issues
   + Fork it and make pull request :)
