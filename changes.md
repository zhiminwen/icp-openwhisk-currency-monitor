# Oct 4 2017

- Update the openwhisk charts to reflect the latest change from upper stream
  - Add new configuration variable for controller
  - Add api gateway and redis pods
  - Update invoker post start hook, if the docker image exists, no pull of the image

- Update the couchdb images (zhiminwen/ow-couchdb:0.2.0) for openwhisk to reset the admin password if its up running from a persistent db volume.

- For whisk functions, add extra parameters of apihost, api_key. So that it can call the base ow functions without hardcode the api host.

- Pass openwhisk apihost as a ENV parameter to the monitor nodejs app.





