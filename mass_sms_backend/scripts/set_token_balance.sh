#!/bin/bash
# Usage: ./set_token_balance.sh <user_id> <token_type> <balance>
USER_ID=$1
TOKEN_TYPE=$2
BALANCE=$3

docker exec -it mass_sms_backend-db-1 psql -U postgres -d mass_sms -c \
"INSERT INTO user_tokens (user_id, balance, token_type) VALUES ($USER_ID, $BALANCE, '$TOKEN_TYPE') ON CONFLICT (user_id, token_type) DO UPDATE SET balance = $BALANCE;"
