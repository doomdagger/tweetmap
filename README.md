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

> Bonus: Use ElasticSearch’s (Links to an external site.) or CloudSearch’s (Links to an external site.) geospatial
feature that shows tweets that are within a certain distance from the point the user clicks on the map. 

## Connect Dynamodb and Elastic search using Logstash

Our application will keep fetching data from twitter using its streaming API. Then we forwards these data directly to Dynamodb.
We need Logstash as a channel to transfer data from dynamodb to elastic search. Followings are the configuration steps.

### How to install Logstash

```bash
# install rvm with jruby first, jruby need JDK
gpg --keyserver hkp://keys.gnupg.net --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3
\curl -sSL https://get.rvm.io | bash -s stable --ruby=jruby

# make it work
vim ~/.bash_profile
# add the following line
source ~/.profile

# use jruby as our default ruby platform
rvm use jruby-1.7.19

# download logstash, we should download logstash with version >= 1.4.X, <= 2.X
curl -O https://codeload.github.com/elastic/logstash/tar.gz/v1.5.3
tar zxvf v1.5.3

# change your logstash root folder's name to logstash
mv some_name logstash
cd logstash

# bootstrap logstash (for version >= 1.5.X, for detail, refer here https://github.com/elastic/logstash#developing)
rake bootstrap
```

> To install logstash-input-dynamodb plugin, refer [here](http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Tools.DynamoDBLogstash.html#Tools.DynamoDBLogstash.Setup)
There are some errors on aws help page: we should add `gem "logstash-input-dynamodb", "1.0.0", :path => "<full path to plugin directory>"` at the bottom of the `Gemfile` in the Logstash
directory, instead of `"logstash-input-dynamodb", "1.0.0", :path => "<full path to plugin directory>"`. 

In order to stream data to **aws** elasticsearch, I recommend [this output plugin](https://github.com/awslabs/logstash-output-amazon_es).

### The configuration file for Logstash

```conf
input {
    dynamodb {endpoint => "dynamodb.us-west-2.amazonaws.com"
    streams_endpoint => "streams.dynamodb.us-west-2.amazonaws.com"
    view_type => "new_image"
    aws_access_key_id => "<your_own_key_id>"
    aws_secret_access_key => "<your_own_key>"
    table_name => "Tweets"
    log_format => "json_drop_binary" }
}
filter {
    json {
        source => "message"
        remove_field => ["message"]
    }
}
output {
   amazon_es {
        hosts => ["search-hulala.us-west-2.es.amazonaws.com"]
        region => "us-west-2"
        aws_access_key_id => "<your_own_key_id>"
        aws_secret_access_key => "<your_own_key>"
        index => "tweets-%{+YYYY.MM.dd}"
    }
    stdout { }
}
```

### The template file for Elasticsearch

```json

```