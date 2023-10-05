#/bin/bash

/opt/bitnami/kafka/bin/kafka-topics.sh --create --if-not-exists --topic $TOPIC_NAME --bootstrap-server kafka:9092 --partitions 5
echo "topic $TOPIC_NAME was created"