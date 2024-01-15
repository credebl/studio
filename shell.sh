#!/bin/bash

LOG_FILE="/home/ec2-user/config/token/container_tokens"
LOGGED_TOKENS="/home/ec2-user/config/token/logged_tokens.txt"

# Function to check if the token is already logged
is_token_logged() {
    token="$1"
    if grep -q "$token" "$LOGGED_TOKENS"; then
        return 0  # Token is logged
    else
        return 1  # Token is not logged
    fi
}

# Function to extract token and store it in the log file
extract_token() {
    container_id="$1"
    container_name=$(docker inspect --format '{{.Name}}' "$container_id" | sed 's/\///g')
    service_port=$(echo "$container_name" | awk -F'-' '{print $(NF-1)}')
    service_name=$(echo "$container_name" | awk -F'-' -v OFS="-" '{$(NF-1)=""; print}' | sed 's/-$//')

    token=$(docker logs "$container_id" 2>&1 | grep -o -P '(?<=token )[^ ]+' | head -n 1)

    if [ -n "$token" ]; then
        if ! is_token_logged "$token"; then
            echo "$(date) - ${service_name}-${service_port}=${token}" >> "$LOG_FILE"
            echo "$token" >> "$LOGGED_TOKENS"
        fi
    fi
}

# Initial extraction for existing containers
container_ids=$(docker ps --format '{{.ID}}')
for id in $container_ids; do
    extract_token "$id"
done

# Continuously monitor for new containers and extract tokens
while true; do
    new_container_ids=$(docker ps --format '{{.ID}}')
    for id in $new_container_ids; do
        if ! grep -q "$id" "$LOG_FILE"; then
            extract_token "$id"
        fi
    done
    sleep 10  # Adjust the interval as needed
done
