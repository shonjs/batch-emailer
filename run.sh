#!/bin/bash

if [[ $1 == "up" ]]
then
    docker-compose up --build
elif [[ $1 == "down" ]]
then
    docker-compose down --remove-orphans
else
    echo "start.sh COMMAND"
    echo
    echo "COMMANDS:"
    echo "up - start docker environment"
    echo "down - stop docker environment and remove containers"
fi