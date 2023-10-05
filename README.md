## Summary
This is an application to run a send a bulk email set. The frontend has an input box where you can add the number of emails you want to send and trigger it with a button click. You can see the status of the email sets listed.

### How to set things up
---
Please clone the application and go to the root folder
```
git clone git@github.com:shonjs/batch-emailer.git && cd batch-emailer
```

The application with its env values are available in the docker-compose.yml file at the root folder. You can setup the application by running :
```
./run.sh up
```
Alternatively you can also run with the docker-compose commands if you want more options
```
docker-compose up
```
You might need to wait a little for everything to get setup.
Once the application is up, you would see a message say that the "backend is ready to listen calls"

To turn down the application you can run
```
./run.sh down
```

### Use the application
---
Once everything is setup. You can go to ```localhost:3000``` on your browser, where you can access the page to send emails.
