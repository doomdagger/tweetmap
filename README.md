# tweetmap

[![Build Status](https://travis-ci.com/doomdagger/tweetmap.svg?token=DAVuzKf3wdQT9dmxiY5f&branch=master)](https://travis-ci.com/doomdagger/tweetmap)

The goal of this assignment is to provide you experience in developing and deploying a web application using AWS Cloud
services. Your web application would collect Twitts and do some processing and represent the Twitts on GoogleMaps.
Following are the required steps:  

* Use Twitter Streaming API (Links to an external site.) to fetch tweets from the twitter hose in real-time.
* Use ElasticSearch (Links to an external site.) or AWS CloudSearch (Links to an external site.) to store the tweets on the backend
* Create a web UI that allows users to search for a few keywords (via a dropdown). The keywords (up to 10) can be of your choosing.
* Use Google Maps API  (Links to an external site.)(or any other mapping library) to render these filtered tweets in the map in whatever manner you want.
* Deploy your application on AWS Elastic Beanstalk (Links to an external site.) in an auto-scaling environment.

> Bonus: Use ElasticSearch’s (Links to an external site.) or CloudSearch’s (Links to an external site.) geospatial feature that shows tweets that are within a certain distance from the point the user clicks on the map. 

## How to runt it

```sh
# install all needed dependencies
$ npm install
# start the application
$ npm start
```

> The application by default listen on port 1222. See [config.example.js](https://github.com/doomdagger/tweetmap/blob/master/config.example.js) for details.

## Connect Dynamodb and Elastic search using Logstash

Our application will keep fetching data from twitter using its streaming API. Then we forwards these data directly to Dynamodb (use dynamodb's `ConditionExpression` to implement uinque insertion). We need Logstash as a channel to transfer data from dynamodb to elasticsearch. Followings are the configuration steps.

### How to install Logstash

We install Logstash on a EC2 instance (t2.micro) at the same region with our elastic beanstalk application.
```bash
# install rvm with jruby first, jruby need JDK
gpg --keyserver hkp://keys.gnupg.net --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3
\curl -sSL https://get.rvm.io | bash -s stable --ruby=jruby

# edit ~/.bash_profile, try to make rvm work
vim ~/.bash_profile
# add this: `source ~/.profile` at the bottom of ~/.bash_profile, then source it to make it work immediately
source ~/.bash_profile

# use jruby as our default ruby platform
rvm use jruby-1.7.19

# download logstash, we should download logstash with version between 1.4.X and 2.X
curl -O https://codeload.github.com/elastic/logstash/tar.gz/v1.5.3
tar zxvf v1.5.3

# modify its root folder's name to logstash
mv some_name logstash
cd logstash

# bootstrap logstash (for version >= 1.5.X, for detail, refer here https://github.com/elastic/logstash#developing)
rake bootstrap
```

> To install `logstash-input-dynamodb` plugin, refer to this [link](http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Tools.DynamoDBLogstash.html#Tools.DynamoDBLogstash.Setup). However, there is an error on this help page: we should add `gem "logstash-input-dynamodb", "1.0.0", :path => "<full path to plugin directory>"` at the bottom of the `Gemfile` in the Logstash directory, instead of `"logstash-input-dynamodb", "1.0.0", :path => "<full path to plugin directory>"`. 

To stream data to **AWS Elasticsearch**, I recommend [this output plugin](https://github.com/awslabs/logstash-output-amazon_es) instead of the standard elasticsearch output plugin.

### The configuration file for Logstash

```conf
# input configuration for logstash-input-dynamodb
input {
    dynamodb {
        endpoint => "dynamodb.us-west-2.amazonaws.com"
        streams_endpoint => "streams.dynamodb.us-west-2.amazonaws.com"
        view_type => "new_image"
        aws_access_key_id => "<your_own_key_id>"
        aws_secret_access_key => "<your_own_access_key>"
        table_name => "Tweets"
        log_format => "json_drop_binary" }
}
# filter configuration for logstash-filter-json
filter {
    json {
        source => "message"
        remove_field => ["message"]
    }
}
# output configuration for logstash-output-amazon_es
output {
   amazon_es {
        hosts => ["<your_es_endpoint>"]
        region => "us-west-2"
        aws_access_key_id => "<your_own_key_id>"
        aws_secret_access_key => "<your_own_access_key>"
        # create an index for each day, we can use crontab to schedule periodical tasks to
        # automatically delete old idices.
        index => "tweets-%{+YYYY.MM.dd}"
    }
    stdout { }
}
```

### The template file for Elasticsearch

Specify the custom mapping configuration.

```json
curl -XPUT https://<your_es_endpoint>/_template/template_1 -d '
{
  "template" : "tweets-*",
  "mappings" : {
    "logs" : {
      "properties" : {
        "@timestamp" : {
          "type" : "date",
          "format" : "dateOptionalTime"
        },
        "@version" : {
          "type" : "string"
        },
        "host" : {
          "type" : "string"
        },
        "location": {
          "type": "geo_shape",
          "tree": "quadtree",
          "precision": "1m"
        },
        "place_id" : {
          "type" : "string"
        },
        "text" : {
          "type" : "string"
        },
        "timestamp_ms" : {
          "type" : "double"
        },
        "tweet_id" : {
          "type" : "string"
        },
        "user_id" : {
          "type" : "string"
        },
        "user_profile_image" : {
          "type" : "string"
        },
        "username" : {
          "type" : "string"
        }
      }
    }
  }
}
'
```
### Start our Daemon

At last, we run Logstash as an deamon on a EC2 instance to keep this process still going on. I attach the init file here (only work on CentOS):

```sh
#!/bin/bash
#
# Logstash
# Written by He Li. Logstash service will offer two sub-commands: start and stop
# you need sudo to run this file, but the user owned the detached process will be
# ec2-user.

# Source function library.
. /etc/init.d/functions

# return value
RETVAL=0

# variables needed for logstash

# basic variables
prog="logstash"
logstash_user=ec2-user
logstash_dir=/home/${logstash_user}/logstash
logstash_bin=${logstash_dir}/bin/logstash
logstash_conf=${logstash_dir}/test4.conf

# newly created files
lock_file=${logstash_dir}/${prog}.lock
pid_file=${logstash_dir}/${prog}.pid
log_file=${logstash_dir}/${prog}.log

start() {
        echo -n "Starting $prog: "
        if [ -s ${pid_file} ]; then
                RETVAL=1
                echo -n "$prog is already running!" && warning
                echo
        else
                nohup ${logstash_bin} --verbose -f ${logstash_conf} --log ${log_file} >/dev/null 2>&1 &
                RETVAL=$?
                PID=$!
                [ ${RETVAL} -eq 0 ] && touch ${lock_file} && success || failure
                echo
                echo ${PID} > ${pid_file}
        fi
}

stop() {
        echo -n "Shutting down $prog: "
        if [ -s ${pid_file} ]; then
                PID=`cat ${pid_file}`
                kill -s 9 ${PID} && success || failure
                RETVAL=$?
                [ ${RETVAL} -eq 0 ] && rm -f ${lock_file} && rm -f ${pid_file}
                echo
        else
                RETVAL=1
                echo -n "$prog is not running!" && warning
                echo
        fi
}

case "$1" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        stop
        start
        ;;
    *)
        echo "Usage: $prog {start|stop|restart}"
        exit 1
        ;;
esac
exit ${RETVAL}
```

Put this file under `/etc/init.d/logstash`, and use `/etc/init.d/logstash start` to start streaming data.
